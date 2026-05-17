package authorization

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
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
	authApi.Post("/sign-in", controller.SignInApi)
	authApi.Post("/check-email", controller.SignInCheckEmail)
	// The sign-out endpoint is intentionally unauthenticated: a client
	// with a stale or already-revoked session should still be able to
	// drop the cookie and clear server-side state without bouncing
	// through the JWT middleware.
	authApi.Post("/sign-out", controller.SignOut)

	app.Get("/sign-in", controller.SignInView)
	app.Post("/sign-out", controller.SignOut)
	authApi.Use(appClients.ApiNotFound)
}

type SignInRequest struct {
	Email      string `json:"email"`
	Password   string `json:"password"`
	CheckEmail bool   `json:"check_email"`
}

func (cc *Controller) SignInApi(c fiber.Ctx) error {
	ctxReq := c.Context()
	r := cc.app.Render()
	auth := cc.app.Auth()

	var req SignInRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	res, err := auth.SignIn(
		auth.WithContext(ctxReq),
		auth.WithEmail(req.Email),
		auth.WithPassword(req.Password),
		auth.WithIPAddress(c.IP()),
		auth.WithUserAgent(c.Get("User-Agent")),
	)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}
	auth.SetCookie(c, res.SessionID)
	return c.JSON(fiber.Map{
		"user":       res.User,
		"tokens":     res.Tokens,
		"session_id": res.SessionID,
	})
}

func (c *Controller) SignInView(ctx fiber.Ctx) error {
	r := c.app.Render()
	return c.app.View(ctx, r.WithTitle("Sign In"), r.WIthoutAuthentication())
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

// SignOut tears down the user's session in a way that is safe to call
// from a stale, expired or already-signed-out client. It always:
//
//  1. Drops the session cookie.
//  2. Best-effort soft-deletes the session row when the cookie carried
//     a non-empty id; underlying errors are surfaced but do not
//     block the cookie removal.
//
// Returning 200 even when the session has already disappeared keeps the
// frontend's sign-out flow idempotent and prevents the response
// interceptor from getting wedged into a sign-out loop.
func (c *Controller) SignOut(ctx fiber.Ctx) error {
	if c == nil || c.app == nil || c.app.Auth() == nil {
		return c.app.Api(ctx, c.app.Render().WithError(errors.New("Authorization not initialized")))
	}
	auth := c.app.Auth()
	sessionID := auth.GetSessionID(ctx)

	auth.RemoveCookie(ctx, sessionID)

	if sessionID != "" {
		if err := auth.SignOut(ctx.Context(), sessionID); err != nil {
			return c.app.Api(ctx, c.app.Render().WithError(err))
		}
	}

	return ctx.JSON(fiber.Map{
		"message": "signed out",
	})
}
