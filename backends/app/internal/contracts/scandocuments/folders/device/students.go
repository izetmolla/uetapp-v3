package device

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetStudentsFromFolder(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	folderID := ctx.Query("folder_id")
	students, err := c.getStudentsFromFolder(ctxPtr, folderID)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(fiber.Map{
		"students": students,
	}))
}

func (c *Controller) getStudentsFromFolder(ctx context.Context, folderID string) ([]map[string]any, error) {

	db := c.app.Postgres()
	docs, err := gorm.G[models.StudentScanFolderDoc](db).
		Where("student_scan_folder_id = ?", folderID).
		Preload("Student", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "firstname", "lastname", "email", "id_number")
			return nil
		}).
		Find(ctx)
	if err != nil {
		return nil, err
	}

	res := make([]map[string]any, 0, len(docs))
	for _, doc := range docs {
		if doc.Student.ID != 0 {
			res = append(res, map[string]any{
				"id":        doc.Student.ID,
				"fullname":  doc.Student.Firstname + " " + doc.Student.Lastname,
				"firstname": doc.Student.Firstname,
				"lastname":  doc.Student.Lastname,
				"email":     doc.Student.Email,
				"id_number": doc.Student.IdNumber,
			})
		}
	}

	return res, nil
}
