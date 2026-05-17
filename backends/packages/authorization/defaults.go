package authorization

import "time"

// Header identifiers used by the package's middlewares to coordinate
// optional flows such as refresh-token issuance and re-authorization.
const (
	RefreshTokenHandlerIdentifier = "cft"
	ReauthorizeHandlerIdentifier  = "cra"
)

// Token, session and cookie defaults. They are exposed as variables so
// downstream services that have to interoperate with this package can
// override them for tests without forking the package.
var (
	DefaultAccessTokenLifetime  = "30s"
	DefaultRefreshTokenLifetime = "1h"
	DefaultSigningMethodHMAC    = "HS256"

	DefaultRedisTTL    = 30 * time.Minute
	DefaultRedisPrefix = "AUTHSESSIONS"

	DefaultCookieSessionName = "cnf.id"
	DefaultMainDomainName    = "localhost"
	DefaultAuthRedirectURL   = ""

	DefaultPasswordCost      = 12
	DefaultPasswordMinLength = 3
)

// API error codes returned in JSON responses. Kept as variables for
// backward compatibility with consumers that string-match on them.
var (
	INVALID_CREDENTIALS      = "INVALID_CREDENTIALS"
	TOKEN_EXPIRED            = "TOKEN_EXPIRED"
	TOKEN_INVALID            = "TOKEN_INVALID"
	AUTH_REQUIRED            = "AUTH_REQUIRED"
	INSUFFICIENT_PERMISSIONS = "INSUFFICIENT_PERMISSIONS"
	ROLE_NOT_ALLOWED         = "ROLE_NOT_ALLOWED"
	API_KEY_FORBIDDEN        = "API_KEY_FORBIDDEN"
	UNAUTHORIZED             = "UNAUTHORIZED"
	SERVER_ERROR             = "SERVER_ERROR"
)
