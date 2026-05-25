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

	db := c.app.Postgres()
	result := db.WithContext(ctxPtr).Delete(&models.StudentScanFolder{}, folderID)
	if result.Error != nil {
		return c.app.Api(ctx,
			r.WithError(result.Error),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}
	if result.RowsAffected == 0 {
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
