package list

import (
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
)

func (cc *Controller) GetStudentCreateTemplate(c fiber.Ctx) error {
	return cc.app.Api(c, cc.app.Render().WithData(fiber.Map{
		"student": emptyStudentDetailResponse(),
	}))
}

func (cc *Controller) CreateStudent(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload studentPayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	student, err := payload.toModel()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	if student.Email != "" {
		var count int64
		if err := db.Model(&models.Student{}).Where("email = ?", student.Email).Count(&count).Error; err != nil {
			return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		if count > 0 {
			return cc.app.Api(c, r.WithError(errors.New("email already in use")), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
		}
	}

	if err := db.Create(student).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Student created successfully",
		"student": studentToDetailResponse(*student),
	}))
}
