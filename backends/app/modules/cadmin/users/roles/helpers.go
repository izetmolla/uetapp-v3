package roles

import (
	"errors"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (cc *Controller) loadEditableRole(db *gorm.DB, id int64) (models.Role, error) {
	var role models.Role
	if err := db.Where("id = ?", id).First(&role).Error; err != nil {
		return role, err
	}
	if role.Status == models.StatusDeleted {
		return role, errors.New("deleted roles cannot be edited")
	}
	return role, nil
}

func (cc *Controller) roleNotFoundResponse(c fiber.Ctx, err error) error {
	r := cc.app.Render()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return cc.app.Api(c,
			r.WithError(errors.New("role not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}
	if err != nil && err.Error() == "deleted roles cannot be edited" {
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

func roleToDetailResponse(role models.Role) fiber.Map {
	return fiber.Map{
		"id":          role.ID,
		"name":        role.Name,
		"description": role.Description,
		"status":      normalizeRoleStatus(role.Status),
		"created_at":  role.CreatedAt,
		"updated_at":  role.UpdatedAt,
	}
}

func emptyRoleDetailResponse() fiber.Map {
	return fiber.Map{
		"id":          0,
		"name":        "",
		"description": "",
		"status":      string(models.StatusActive),
	}
}

func normalizeRoleStatus(raw models.Status) models.Status {
	switch strings.ToLower(strings.TrimSpace(string(raw))) {
	case string(models.StatusActive):
		return models.StatusActive
	case string(models.StatusInactive), "disabled":
		return models.StatusInactive
	case string(models.StatusDeleted):
		return models.StatusDeleted
	default:
		if raw == "" {
			return models.StatusActive
		}
		return models.StatusActive
	}
}

func normalizeRoleStatusInput(raw string) (models.Status, error) {
	raw = strings.ToLower(strings.TrimSpace(raw))
	switch raw {
	case string(models.StatusActive), "":
		return models.StatusActive, nil
	case string(models.StatusInactive), "disabled":
		return models.StatusInactive, nil
	default:
		return "", errors.New("invalid status")
	}
}

func parseRoleIDParam(raw string) (int64, error) {
	id, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid role id")
	}
	return id, nil
}

func parseRoleIDs(ids []int64) ([]int64, error) {
	if len(ids) == 0 {
		return nil, errors.New("at least one id is required")
	}
	parsed := make([]int64, 0, len(ids))
	for _, id := range ids {
		if id <= 0 {
			return nil, errors.New("invalid id in request")
		}
		parsed = append(parsed, id)
	}
	return parsed, nil
}

func normalizeRoleName(raw string) (string, error) {
	name := strings.TrimSpace(raw)
	if name == "" {
		return "", errors.New("name is required")
	}
	if len(name) > 50 {
		return "", errors.New("name must be at most 50 characters")
	}
	return strings.ToLower(name), nil
}
