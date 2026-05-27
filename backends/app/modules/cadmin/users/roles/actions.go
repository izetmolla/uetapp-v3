package roles

import (
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

var errRoleNameExists = errors.New("role name already exists")

type roleIDsRequest struct {
	IDs []int64 `json:"ids"`
}

func (cc *Controller) DisableRoles(c fiber.Ctx) error {
	return cc.setRolesStatus(c, models.StatusInactive, "Role disabled successfully")
}

func (cc *Controller) EnableRoles(c fiber.Ctx) error {
	return cc.setRolesStatus(c, models.StatusActive, "Role enabled successfully")
}

func (cc *Controller) DeleteRoles(c fiber.Ctx) error {
	return cc.setRolesStatus(c, models.StatusDeleted, "Role marked as deleted successfully")
}

func (cc *Controller) setRolesStatus(c fiber.Ctx, status models.Status, successMessage string) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var req roleIDsRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	ids, err := parseRoleIDs(req.IDs)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	query := db.Model(&models.Role{}).Where("id IN ?", ids)
	switch status {
	case models.StatusInactive:
		query = query.Where("status <> ?", models.StatusDeleted)
	case models.StatusActive:
		query = query.Where("status = ? OR status = '' OR status IS NULL", models.StatusInactive)
	case models.StatusDeleted:
		query = query.Where("status <> ?", models.StatusDeleted)
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
			r.WithError(errors.New("role not found")),
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
