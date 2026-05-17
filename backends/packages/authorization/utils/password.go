package utils

import (
	"errors"

	"golang.org/x/crypto/bcrypt"
)

// defaultBcryptCost mirrors the value in the parent package's defaults.
// It is duplicated here to keep utils free of an import cycle.
const defaultBcryptCost = 12

// ErrPasswordTooLong is returned when bcrypt rejects a password because
// it exceeds the 72-byte hard limit imposed by the algorithm.
var ErrPasswordTooLong = errors.New("password exceeds maximum length (72 bytes)")

// PasswordManager handles password hashing and validation.
//
// Instances are safe for concurrent use and hold no per-call state, so a
// single one per process is enough.
type PasswordManager struct {
	cost int
}

// NewPasswordManager creates a password manager with the given bcrypt
// cost. Costs outside the valid bcrypt range fall back to the default.
func NewPasswordManager(cost int) *PasswordManager {
	if cost < bcrypt.MinCost || cost > bcrypt.MaxCost {
		cost = defaultBcryptCost
	}
	return &PasswordManager{cost: cost}
}

// Cost returns the bcrypt cost used by this manager.
func (pm *PasswordManager) Cost() int { return pm.cost }

// HashPassword returns the bcrypt hash of `password`.
func (pm *PasswordManager) HashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), pm.cost)
	if err != nil {
		if errors.Is(err, bcrypt.ErrPasswordTooLong) {
			return "", ErrPasswordTooLong
		}
		return "", err
	}
	return string(hash), nil
}

// IsValidPassword reports whether `pw` is the cleartext for the
// bcrypt-encoded `encpw`.
//
// Both inputs are zero-cost guarded so the bcrypt comparison (which is
// the expensive step) is skipped when either side is empty.
func (pm *PasswordManager) IsValidPassword(encpw, pw string) bool {
	if encpw == "" || pw == "" {
		return false
	}
	return bcrypt.CompareHashAndPassword([]byte(encpw), []byte(pw)) == nil
}

// CreatePassword is a package-level convenience for callers that don't
// want to instantiate a PasswordManager.
//
// Deprecated: prefer (*PasswordManager).HashPassword.
func CreatePassword(password string) (string, error) {
	return NewPasswordManager(defaultBcryptCost).HashPassword(password)
}
