package documents

import (
	"encoding/json"
	"fmt"
	"time"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type UploadDocumentBody struct {
	FolderId  string `json:"folder_id"`
	StudentId string `json:"student_id" default:"0"`
}

func (cc *Controller) UploadDocumentAPI(c fiber.Ctx) error {
	ctx := c.Context()
	r := cc.app.Render()

	var body UploadDocumentBody
	if err := json.Unmarshal([]byte(c.FormValue("body", "{}")), &body); err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	fmt.Println("body", body)
	file, err := c.FormFile("file")
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}
	option, err := gorm.G[models.StudentScanSettings](cc.app.Postgres()).
		Select("value").
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
	if resource.Driver != models.ResourceDriverMinio {
		return cc.app.Api(c, r.WithError(fmt.Errorf("resource with id %d is not a minio resource", resource.ID)), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	// Open the uploaded file
	src, err := file.Open()
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	defer func() {
		if closeErr := src.Close(); closeErr != nil {
			fmt.Println(closeErr)
			// Log the close error but don't fail the operation
			// In production, you might want to use a proper logger here
		}
	}()

	// Generate unique filename with timestamp prefix to prevent conflicts
	fileName := fmt.Sprintf("%d_%s", time.Now().Unix(), file.Filename)
	fileLocation := fmt.Sprintf("test/files/%s", fileName)

	// Read file contents into memory
	fileBytes := make([]byte, file.Size)
	bytesRead, err := src.Read(fileBytes)
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	if int64(bytesRead) != file.Size {
		return cc.app.Api(c, r.WithError(fmt.Errorf("file read incomplete: expected %d bytes, read %d bytes", file.Size, bytesRead)), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	// Get content type from file header
	contentType := file.Header.Get("Content-Type")
	if contentType == "" {
		contentType = "application/octet-stream" // Default content type
	}

	// Upload file to MinIO storage
	if err := cc.app.UploadFileFromBytes(ctx, resource.ID, "contract-office", fileLocation, fileBytes, contentType); err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Document uploaded successfully",
		"data":    file,
	}))
}
