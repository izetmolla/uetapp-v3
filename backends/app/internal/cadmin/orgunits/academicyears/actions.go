package academicyears

import (
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/internal/cadmin/orgunits/helpers"
)

type academicYearPayload struct {
	Year string `json:"year"`
}

func (cc *Controller) CreateAcademicYear(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload academicYearPayload
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

	if err := helpers.EnsureUniqueYear(db, &models.AcademicYear{}, record.Year, 0); err != nil {
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
		"success":       true,
		"message":       "Academic year created successfully",
		"academic_year": record,
	}))
}

func (cc *Controller) UpdateAcademicYear(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := helpers.ParseIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid academic year id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload academicYearPayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	year := strings.TrimSpace(payload.Year)
	if year == "" {
		return cc.app.Api(c,
			r.WithError(errors.New("year is required")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if err := helpers.EnsureUniqueYear(db, &models.AcademicYear{}, year, id); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusConflict),
			r.WithCode("CONFLICT"),
		)
	}

	var existing models.AcademicYear
	if err := db.First(&existing, id).Error; err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("academic year not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	if err := db.Model(&models.AcademicYear{}).Where("id = ?", id).Update("year", year).Error; err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	existing.Year = year
	return cc.app.Api(c, r.WithData(fiber.Map{
		"success":       true,
		"message":       "Academic year updated successfully",
		"academic_year": existing,
	}))
}

func (cc *Controller) DeleteAcademicYears(c fiber.Ctx) error {
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

	result := db.Where("id IN ?", ids).Delete(&models.AcademicYear{})
	if result.Error != nil {
		return cc.app.Api(c,
			r.WithError(result.Error),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	if result.RowsAffected == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("academic year not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Academic year deleted successfully",
		"deleted": result.RowsAffected,
	}))
}

func (p academicYearPayload) toModel() (*models.AcademicYear, error) {
	year := strings.TrimSpace(p.Year)
	if year == "" {
		return nil, errors.New("year is required")
	}
	return &models.AcademicYear{Year: year}, nil
}
