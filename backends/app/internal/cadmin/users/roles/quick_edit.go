package roles

import (
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

type roleUpdatePayload struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Status      string `json:"status"`
}

func (cc *Controller) GetRoleDetail(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseRoleIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid role id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var role models.Role
	if err := db.Where("id = ?", id).First(&role).Error; err != nil {
		return cc.roleNotFoundResponse(c, err)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"role": roleToDetailResponse(role),
	}))
}

func (cc *Controller) UpdateRole(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseRoleIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid role id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload roleUpdatePayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if _, err := cc.loadEditableRole(db, id); err != nil {
		return cc.roleNotFoundResponse(c, err)
	}

	name, err := normalizeRoleName(payload.Name)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	status, err := normalizeRoleStatusInput(payload.Status)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var count int64
	if err := db.Model(&models.Role{}).Where("name = ? AND id <> ?", name, id).Count(&count).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	if count > 0 {
		return cc.app.Api(c, r.WithError(errors.New("role name already exists")), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
	}

	updates := map[string]any{
		"name":        name,
		"description": strings.TrimSpace(payload.Description),
		"status":      status,
	}

	if err := db.Model(&models.Role{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	var role models.Role
	if err := db.Where("id = ?", id).First(&role).Error; err != nil {
		return cc.roleNotFoundResponse(c, err)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Role updated successfully",
		"role":    roleToDetailResponse(role),
	}))
}
