package students

import (
	"errors"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/syncstudents"
	"gorm.io/gorm"
)

type AddStudentToScanRequest struct {
	FolderID int64    `json:"folder_id"`
	Students []string `json:"students"`
}

func (c *Controller) AddStudentToScanAPI(ctx fiber.Ctx) error {
	r := c.app.Render()
	req := AddStudentToScanRequest{}
	if err := ctx.Bind().JSON(&req); err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	result, err := syncstudents.New(c.app).ImportStudents(ctx.Context(), syncstudents.ImportStudentsRequest{
		Students: req.Students,
	})
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	gctx := ctx.Context()
	db := c.app.Postgres()
	for _, student := range result.Students {
		_, err := gorm.G[models.StudentToScanFolder](db).
			Where(&models.StudentToScanFolder{
				StudentScanFolderID: req.FolderID,
				StudentID:           student.ID,
			}).
			First(gctx)
		if err == nil {
			continue
		}
		if !errors.Is(err, gorm.ErrRecordNotFound) {
			return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		if err := gorm.G[models.StudentToScanFolder](db).Create(gctx, &models.StudentToScanFolder{
			StudentScanFolderID: req.FolderID,
			StudentID:           student.ID,
			Status:              models.StudentToWorkStatusPending,
		}); err != nil {
			return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"success":  true,
		"message":  "Students worked successfully",
		"data":     req,
		"students": result,
	}))
}

func (c *Controller) WorkStudentsListAPI(ctx fiber.Ctx) error {
	return c.app.Api(ctx, c.app.Render().WithData(fiber.Map{
		"success": true,
		"message": "Students worked successfully",
	}))
}
