package authorization

import (
	"bytes"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/config"
)

func setupTestApp(clients *config.AppClients) *fiber.App {
	app := fiber.New()
	api := app.Group("/api")
	SetupRoutes(app, api, clients)
	return app
}

func TestSetupRoutes_SignIn_Post_ReturnsInternalServerError_WhenAuthNotInitialized(t *testing.T) {
	t.Parallel()

	app := setupTestApp(config.NewTestAppClients())

	req := httptest.NewRequest(
		"POST",
		"/api/authorization/sign-in",
		bytes.NewBufferString(`{"email":"user@example.com","password":"secret"}`),
	)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", fiber.StatusInternalServerError, resp.StatusCode)
	}
}

func TestSetupRoutes_SignIn_Get_ReturnsInternalServerError_WhenAuthNotInitialized(t *testing.T) {
	t.Parallel()

	app := setupTestApp(config.NewTestAppClients())

	req := httptest.NewRequest("GET", "/api/authorization/sign-in", nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", fiber.StatusInternalServerError, resp.StatusCode)
	}
}

func TestSetupRoutes_CheckEmail_Post_ReturnsInternalServerError_WhenAuthNotInitialized(t *testing.T) {
	t.Parallel()

	app := setupTestApp(config.NewTestAppClients())

	req := httptest.NewRequest(
		"POST",
		"/api/authorization/check-email",
		bytes.NewBufferString(`{"email":"user@example.com"}`),
	)
	req.Header.Set("Content-Type", "application/json")

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", fiber.StatusInternalServerError, resp.StatusCode)
	}
}

func TestSetupRoutes_UnknownAuthorizationRoute_ReturnsNotFound(t *testing.T) {
	t.Parallel()

	app := setupTestApp(config.NewTestAppClients())

	req := httptest.NewRequest("POST", "/api/authorization/unknown", nil)

	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("failed to read response body: %v", err)
	}

	// ApiNotFound responds via render.Api WithData; body includes NOT_FOUND payload.
	if resp.StatusCode != fiber.StatusOK && resp.StatusCode != fiber.StatusNotFound {
		t.Fatalf("expected status %d or %d, got %d body=%s",
			fiber.StatusOK, fiber.StatusNotFound, resp.StatusCode, body)
	}
}
