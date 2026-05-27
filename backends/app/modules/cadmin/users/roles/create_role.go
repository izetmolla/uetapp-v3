package roles

import (
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

func (cc *Controller) GetRoleCreateTemplate(c fiber.Ctx) error {
	return cc.app.Api(c, cc.app.Render().WithData(fiber.Map{
		"role": emptyRoleDetailResponse(),
	}))
}

func (cc *Controller) CreateRole(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload roleUpdatePayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	name, err := normalizeRoleName(payload.Name)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var count int64
	if err := db.Model(&models.Role{}).Where("name = ?", name).Count(&count).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	if count > 0 {
		return cc.app.Api(c, r.WithError(errRoleNameExists), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
	}

	status := models.StatusActive
	if payload.Status != "" {
		status, err = normalizeRoleStatusInput(payload.Status)
		if err != nil {
			return cc.app.Api(c,
				r.WithError(err),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
	}

	role := models.Role{
		Name:        name,
		Description: strings.TrimSpace(payload.Description),
		Status:      status,
	}

	if err := db.Create(&role).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Role created successfully",
		"role":    roleToDetailResponse(role),
	}))
}
