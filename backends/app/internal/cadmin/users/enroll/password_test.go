package enroll

import (
	"testing"

	"github.com/flowtrove/packages/authorization/utils"
)

func TestHashCSVPassword_plainText(t *testing.T) {
	pm := utils.NewPasswordManager(0)
	hash, err := hashCSVPassword(pm, "secret123")
	if err != nil {
		t.Fatal(err)
	}
	if !isBcryptHash(hash) {
		t.Fatalf("expected bcrypt hash, got %q", hash)
	}
	if !pm.IsValidPassword(hash, "secret123") {
		t.Fatal("hash should verify against plain password")
	}
}

func TestHashCSVPassword_alreadyHashed(t *testing.T) {
	pm := utils.NewPasswordManager(0)
	existing, err := pm.HashPassword("secret123")
	if err != nil {
		t.Fatal(err)
	}
	got, err := hashCSVPassword(pm, existing)
	if err != nil {
		t.Fatal(err)
	}
	if got != existing {
		t.Fatalf("got %q want %q", got, existing)
	}
}
