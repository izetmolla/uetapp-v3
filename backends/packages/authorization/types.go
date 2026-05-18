package authorization

import (
	"github.com/flowtrove/packages/authorization/ldap"
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

// AuthorizationOptions is the configuration consumed by NewAuthorization.
//
// All durations are expressed in the package's short-form notation,
// e.g. "30s", "15m", "1h", "7d", "4w", "1mo", "1y".
type AuthorizationOptions struct {
	// Storage.
	DB    *gorm.DB
	Redis *redis.Client

	// JWT.
	JWTSecret            string
	SigningMethodHMAC    string // optional; defaults to DefaultSigningMethodHMAC ("HS256").
	AccessTokenDuration  string // optional; defaults to DefaultAccessTokenLifetime.
	RefreshTokenDuration string // optional; defaults to DefaultRefreshTokenLifetime.

	// Models / schema. UserModel/SessionModel may be custom GORM structs.
	UserModel        any
	UserTableName    string
	SessionModel     any
	SessionTableName string
	AutoMigration    bool

	// Cookies & redirects.
	CookieSessionName string
	AuthURL           string
	SignInRedirectURL string

	// PasswordCost overrides the bcrypt cost. 0 means use DefaultPasswordCost.
	PasswordCost int

	// ldap
	LDAPConfig *ldap.Config
}

// AuthorizationError is a structured error returned to API consumers when
// validating user-provided input (e.g. on sign-in).
type AuthorizationError struct {
	Error error  `json:"error"`
	Field string `json:"field"`
}

// firstNonEmpty returns the first non-empty string from the arguments.
// Useful when applying defaults to optional configuration fields.
func firstNonEmpty(values ...string) string {
	for _, v := range values {
		if v != "" {
			return v
		}
	}
	return ""
}
