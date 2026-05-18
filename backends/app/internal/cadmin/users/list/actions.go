package list

import (
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type userIDsRequest struct {
	IDs []string `json:"ids"`
}

func (cc *Controller) DisableUsers(c fiber.Ctx) error {
	return cc.setUsersStatus(c, models.Disabled, "User disabled successfully")
}

func (cc *Controller) EnableUsers(c fiber.Ctx) error {
	return cc.setUsersStatus(c, models.Active, "User enabled successfully")
}

func (cc *Controller) DeleteUsers(c fiber.Ctx) error {
	return cc.setUsersStatus(c, models.Deleted, "User marked as deleted successfully")
}

func (cc *Controller) setUsersStatus(c fiber.Ctx, status models.UserStatus, successMessage string) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var req userIDsRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	ids, err := parseUserIDs(req.IDs)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	query := db.Model(&models.User{}).Where("id IN ?", ids)
	switch status {
	case models.Disabled:
		query = query.Where("status <> ?", models.Deleted)
	case models.Active:
		query = query.Where("status IN ?", []models.UserStatus{
			models.Disabled,
			models.Inactive,
			models.Suspended,
			models.Pending,
			models.New,
		})
	case models.Deleted:
		// allow marking any non-deleted user as deleted
		query = query.Where("status <> ?", models.Deleted)
	}

	result := query.Update("status", status)
	if result.Error != nil {
		return cc.app.Api(c,
			r.WithError(result.Error),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	if result.RowsAffected == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("user not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": successMessage,
		"updated": result.RowsAffected,
	}))
}

func normalizeQuickEditStatus(raw string) (models.UserStatus, error) {
	raw = strings.ToLower(strings.TrimSpace(raw))
	switch models.UserStatus(raw) {
	case models.Active, models.Inactive, models.Suspended, models.Disabled, models.New, models.Pending:
		return models.UserStatus(raw), nil
	default:
		return "", errors.New("invalid status")
	}
}

func parseUserIDParam(raw string) (string, error) {
	id := strings.TrimSpace(raw)
	if _, err := uuid.Parse(id); err != nil {
		return "", errors.New("invalid id")
	}
	return id, nil
}

func parseUserIDs(ids []string) ([]string, error) {
	if len(ids) == 0 {
		return nil, errors.New("at least one id is required")
	}
	parsed := make([]string, 0, len(ids))
	for _, rawID := range ids {
		id, err := parseUserIDParam(rawID)
		if err != nil {
			return nil, errors.New("invalid id in request")
		}
		parsed = append(parsed, id)
	}
	return parsed, nil
}
