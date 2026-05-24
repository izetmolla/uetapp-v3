package device

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetFoldersToScanByDevice(ctx fiber.Ctx) error {
	ctxPtr := ctx.Context()
	r := c.app.Render()
	folders, err := c.getFoldersToScanByDevice(ctxPtr)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(fiber.Map{
		"folders": folders,
	}))
}

func (c *Controller) getFoldersToScanByDevice(ctx context.Context) ([]map[string]any, error) {
	db := c.app.Postgres()
	folders, err := gorm.G[models.StudentScanFolder](db).
		// Where("device_id = ?", deviceID).
		Find(ctx)
	if err != nil {
		return nil, err
	}
	res := make([]map[string]any, 0, len(folders))
	for _, folder := range folders {
		res = append(res, map[string]any{
			"id":   folder.ID,
			"name": folder.Name,
		})
	}
	return res, nil
}
