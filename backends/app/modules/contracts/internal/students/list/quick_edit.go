package list

import (
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

func (cc *Controller) GetStudentDetail(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseStudentIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid student id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	student, err := cc.loadEditableStudent(db, id)
	if err != nil {
		return cc.studentNotFoundResponse(c, err)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"student": studentToDetailResponse(student),
	}))
}

func (cc *Controller) UpdateStudent(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	id, err := parseStudentIDParam(c.Params("id"))
	if err != nil {
		return cc.app.Api(c,
			r.WithError(errors.New("invalid student id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	var payload studentPayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if _, err := cc.loadEditableStudent(db, id); err != nil {
		return cc.studentNotFoundResponse(c, err)
	}

	updates, err := payload.toUpdates()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if email, ok := updates["email"].(string); ok && email != "" {
		var count int64
		if err := db.Model(&models.Student{}).Where("email = ? AND id <> ?", email, id).Count(&count).Error; err != nil {
			return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		if count > 0 {
			return cc.app.Api(c, r.WithError(errors.New("email already in use")), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
		}
	}

	if err := db.Model(&models.Student{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	student, err := cc.loadEditableStudent(db, id)
	if err != nil {
		return cc.studentNotFoundResponse(c, err)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Student updated successfully",
		"student": studentToDetailResponse(student),
	}))
}
