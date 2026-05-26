package single

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetStudentDetailAPI(ctx fiber.Ctx) error {
	id := ctx.Query("id")
	r := c.app.Render()
	data, err := c.getStudentData(ctx.Context(), id)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(data))
}

func (c *Controller) GetStudentDetailView(ctx fiber.Ctx) error {
	r := c.app.Render()
	id := ctx.Params("id")
	data, err := c.getStudentData(ctx.Context(), id)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(data))
}

func (c *Controller) getStudentData(ctx context.Context, id string) (map[string]any, error) {
	res := make(map[string]any)
	db := c.app.Postgres()
	student, err := gorm.G[models.Student](db).Where("id = ?", id).
		Preload("Programs", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "student_id", "study_program_id")
			return nil
		}).
		Preload("Programs.StudyProgram", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug")
			return nil
		}).
		First(ctx)
	if err != nil {
		return nil, err
	}
	res["student"] = student
	return res, nil
}
