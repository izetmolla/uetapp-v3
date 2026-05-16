package authorization

import "time"

var (

	// RefreshTokenHandlerIdentifier is the key used to identify refresh token requests
	RefreshTokenHandlerIdentifier = "cft"

	// ReauthorizeHandlerIdentifier is the key used to identify reauthorization requests
	ReauthorizeHandlerIdentifier = "cra"

	// DefaultAccessTokenLifetime is the default lifetime for access tokens
	DefaultAccessTokenLifetime = "30s"

	// DefaultRefreshTokenLifetime is the default lifetime for refresh tokens
	DefaultRefreshTokenLifetime = "1h"

	// DefaultSigningMethodHMAC is the default JWT signing method
	DefaultSigningMethodHMAC = "HS256"

	// DefaultRedisTTL is the default TTL for Redis session storage
	DefaultRedisTTL = 60 * 30 * time.Second

	// DefaultRedisPrefix is the default prefix for Redis keys
	DefaultRedisPrefix = "AUTHSESSIONS"

	// DefaultCookieSessionName is the default name for the session cookie
	DefaultCookieSessionName = "cnf.id"

	// DefaultMainDomainName is the default domain name for the session cookie
	DefaultMainDomainName = "localhost"

	// DefaultAuthRedirectURL is the default redirect URL for the auth server
	DefaultAuthRedirectURL = ""

	// DefaultPasswordCost is the default cost for password hashing
	DefaultPasswordCost = 12

	// DefaultPasswordMinLength is the default minimum length for password
	DefaultPasswordMinLength = 3
)

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
