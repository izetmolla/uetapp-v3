package enroll

import (
	"strings"
	"testing"

	"github.com/flowtrove/packages/authorization/utils"
)

func TestCsvRowUpdates_onlyFileColumns(t *testing.T) {
	pm := utils.NewPasswordManager(12)
	fileCols := []string{"email", "first_name", "password"}

	updates, err := csvRowUpdates(csvUserRow{
		Email:     "new@example.com",
		FirstName: "Jane",
		LastName:  "Ignored",
		Roles:     "admin:rw",
		Status:    "inactive",
	}, pm, fileCols)
	if err != nil {
		t.Fatal(err)
	}
	if _, ok := updates["last_name"]; ok {
		t.Fatal("last_name should not be updated")
	}
	if _, ok := updates["roles"]; ok {
		t.Fatal("roles should not be updated when column not in CSV")
	}
	if _, ok := updates["status"]; ok {
		t.Fatal("status should not be updated when column not in CSV")
	}
	if updates["email"] != "new@example.com" || updates["first_name"] != "Jane" {
		t.Fatalf("unexpected updates: %+v", updates)
	}
	if _, ok := updates["password"]; ok {
		t.Fatal("empty password should not be updated")
	}
}

func TestCsvToUserForInsert_skipsMissingPassword(t *testing.T) {
	pm := utils.NewPasswordManager(12)
	user, err := csvToUserForInsert(csvUserRow{
		Email:    "new@example.com",
		Username: "newuser",
	}, pm, []string{"email", "username"})
	if err != nil {
		t.Fatal(err)
	}
	if user.Password != "" {
		t.Fatalf("expected empty password, got %q", user.Password)
	}
}

func TestParseCSV_fileColumns(t *testing.T) {
	csv := "email,first_name\na@b.com,Ann\n"
	parsed, err := parseCSV(strings.NewReader(csv))
	if err != nil {
		t.Fatal(err)
	}
	want := []string{"email", "first_name"}
	if len(parsed.FileColumns) != len(want) {
		t.Fatalf("file columns: %v", parsed.FileColumns)
	}
	for i, c := range want {
		if parsed.FileColumns[i] != c {
			t.Fatalf("got %v want %v", parsed.FileColumns, want)
		}
	}
}
