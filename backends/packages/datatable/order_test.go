package datatable

import "testing"

func TestOrderByClause(t *testing.T) {
	cols := ColumnNameByID([]Column{
		{ID: "name", AccessorKey: "name"},
		{ID: "created_at", SQLColumn: "resources.created_at"},
	})

	clause := OrderByClause([]Sort{{ID: "name", Desc: false}}, cols)
	if clause != " ORDER BY name ASC" {
		t.Fatalf("got %q", clause)
	}

	clause = OrderByClause([]Sort{{ID: "created_at", Desc: true}}, cols)
	if clause != " ORDER BY resources.created_at DESC" {
		t.Fatalf("got %q", clause)
	}

	if OrderByClause(nil, cols) != "" {
		t.Fatal("expected empty clause for no sorts")
	}
}

func TestExtractQuerySortingJSON(t *testing.T) {
	columns := []Column{{ID: "name", AccessorKey: "name"}}
	q, err := ExtractQuery("/list?sorting=[{\"id\":\"name\",\"desc\":true}]", columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Sorts) != 1 || q.Sorts[0].ID != "name" || !q.Sorts[0].Desc {
		t.Fatalf("unexpected sorts: %+v", q.Sorts)
	}

	q, err = ExtractQuery("/list?sort=[{\"id\":\"name\",\"desc\":false}]", columns)
	if err != nil {
		t.Fatal(err)
	}
	if len(q.Sorts) != 1 || q.Sorts[0].Desc {
		t.Fatalf("unexpected sorts: %+v", q.Sorts)
	}
}
