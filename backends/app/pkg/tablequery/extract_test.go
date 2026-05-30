package tablequery

import (
	"net/http"
	"net/http/httptest"
	"net/url"
	"testing"

	"github.com/gofiber/fiber/v3"
)

func TestGetFilterExtractsValueFromNestedGroup(t *testing.T) {
	app := fiber.New()
	filtersJSON := `[{"id":"first_name","variant":"text","operator":"iLike","value":"izet"},{"type":"group","filters":[{"id":"email","variant":"text","operator":"iLike","value":"pollogati"}],"joinOperator":"and"}]`

	var got []string
	app.Get("/test", func(c fiber.Ctx) error {
		got = GetFilter(c, "email")
		return nil
	})

	reqURL := "/test?filters=" + url.QueryEscape(filtersJSON)
	req := httptest.NewRequest(http.MethodGet, reqURL, nil)
	if _, err := app.Test(req); err != nil {
		t.Fatal(err)
	}

	if len(got) != 1 || got[0] != "pollogati" {
		t.Fatalf("GetFilter(email) = %v, want [pollogati]", got)
	}
}

func TestGetFilterReturnsEmptyWhenColumnNotInGroup(t *testing.T) {
	app := fiber.New()
	filtersJSON := `[{"type":"group","filters":[{"id":"email","variant":"text","operator":"iLike","value":"pollogati"}],"joinOperator":"and"}]`

	var got []string
	app.Get("/test", func(c fiber.Ctx) error {
		got = GetFilter(c, "first_name")
		return nil
	})

	reqURL := "/test?filters=" + url.QueryEscape(filtersJSON)
	req := httptest.NewRequest(http.MethodGet, reqURL, nil)
	if _, err := app.Test(req); err != nil {
		t.Fatal(err)
	}

	if len(got) != 0 {
		t.Fatalf("GetFilter(first_name) = %v, want empty", got)
	}
}
