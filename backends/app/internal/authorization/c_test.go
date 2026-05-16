package authorization

import (
	"net/http/httptest"
	"testing"

	"github.com/flowtrove/app/config"
	"github.com/gofiber/fiber/v3"
)

func TestSetupRoutes_SignIn_ReturnsInternalServerError_WhenAuthNotInitialized(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	api := app.Group("/api")
	SetupRoutes(app, api, &config.AppClients{})

	req := httptest.NewRequest("POST", "/api/authorization/signin", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusInternalServerError {
		t.Fatalf("expected status %d, got %d", fiber.StatusInternalServerError, resp.StatusCode)
	}
}

func TestSetupRoutes_SignIn_GetMethodNotAllowed(t *testing.T) {
	t.Parallel()

	app := fiber.New()
	api := app.Group("/api")
	SetupRoutes(app, api, &config.AppClients{})

	req := httptest.NewRequest("GET", "/api/authorization/signin", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("failed to execute request: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode < 400 {
		t.Fatalf("expected non-success status for GET route, got %d", resp.StatusCode)
	}
}
