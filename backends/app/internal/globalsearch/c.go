package globalsearch

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{app: app}
}
func SetupApiRoutes(api fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	api.Get("/globalsearch/search", controller.Search)
}

func (cc *Controller) Search(ctx fiber.Ctx) error {
	r := cc.app.Render()
	reqCtx := ctx.Context()
	keyword := ctx.Query("keyword")

	user, err := cc.app.USER(ctx, reqCtx, true)
	if err != nil {
		return cc.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusUnauthorized), r.WithCode("UNAUTHORIZED"))

	}
	services, err := cc.getServicesToSearch(reqCtx, user.Roles)
	if err != nil {
		return cc.app.Api(ctx, r.WithError(err))
	}

	return cc.app.Api(ctx, r.WithData(fiber.Map{
		"services": services,
		"keyword":  keyword,
	}))
}
