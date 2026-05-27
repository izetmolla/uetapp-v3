package faculties

import (
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/modules/cadmin/orgunits/helpers"
	"gorm.io/gorm"
)

type facultyPayload struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Status      string `json:"status"`
}

func (cc *Controller) CreateFaculty(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload facultyPayload
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

	if err := helpers.EnsureUniqueSlug(db, &models.Faculty{}, record.Slug, 0); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
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
		"success": true,
		"message": "Faculty created successfully",
		"faculty": record,
	}))
}

func (cc *Controller) UpdateFaculty(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := helpers.ParseIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid faculty id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload facultyPayload
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

	slug, _ := updates["slug"].(string)
	if err := helpers.EnsureUniqueSlug(db, &models.Faculty{}, slug, id); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}

	var existing models.Faculty
	if err := db.First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.app.Api(c,
				r.WithError(errors.New("faculty not found")),
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

	if err := db.Model(&models.Faculty{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	applyFacultyUpdates(&existing, updates)
	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Faculty updated successfully",
		"faculty": existing,
	}))
}

func (cc *Controller) DeleteFaculties(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var req helpers.DeleteByIDsRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	ids, err := helpers.ParseDeleteIDs(req.IDs)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	result := db.Where("id IN ?", ids).Delete(&models.Faculty{})
	if result.Error != nil {
		return cc.app.Api(c,
			r.WithError(result.Error),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	if result.RowsAffected == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("faculty not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Faculty deleted successfully",
		"deleted": result.RowsAffected,
	}))
}

func (p facultyPayload) toModel() (*models.Faculty, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}

	slug, err := helpers.ResolveSlug(p.Slug, name)
	if err != nil {
		return nil, err
	}

	status, err := parseFacultyStatus(p.Status)
	if err != nil {
		return nil, err
	}

	return &models.Faculty{
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(p.Description),
		Image:       strings.TrimSpace(p.Image),
		Status:      status,
	}, nil
}

func (p facultyPayload) toUpdates() (map[string]any, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}

	slug, err := helpers.ResolveSlug(p.Slug, name)
	if err != nil {
		return nil, err
	}

	status, err := parseFacultyStatus(p.Status)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"name":        name,
		"slug":        slug,
		"description": strings.TrimSpace(p.Description),
		"image":       strings.TrimSpace(p.Image),
		"status":      status,
	}, nil
}

func parseFacultyStatus(raw string) (models.FacultyStatus, error) {
	raw = strings.TrimSpace(strings.ToLower(raw))
	if raw == "" {
		return models.FacultyStatusActive, nil
	}
	switch models.FacultyStatus(raw) {
	case models.FacultyStatusActive, models.FacultyStatusInactive:
		return models.FacultyStatus(raw), nil
	default:
		return "", errors.New("invalid status")
	}
}

func applyFacultyUpdates(record *models.Faculty, updates map[string]any) {
	if v, ok := updates["name"].(string); ok {
		record.Name = v
	}
	if v, ok := updates["slug"].(string); ok {
		record.Slug = v
	}
	if v, ok := updates["description"].(string); ok {
		record.Description = v
	}
	if v, ok := updates["image"].(string); ok {
		record.Image = v
	}
	if v, ok := updates["status"].(models.FacultyStatus); ok {
		record.Status = v
	}
}
