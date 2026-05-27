package list

import (
	"errors"
	"regexp"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type orgUnitPayload struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	Unit        string `json:"unit"`
	IsDefault   bool   `json:"is_default"`
}

type orgUnitUpdatePayload struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
	IsDefault   bool   `json:"is_default"`
}

type deleteOrgUnitsRequest struct {
	IDs []string `json:"ids"`
}

var slugSanitizer = regexp.MustCompile(`[^a-z0-9]+`)

func slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "" {
		return ""
	}
	return strings.Trim(slugSanitizer.ReplaceAllString(value, "-"), "-")
}

func (cc *Controller) CreateOrgUnit(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload orgUnitPayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	orgUnit, err := payload.toModel()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if err := ensureUniqueSlug(db, orgUnit.Slug, 0); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}

	if err := db.Transaction(func(tx *gorm.DB) error {
		if orgUnit.IsDefault {
			if err := tx.Model(&models.OrgUnit{}).Where("is_default = ?", true).Update("is_default", false).Error; err != nil {
				return err
			}
		}
		return tx.Create(orgUnit).Error
	}); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success":  true,
		"message":  "Org unit created successfully",
		"org_unit": orgUnit,
	}))
}

func (cc *Controller) UpdateOrgUnit(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := strconv.ParseInt(strings.TrimSpace(c.Params("id")), 10, 64)
	if err != nil || id <= 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid org unit id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload orgUnitUpdatePayload
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
	if err := ensureUniqueSlug(db, slug, id); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}

	var existing models.OrgUnit
	if err := db.First(&existing, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.app.Api(c,
				r.WithError(errors.New("org unit not found")),
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

	isDefault, _ := updates["is_default"].(bool)

	if err := db.Transaction(func(tx *gorm.DB) error {
		if isDefault {
			if err := tx.Model(&models.OrgUnit{}).Where("is_default = ? AND id <> ?", true, id).Update("is_default", false).Error; err != nil {
				return err
			}
		}
		return tx.Model(&models.OrgUnit{}).Where("id = ?", id).Updates(updates).Error
	}); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	if name, ok := updates["name"].(string); ok {
		existing.Name = name
	}
	if slug, ok := updates["slug"].(string); ok {
		existing.Slug = slug
	}
	if description, ok := updates["description"].(string); ok {
		existing.Description = description
	}
	existing.IsDefault = isDefault

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success":  true,
		"message":  "Org unit updated successfully",
		"org_unit": existing,
	}))
}

func (cc *Controller) DeleteOrgUnits(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var req deleteOrgUnitsRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	ids := make([]int64, 0, len(req.IDs))
	for _, rawID := range req.IDs {
		id, err := strconv.ParseInt(strings.TrimSpace(rawID), 10, 64)
		if err != nil || id <= 0 {
			return cc.app.Api(c,
				r.WithError(errors.New("invalid org unit id in request")),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		ids = append(ids, id)
	}

	if len(ids) == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("at least one org unit id is required")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	result := db.Where("id IN ?", ids).Delete(&models.OrgUnit{})
	if result.Error != nil {
		return cc.app.Api(c,
			r.WithError(result.Error),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	if result.RowsAffected == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("org unit not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Org unit deleted successfully",
		"deleted": result.RowsAffected,
	}))
}

func (p orgUnitPayload) toModel() (*models.OrgUnit, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}

	unit := strings.TrimSpace(p.Unit)
	if unit == "" {
		return nil, errors.New("unit is required")
	}

	slug := slugify(p.Slug)
	if slug == "" {
		slug = slugify(name)
	}
	if slug == "" {
		return nil, errors.New("slug is required")
	}

	return &models.OrgUnit{
		Name:        name,
		Slug:        slug,
		Description: strings.TrimSpace(p.Description),
		Unit:        unit,
		IsDefault:   p.IsDefault,
		Content:     models.JSONBArray{},
	}, nil
}

func (p orgUnitUpdatePayload) toUpdates() (map[string]any, error) {
	name := strings.TrimSpace(p.Name)
	if name == "" {
		return nil, errors.New("name is required")
	}

	slug := slugify(p.Slug)
	if slug == "" {
		slug = slugify(name)
	}
	if slug == "" {
		return nil, errors.New("slug is required")
	}

	return map[string]any{
		"name":        name,
		"slug":        slug,
		"description": strings.TrimSpace(p.Description),
		"is_default":  p.IsDefault,
	}, nil
}

func ensureUniqueSlug(db *gorm.DB, slug string, excludeID int64) error {
	var count int64
	query := db.Model(&models.OrgUnit{}).Where("slug = ?", slug)
	if excludeID > 0 {
		query = query.Where("id <> ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("slug already exists")
	}
	return nil
}
