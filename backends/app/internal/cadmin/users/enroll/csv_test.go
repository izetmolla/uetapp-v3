package enroll

import (
	"strings"
	"testing"
)

func TestParseCSV_valid(t *testing.T) {
	csv := csvTemplateContent + ",John,Doe,john@example.com,johndoe,secret,,active,admin\n"
	parsed, err := parseCSV(strings.NewReader(csv))
	if err != nil {
		t.Fatal(err)
	}
	if len(parsed.Rows) != 1 {
		t.Fatalf("rows: %d", len(parsed.Rows))
	}
	if parsed.Rows[0].Email != "john@example.com" {
		t.Fatalf("got %+v", parsed.Rows[0])
	}
	if len(parsed.Columns.Matched) != 9 {
		t.Fatalf("matched columns: %d", len(parsed.Columns.Matched))
	}
}

func TestParseCSV_ignoresUnknownColumns(t *testing.T) {
	csv := "email,username,password,not_a_db_column\na@b.com,user1,pass,x\n"
	parsed, err := parseCSV(strings.NewReader(csv))
	if err != nil {
		t.Fatal(err)
	}
	if len(parsed.Columns.Unknown) != 1 || parsed.Columns.Unknown[0].Key != "not_a_db_column" {
		t.Fatalf("unknown: %+v", parsed.Columns.Unknown)
	}
	if len(parsed.Columns.Missing) == 0 {
		t.Fatal("expected missing columns")
	}
}

func TestParseCSV_rejectsNoMatchingColumns(t *testing.T) {
	csv := "foo,bar\n1,2\n"
	_, err := parseCSV(strings.NewReader(csv))
	if err == nil {
		t.Fatal("expected error")
	}
}
