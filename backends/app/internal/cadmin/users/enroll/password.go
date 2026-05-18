package enroll

import (
	"fmt"
	"strings"

	"github.com/flowtrove/packages/authorization"
	"github.com/flowtrove/packages/authorization/utils"
)

func passwordManagerFromApp(auth *authorization.Authorization) (*utils.PasswordManager, error) {
	if auth == nil {
		return nil, fmt.Errorf("authorization is not initialized")
	}
	return auth.PasswordManager(), nil
}

// hashCSVPassword stores plain-text CSV passwords with the same bcrypt
// settings as sign-in. Values that are already bcrypt hashes are kept as-is.
func hashCSVPassword(pm *utils.PasswordManager, raw string) (string, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return "", nil
	}
	if isBcryptHash(raw) {
		return raw, nil
	}
	return pm.HashPassword(raw)
}

func isBcryptHash(s string) bool {
	return strings.HasPrefix(s, "$2a$") ||
		strings.HasPrefix(s, "$2b$") ||
		strings.HasPrefix(s, "$2y$")
}
