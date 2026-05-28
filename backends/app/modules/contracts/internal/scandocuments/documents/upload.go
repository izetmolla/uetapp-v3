package documents

import (
	"fmt"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (cc *Controller) UploadDocumentAPI(c fiber.Ctx) error {
	ctx := c.Context()
	r := cc.app.Render()
	file, err := c.FormFile("file")
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}
	option, err := gorm.G[models.StudentScanSettings](cc.app.Postgres()).
		Where("option = ?", "student_scan_settings").
		First(ctx)
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	resource, err := gorm.G[models.Resource](cc.app.Postgres()).
		Where("id = ?", option.Value).
		First(ctx)
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	fmt.Println(resource)

	// Validate MinIO client availability
	minioClient, err := cc.app.Minio(ctx, resource.ID)
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	fmt.Println(minioClient)

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Document uploaded successfully",
		"data":    file,
	}))
}
