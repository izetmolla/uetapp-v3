package departments

import (
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/modules/cadmin/orgunits/helpers"
	"gorm.io/gorm"
)

type departmentPayload struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Image       string `json:"image"`
	Status      string `json:"status"`
	FacultyID   int64  `json:"faculty_id"`
}

func (cc *Controller) CreateDepartment(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload departmentPayload
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

	if err := cc.ensureFacultyExists(db, record.FacultyID); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if err := helpers.EnsureUniqueSlug(db, &models.Department{}, record.Slug, 0); err != nil {
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
		"success":    true,
		"message":    "Department created successfully",
		"department": record,
	}))
}

func (cc *Controller) UpdateDepartment(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := helpers.ParseIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid department id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload departmentPayload
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

	facultyID, _ := updates["faculty_id"].(int64)
	if err := cc.ensureFacultyExists(db, facultyID); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	slug, _ := updates["slug"].(string)
	if err := helpers.EnsureUniqueSlug(db, &models.Department{}, slug, id); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}

	var existing models.Department
	if err := db.First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.app.Api(c,
				r.WithError(errors.New("department not found")),
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

	if err := db.Model(&models.Department{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	applyDepartmentUpdates(&existing, updates)
	return cc.app.Api(c, r.WithData(fiber.Map{
		"success":    true,
		"message":    "Department updated successfully",
		"department": existing,
	}))
}

func (cc *Controller) DeleteDepartments(c fiber.Ctx) error {
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

	result := db.Where("id IN ?", ids).Delete(&models.Department{})
	if result.Error != nil {
		return cc.app.Api(c,
			r.WithError(result.Error),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	if result.RowsAffected == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("department not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Department deleted successfully",
		"deleted": result.RowsAffected,
	}))
}

func (cc *Controller) ensureFacultyExists(db *gorm.DB, facultyID int64) error {
	if facultyID <= 0 {
		return errors.New("faculty_id is required")
	}
	var count int64
	if err := db.Model(&models.Faculty{}).Where("id = ?", facultyID).Count(&count).Error; err != nil {
		return err
	}
	if count == 0 {
		return errors.New("faculty not found")
	}
	return nil
}

func (p departmentPayload) toModel() (*models.Department, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	if p.FacultyID <= 0 {
		return nil, errors.New("faculty_id is required")
	}

	slug, err := helpers.ResolveSlug(p.Slug, name)
	if err != nil {
		return nil, err
	}

	status, err := parseDepartmentStatus(p.Status)
	if err != nil {
		return nil, err
	}

	return &models.Department{
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(p.Description),
		Image:       strings.TrimSpace(p.Image),
		Status:      status,
		FacultyID:   p.FacultyID,
	}, nil
}

func (p departmentPayload) toUpdates() (map[string]any, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}
	if p.FacultyID <= 0 {
		return nil, errors.New("faculty_id is required")
	}

	slug, err := helpers.ResolveSlug(p.Slug, name)
	if err != nil {
		return nil, err
	}

	status, err := parseDepartmentStatus(p.Status)
	if err != nil {
		return nil, err
	}

	return map[string]any{
		"name":        name,
		"slug":        slug,
		"description": strings.TrimSpace(p.Description),
		"image":       strings.TrimSpace(p.Image),
		"status":      status,
		"faculty_id":  p.FacultyID,
	}, nil
}

func parseDepartmentStatus(raw string) (models.DepartmentStatus, error) {
	raw = strings.TrimSpace(strings.ToLower(raw))
	if raw == "" {
		return models.DepartmentStatusActive, nil
	}
	switch models.DepartmentStatus(raw) {
	case models.DepartmentStatusActive, models.DepartmentStatusInactive:
		return models.DepartmentStatus(raw), nil
	default:
		return "", errors.New("invalid status")
	}
}

func applyDepartmentUpdates(record *models.Department, updates map[string]any) {
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
	if v, ok := updates["status"].(models.DepartmentStatus); ok {
		record.Status = v
	}
	if v, ok := updates["faculty_id"].(int64); ok {
		record.FacultyID = v
	}
}
