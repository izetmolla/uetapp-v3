package config

import (
	"testing"

	"github.com/flowtrove/packages/authorization"
	"github.com/flowtrove/packages/models"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func testAppClients(t *testing.T) *AppClients {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	auth, err := authorization.NewAuthorization(&authorization.AuthorizationOptions{
		DB:            db,
		JWTSecret:     "test-secret",
		AuthURL:         "http://localhost",
		AutoMigration: false,
	})
	if err != nil {
		t.Fatal(err)
	}
	return &AppClients{auth: auth}
}

func TestUserCanAccessByRoles(t *testing.T) {
	app := testAppClients(t)

	tests := []struct {
		name     string
		required []string
		user     []string
		want     bool
	}{
		{name: "public resource", required: nil, user: nil, want: true},
		{name: "no user roles on guarded resource", required: []string{"admin"}, user: nil, want: false},
		{name: "admin read", required: []string{"admin"}, user: []string{"admin:rw"}, want: true},
		{name: "admin read only grant", required: []string{"admin"}, user: []string{"admin:r"}, want: true},
		{name: "wrong role", required: []string{"admin"}, user: []string{"student:rw"}, want: false},
		{name: "any of multiple required", required: []string{"admin", "secretary"}, user: []string{"secretary:rw"}, want: true},
		{name: "admin rw matches admin or secretary endpoint", required: []string{"admin", "secretary"}, user: []string{"admin:rw"}, want: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := app.userCanAccessByRoles(tt.required, tt.user)
			if got != tt.want {
				t.Fatalf("userCanAccessByRoles() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestUserCanAccessService(t *testing.T) {
	app := testAppClients(t)

	public := models.JSONBArray{}
	guarded := models.JSONBArray{"admin"}

	if !app.userCanAccessService(public, "", nil) {
		t.Fatal("expected public service to be accessible")
	}
	if app.userCanAccessService(guarded, "admin", []string{"student:rw"}) {
		t.Fatal("expected student to be denied admin service")
	}
	if !app.userCanAccessService(guarded, "admin", []string{"admin:rw"}) {
		t.Fatal("expected admin to access admin service")
	}
}

func TestUserCanAccessService_AdminBypassesContractsOnly(t *testing.T) {
	app := testAppClients(t)

	contractsOnly := models.JSONBArray{"contracts"}
	if !app.userCanAccessService(contractsOnly, "contracts", []string{"admin:rw"}) {
		t.Fatal("expected admin:rw to access a contracts-only service")
	}
	if app.userCanAccessService(contractsOnly, "contracts", []string{"student:rw"}) {
		t.Fatal("expected student to be denied contracts-only service")
	}
}

func TestUserCanAccessService_ContractsGrantWithoutDBRoles(t *testing.T) {
	app := testAppClients(t)

	if !app.userCanAccessService(nil, "contracts", []string{"contracts:rw"}) {
		t.Fatal("expected contracts:rw to access contracts service by name")
	}
}
