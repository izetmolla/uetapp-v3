package documents

import (
	"fmt"

	"github.com/gofiber/fiber/v3"
)

func (cc *Controller) UploadDocumentAPI(c fiber.Ctx) error {
	r := cc.app.Render()
	// Parse the uploaded file
	file, err := c.FormFile("file")
	if err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	fmt.Println(file.Filename)
	fmt.Println(file.Size)
	fmt.Println(file.Header)
	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "Document uploaded successfully",
		"data":    file,
	}))
}
