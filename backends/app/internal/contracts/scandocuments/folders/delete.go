package folders

import (
	"errors"
	"strconv"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) DeleteFolder(ctx fiber.Ctx) error {
	r := c.app.Render()
	ctxPtr := ctx.Context()

	folderID, err := strconv.ParseInt(ctx.Params("id"), 10, 64)
	if err != nil || folderID <= 0 {
		return c.app.Api(ctx,
			r.WithError(errors.New("invalid folder id")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	db := c.app.Postgres().WithContext(ctxPtr)
	var rowsAffected int64

	err = db.Transaction(func(tx *gorm.DB) error {
		var docIDs []int64
		if err := tx.Model(&models.StudentScanFolderDoc{}).
			Where("student_scan_folder_id = ?", folderID).
			Pluck("id", &docIDs).Error; err != nil {
			return err
		}
		if len(docIDs) > 0 {
			if err := tx.Where("student_scan_folder_doc_id IN ?", docIDs).
				Delete(&models.StudentScanFolderDocFile{}).Error; err != nil {
				return err
			}
			if err := tx.Where("student_scan_folder_id = ?", folderID).
				Delete(&models.StudentScanFolderDoc{}).Error; err != nil {
				return err
			}
		}
		if err := tx.Where("student_scan_folder_id = ?", folderID).
			Delete(&models.StudentToScanFolder{}).Error; err != nil {
			return err
		}
		result := tx.Delete(&models.StudentScanFolder{}, folderID)
		rowsAffected = result.RowsAffected
		return result.Error
	})
	if err != nil {
		return c.app.Api(ctx,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	if rowsAffected == 0 {
		return c.app.Api(ctx,
			r.WithError(gorm.ErrRecordNotFound),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"success": true,
		"message": "Folder deleted successfully",
	}))
}
