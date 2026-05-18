package list

import (
	"errors"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type resourcePayload struct {
	Name        string `json:"name"`
	Description string `json:"description"`
}

type deleteResourcesRequest struct {
	IDs []string `json:"ids"`
}

func (cc *Controller) CreateResource(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload resourcePayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	record, err := payload.toModel()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if err := db.Create(record).Error; err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success":  true,
		"message":  "Resource created successfully",
		"resource": record,
	}))
}

func (cc *Controller) UpdateResource(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid resource id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload resourcePayload
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

	var existing models.Resource
	if err := db.First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.app.Api(c,
				r.WithError(errors.New("resource not found")),
				r.WithStatus(fiber.StatusNotFound),
				r.WithCode("NOT_FOUND"),
			)
		}
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	if err := db.Model(&models.Resource{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	if name, ok := updates["name"].(string); ok {
		existing.Name = name
	}
	if description, ok := updates["description"].(string); ok {
		existing.Description = description
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success":  true,
		"message":  "Resource updated successfully",
		"resource": existing,
	}))
}

func (cc *Controller) DeleteResources(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var req deleteResourcesRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	ids, err := parseDeleteIDs(req.IDs)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	result := db.Where("id IN ?", ids).Delete(&models.Resource{})
	if result.Error != nil {
		return cc.app.Api(c,
			r.WithError(result.Error),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	if result.RowsAffected == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("resource not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Resource deleted successfully",
		"deleted": result.RowsAffected,
	}))
}

func (p resourcePayload) toModel() (*models.Resource, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}

	return &models.Resource{
		Name:        name,
		Description: strings.TrimSpace(p.Description),
	}, nil
}

func (p resourcePayload) toUpdates() (map[string]any, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}

	return map[string]any{
		"name":        name,
		"description": strings.TrimSpace(p.Description),
	}, nil
}

func parseIDParam(raw string) (int64, error) {
	id, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid id")
	}
	return id, nil
}

func parseDeleteIDs(ids []string) ([]int64, error) {
	if len(ids) == 0 {
		return nil, errors.New("at least one id is required")
	}
	parsed := make([]int64, 0, len(ids))
	for _, rawID := range ids {
		id, err := parseIDParam(rawID)
		if err != nil {
			return nil, errors.New("invalid id in request")
		}
		parsed = append(parsed, id)
	}
	return parsed, nil
}
