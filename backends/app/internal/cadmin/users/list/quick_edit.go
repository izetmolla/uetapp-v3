package list

import (
	"encoding/json"
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

type generalUpdatePayload struct {
	FirstName    string `json:"first_name"`
	LastName     string `json:"last_name"`
	Email        string `json:"email"`
	Username     string `json:"username"`
	LdapUsername string `json:"ldap_username"`
	Image        string `json:"image"`
	Status       string `json:"status"`
}

type passwordUpdatePayload struct {
	Password        string `json:"password"`
	PasswordConfirm string `json:"password_confirm"`
	IsConfirmed     *bool  `json:"is_confirmed"`
}

type rolesUpdatePayload struct {
	Roles []string `json:"roles"`
}

func (cc *Controller) GetUserDetail(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseUserIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid user id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var user models.User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		return cc.userNotFoundResponse(c, err)
	}

	availableRoles, err := cc.loadAvailableRoleNames(c.Context())
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"user":            userToDetailResponse(user),
		"available_roles": availableRoles,
	}))
}

func (cc *Controller) UpdateUserGeneral(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseUserIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid user id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload generalUpdatePayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	updates, err := payload.toUpdates()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if len(updates) == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("no fields to update")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if _, err := cc.loadEditableUser(db, id); err != nil {
		return cc.userNotFoundResponse(c, err)
	}

	if email, ok := updates["email"].(string); ok && email != "" {
		var count int64
		if err := db.Model(&models.User{}).Where("email = ? AND id <> ?", email, id).Count(&count).Error; err != nil {
			return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		if count > 0 {
			return cc.app.Api(c, r.WithError(errors.New("email already in use")), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
		}
	}

	if username, ok := updates["username"].(string); ok && username != "" {
		var count int64
		if err := db.Model(&models.User{}).Where("username = ? AND id <> ?", username, id).Count(&count).Error; err != nil {
			return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		if count > 0 {
			return cc.app.Api(c, r.WithError(errors.New("username already in use")), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
		}
	}

	if err := db.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var user models.User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		return cc.userNotFoundResponse(c, err)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "General information updated successfully",
		"user":    userToDetailResponse(user),
	}))
}

func (cc *Controller) UpdateUserPassword(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseUserIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid user id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload passwordUpdatePayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if _, err := cc.loadEditableUser(db, id); err != nil {
		return cc.userNotFoundResponse(c, err)
	}

	updates := make(map[string]any)

	if payload.IsConfirmed != nil {
		updates["is_confirmed"] = *payload.IsConfirmed
	}

	password := strings.TrimSpace(payload.Password)
	confirm := strings.TrimSpace(payload.PasswordConfirm)

	if password != "" || confirm != "" {
		if password == "" || confirm == "" {
			return cc.app.Api(c,
				r.WithError(errors.New("password and confirmation are required")),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		if password != confirm {
			return cc.app.Api(c,
				r.WithError(errors.New("passwords do not match")),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		if len(password) < 8 {
			return cc.app.Api(c,
				r.WithError(errors.New("password must be at least 8 characters")),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		hashed, err := hashPassword(cc.app, password)
		if err != nil {
			return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		updates["password"] = hashed
	}

	if len(updates) == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("no fields to update")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if err := db.Model(&models.User{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var user models.User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		return cc.userNotFoundResponse(c, err)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Password and security settings updated successfully",
		"user":    userToDetailResponse(user),
	}))
}

func (cc *Controller) UpdateUserRoles(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseUserIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid user id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload rolesUpdatePayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if _, err := cc.loadEditableUser(db, id); err != nil {
		return cc.userNotFoundResponse(c, err)
	}

	roles, err := parseRolesList(payload.Roles)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	roleBytes, err := json.Marshal(roles)
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	if err := db.Model(&models.User{}).Where("id = ?", id).Update("roles", roleBytes).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var user models.User
	if err := db.Where("id = ?", id).First(&user).Error; err != nil {
		return cc.userNotFoundResponse(c, err)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Roles updated successfully",
		"user":    userToDetailResponse(user),
	}))
}

func (p generalUpdatePayload) toUpdates() (map[string]any, error) {
	firstName := strings.TrimSpace(p.FirstName)
	lastName := strings.TrimSpace(p.LastName)
	email := strings.TrimSpace(p.Email)
	if firstName == "" || lastName == "" || email == "" {
		return nil, errors.New("first name, last name, and email are required")
	}

	status, err := normalizeQuickEditStatus(p.Status)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"first_name":    firstName,
		"last_name":     lastName,
		"email":         email,
		"username":      strings.TrimSpace(p.Username),
		"ldap_username": strings.TrimSpace(p.LdapUsername),
		"image":         strings.TrimSpace(p.Image),
		"status":        status,
	}, nil
}

func parseRolesList(roles []string) (models.JSONBArray, error) {
	out := make(models.JSONBArray, 0, len(roles))
	seen := make(map[string]struct{}, len(roles))
	for _, raw := range roles {
		grant := strings.TrimSpace(raw)
		if grant == "" {
			continue
		}
		if _, ok := seen[grant]; ok {
			continue
		}
		seen[grant] = struct{}{}
		out = append(out, grant)
	}
	return out, nil
}

// QuickUpdateUser keeps backward compatibility; delegates to general fields only.
func (cc *Controller) QuickUpdateUser(c fiber.Ctx) error {
	return cc.UpdateUserGeneral(c)
}
