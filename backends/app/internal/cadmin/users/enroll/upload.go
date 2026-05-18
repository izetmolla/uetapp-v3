package enroll

import (
	"github.com/gofiber/fiber/v3"
)

func (cc *Controller) GetCSVTemplate(c fiber.Ctx) error {
	c.Set("Content-Type", "text/csv; charset=utf-8")
	c.Set("Content-Disposition", `attachment; filename="users-enroll-template.csv"`)
	return c.SendString(csvTemplateContent)
}

func (cc *Controller) PreviewCSVUpload(c fiber.Ctx) error {
	r := cc.app.Render()

	file, err := c.FormFile("file")
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	f, err := file.Open()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}
	defer f.Close()

	parsed, err := parseCSV(f)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	idx, err := loadUserIndex(cc.app.Postgres())
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	preview := buildPreview(parsed.Rows, idx, parsed.FileColumns)
	preview.Columns = parsed.Columns
	preview.FileColumns = parsed.FileColumns
	return c.JSON(preview)
}
