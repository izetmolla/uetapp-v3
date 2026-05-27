package list

import (
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

type studentIDsRequest struct {
	IDs []int64 `json:"ids"`
}

func (cc *Controller) DisableStudents(c fiber.Ctx) error {
	return cc.setStudentsStatus(c, "inactive", "Student disabled successfully")
}

func (cc *Controller) EnableStudents(c fiber.Ctx) error {
	return cc.setStudentsStatus(c, "active", "Student enabled successfully")
}

func (cc *Controller) setStudentsStatus(c fiber.Ctx, status string, successMessage string) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var req studentIDsRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	ids, err := parseStudentIDs(req.IDs)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	query := db.Model(&models.Student{}).Where("id IN ?", ids)
	if status == "active" {
		query = query.Where("status = ? OR status = '' OR status IS NULL", "inactive")
	} else {
		query = query.Where("status <> ?", "inactive")
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
			r.WithError(errors.New("student not found")),
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
