package authorization

import (
	"encoding/json"
	"errors"

	"github.com/flowtrove/app/config"
	"github.com/gofiber/fiber/v3"
)

type Controller struct {
	app *config.AppClients
}

func NewController(app *config.AppClients) *Controller {
	return &Controller{
		app: app,
	}
}

func SetupRoutes(app fiber.Router, api fiber.Router, appClients *config.AppClients) {
	controller := NewController(appClients)
	authApi := api.Group("/authorization")
	authApi.Post("/sign-in", controller.SignIn)
	authApi.Get("/sign-in", controller.SignIn)
	authApi.Post("/check-email", controller.SignInCheckEmail)

	app.Get("/sign-in", controller.SignInView)
	authApi.Use(appClients.ApiNotFound)
}

type SignInRequest struct {
	Email      string `json:"email"`
	Password   string `json:"password"`
	CheckEmail bool   `json:"check_email"`
}

func (c *Controller) SignIn(ctx fiber.Ctx) error {
	if c == nil || c.app == nil || c.app.Auth() == nil {
		return c.app.Api(ctx, c.app.Render().WithError(errors.New("Authorization not initialized")))
	}
	var req SignInRequest
	if err := ctx.Bind().JSON(&req); err != nil {
		return c.app.Api(ctx, c.app.Render().WithError(errors.New("Invalid request")))
	}

	auth := c.app.Auth()
	res, err := auth.SignIn(
		auth.WithContext(ctx),
		auth.WithEmail(req.Email),
		auth.WithPassword(req.Password),
		auth.WithIPAddress(ctx.IP()),
		auth.WithUserAgent(ctx.Get("User-Agent")),
		auth.WithContent(json.RawMessage(`{
			"Test":  "data1234",
			"Test2": "data5678"
		}`)),
	)
	if err != nil {
		return c.app.Api(ctx, c.app.Render().WithError(err))
	}
	auth.SetCookie(ctx, res.SessionID)
	return ctx.JSON(fiber.Map{
		"user":       res.User,
		"tokens":     res.Tokens,
		"session_id": res.SessionID,
	})
}

func (c *Controller) SignInView(ctx fiber.Ctx) error {
	return c.app.View(ctx, c.app.Render().WithTitle("Sign In"))
}

func (c *Controller) SignInCheckEmail(ctx fiber.Ctx) error {
	if c == nil || c.app == nil || c.app.Auth() == nil {
		return c.app.Api(ctx, c.app.Render().WithError(errors.New("Authorization not initialized")))
	}
	var req SignInRequest
	if err := ctx.Bind().JSON(&req); err != nil {
		return c.app.Api(ctx, c.app.Render().WithError(errors.New("Invalid request")))
	}
	auth := c.app.Auth()
	res, err := auth.CheckEmail(auth.WithContext(ctx), auth.WithEmail(req.Email))
	if err != nil {
		return c.app.Api(ctx, c.app.Render().WithError(err))
	}
	return ctx.JSON(fiber.Map{
		"user": res.User,
	})
}

func (c *Controller) SignOut(ctx fiber.Ctx) error {
	context := ctx.Context()
	if c == nil || c.app == nil || c.app.Auth() == nil {
		return c.app.Api(ctx, c.app.Render().WithError(errors.New("Authorization not initialized")))
	}
	auth := c.app.Auth()
	sessionID := auth.GetSessionID(ctx)
	if err := auth.SignOut(context, sessionID); err != nil {
		return c.app.Api(ctx, c.app.Render().WithError(err))
	}
	auth.RemoveCookie(ctx, sessionID)
	return ctx.JSON(fiber.Map{
		"message": "signed out",
	})
}
