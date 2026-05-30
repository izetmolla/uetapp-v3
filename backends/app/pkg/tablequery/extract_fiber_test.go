package tablequery_test

import (
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/flowtrove/packages/datatable"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func TestExtractAdvancedFiltersWithGroupViaFiber(t *testing.T) {
	columns := []datatable.Column{
		{ID: "first_name", AccessorKey: "first_name", Meta: &datatable.ColumnMeta{Variant: datatable.VariantText}},
		{ID: "email", AccessorKey: "email", Meta: &datatable.ColumnMeta{Variant: datatable.VariantText}},
	}

	app := fiber.New()
	app.Get("/list", func(c fiber.Ctx) error {
		q, err := tablequery.Extract(c, columns)
		if err != nil {
			return err
		}
		if len(q.Filters) != 2 {
			t.Errorf("want 2 filters, got %d: %+v", len(q.Filters), q.Filters)
		}
		if len(q.Filters) < 2 || q.Filters[1].Type != "group" {
			t.Errorf("expected group at index 1: %+v", q.Filters)
		}
		where := datatable.ConditionsFromFiltersWithoutargs(q.Filters, q.JoinOperator, columns)
		if where == "" {
			t.Fatal("empty where")
		}
		return c.SendString(where)
	})

	filtersJSON := `[{"id":"first_name","variant":"text","operator":"iLike","value":"izet"},{"type":"group","filters":[{"id":"email","variant":"text","operator":"iLike","value":"pollogati"}],"joinOperator":"and"}]`
	reqURL := "/list?pagination[page]=1&pagination[perPage]=10&filterFlag=advancedFilters&joinOperator=and&filters=" + filtersJSON

	req := httptest.NewRequest(http.MethodGet, reqURL, nil)
	resp, err := app.Test(req)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	if resp.StatusCode != 200 {
		t.Fatalf("status=%d body=%s", resp.StatusCode, body)
	}
	if !contains(string(body), "pollogati") {
		t.Fatalf("where missing pollogati: %s", body)
	}
}

func contains(s, sub string) bool {
	return len(s) >= len(sub) && (s == sub || len(sub) == 0 || indexOf(s, sub) >= 0)
}

func indexOf(s, sub string) int {
	for i := 0; i+len(sub) <= len(s); i++ {
		if s[i:i+len(sub)] == sub {
			return i
		}
	}
	return -1
}
