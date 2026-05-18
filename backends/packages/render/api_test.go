package render

import (
	"encoding/json"
	"io"
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v3"
)

func TestApiErrorUsesConfiguredStatusAndCode(t *testing.T) {
	r := &Render{}
	app := fiber.New()
	app.Get("/denied", func(c fiber.Ctx) error {
		return r.Api(
			c,
			r.WithError(fiber.NewError(fiber.StatusForbidden, "insufficient permissions")),
			r.WithStatus(fiber.StatusForbidden),
			r.WithCode("INSUFFICIENT_PERMISSIONS"),
		)
	})

	req := httptest.NewRequest("GET", "/denied", nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatalf("app.Test: %v", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != fiber.StatusForbidden {
		t.Fatalf("status = %d; want %d", resp.StatusCode, fiber.StatusForbidden)
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		t.Fatalf("read body: %v", err)
	}

	var payload map[string]any
	if err := json.Unmarshal(body, &payload); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if payload["code"] != "INSUFFICIENT_PERMISSIONS" {
		t.Fatalf("code = %v; want INSUFFICIENT_PERMISSIONS", payload["code"])
	}
	if int(payload["status"].(float64)) != fiber.StatusForbidden {
		t.Fatalf("body status = %v; want %d", payload["status"], fiber.StatusForbidden)
	}
}
