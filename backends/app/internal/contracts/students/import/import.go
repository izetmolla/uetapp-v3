package importstudents

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/syncstudents"
)

type ImportStudentsRequest struct {
	Students []string `json:"students"`
}

func (cc *Controller) ImportStudentsAPI(ctx fiber.Ctx) error {
	r := cc.app.Render()
	req := ImportStudentsRequest{}
	if err := ctx.Bind().JSON(&req); err != nil {
		return cc.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	result, err := syncstudents.New(cc.app).ImportStudents(ctx.Context(), syncstudents.ImportStudentsRequest{
		Students: req.Students,
	})
	if err != nil {
		return cc.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return cc.app.Api(ctx, r.WithData(result), r.WithStatus(fiber.StatusOK), r.WithCode("OK"))
}
