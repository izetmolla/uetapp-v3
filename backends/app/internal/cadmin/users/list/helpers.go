package list

import (
	"context"
	"errors"
	"strings"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
	"gorm.io/gorm"
)

func (cc *Controller) loadAvailableRoleNames(ctx context.Context) ([]string, error) {
	var roles []models.Role
	if err := cc.app.Postgres().WithContext(ctx).
		Model(&models.Role{}).
		Order("name ASC").
		Find(&roles).Error; err != nil {
		return nil, err
	}
	out := make([]string, 0, len(roles))
	for _, role := range roles {
		name := strings.TrimSpace(role.Name)
		if name != "" {
			out = append(out, name)
		}
	}
	return out, nil
}

func roleFilterOptions(names []string) []datatable.OptionItem {
	opts := make([]datatable.OptionItem, 0, len(names))
	for _, name := range names {
		label := name
		if len(name) > 0 {
			label = strings.ToUpper(name[:1]) + name[1:]
		}
		opts = append(opts, datatable.OptionItem{
			Label: label,
			Value: name,
		})
	}
	return opts
}

func (cc *Controller) loadEditableUser(db *gorm.DB, id string) (models.User, error) {
	var user models.User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		return user, err
	}
	if user.Status == models.Deleted {
		return user, errors.New("deleted users cannot be edited")
	}
	return user, nil
}

func (cc *Controller) userNotFoundResponse(c fiber.Ctx, err error) error {
	r := cc.app.Render()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return cc.app.Api(c,
			r.WithError(errors.New("user not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}
	if err != nil && err.Error() == "deleted users cannot be edited" {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}
	return cc.app.Api(c,
		r.WithError(err),
		r.WithStatus(fiber.StatusInternalServerError),
		r.WithCode("INTERNAL_SERVER_ERROR"),
	)
}

func userToDetailResponse(user models.User) fiber.Map {
	return fiber.Map{
		"id":            user.ID,
		"first_name":    user.FirstName,
		"last_name":     user.LastName,
		"email":         user.Email,
		"username":      user.Username,
		"ldap_username": user.LdapUsername,
		"image":         user.Image,
		"status":        user.Status,
		"is_confirmed":  user.IsConfirmed,
		"roles":         rolesToStringSlice(user.Roles),
		"created_at":    user.CreatedAt,
		"updated_at":    user.UpdatedAt,
	}
}

func rolesToStringSlice(roles models.JSONBArray) []string {
	out := make([]string, 0, len(roles))
	for _, r := range roles {
		if s, ok := r.(string); ok && s != "" {
			out = append(out, s)
		}
	}
	return out
}

func hashPassword(app *config.AppClients, raw string) (string, error) {
	auth := app.Auth()
	if auth == nil {
		return "", errors.New("authorization is not initialized")
	}
	pm := auth.PasswordManager()
	if pm == nil {
		return "", errors.New("password manager is not initialized")
	}
	return pm.HashPassword(raw)
}
