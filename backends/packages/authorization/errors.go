// Package authorization exposes a small set of sentinel errors that callers
// can match on with errors.Is. Wrapping these (via fmt.Errorf("%w", err))
// keeps detailed context while preserving programmatic detection.
package authorization

import "errors"

var (
	// Configuration errors returned by NewAuthorization.
	ErrNilConfig        = errors.New("authorization: nil configuration")
	ErrMissingDB        = errors.New("authorization: db is required")
	ErrMissingJWTSecret = errors.New("authorization: jwt secret is required")
	ErrMissingAuthURL   = errors.New("authorization: auth url is required")
	ErrAutoMigration    = errors.New("authorization: auto migration failed")

	// Sign-in / user lookup errors.
	ErrUserNotFound       = errors.New("authorization: user not found")
	ErrInvalidCredentials = errors.New("authorization: invalid credentials")
	ErrInvalidContent     = errors.New("authorization: invalid content payload")

	// Token & session errors.
	ErrMissingJWTContext   = errors.New("authorization: missing jwt token in context")
	ErrInvalidClaims       = errors.New("authorization: invalid claims")
	ErrInvalidRoles        = errors.New("authorization: invalid roles")
	ErrMissingRefreshToken = errors.New("authorization: refresh token is required")
	ErrInvalidRefreshToken = errors.New("authorization: invalid refresh token")
	ErrSessionNotFound     = errors.New("authorization: session not found")
)
