// Package authorization provides a small, opinionated layer on top of
// Fiber + GORM + JWT to handle sign-in, sign-out, session lookup and
// token refresh.
//
// The entry point is NewAuthorization which validates its configuration
// and returns a ready-to-use *Authorization. Everything else (sign-in,
// sign-out, refresh-token middleware, API/WEB guards) is a method on
// that struct.
package authorization

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/flowtrove/packages/authorization/ldap"
	"github.com/flowtrove/packages/authorization/models"
	"github.com/flowtrove/packages/authorization/utils"
	jwtware "github.com/gofiber/contrib/v3/jwt"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

// Authorization is the public facade exposed by this package. It
// composes a DB manager, a token manager and a password manager and
// exposes their functionality through coherent high-level methods.
//
// Instances are created with NewAuthorization and are safe for
// concurrent use.
type Authorization struct {
	dbManager       *models.DBManager
	passwordManager *utils.PasswordManager
	tokenManager    *utils.TokenManager

	cookieSessionName string
	authURL           string
	signInRedirectURL string

	// Cached at boot to keep the cookie helpers allocation-free.
	cookieDomain string

	//ldap
	ldapClient *ldap.Client
}

// AuthData is the authenticated principal extracted from either a JWT
// (API requests) or a session cookie (WEB requests).
type AuthData struct {
	SessionID string
	UserID    string
	Roles     []string
}

// NewAuthorization validates the supplied options, builds the underlying
// managers and returns a fully-wired *Authorization.
//
// The order of operations is deliberate: configuration is validated
// first, then defaults are applied, then storage and crypto are wired
// up. This keeps boot deterministic and easy to reason about in tests.
func NewAuthorization(cfg *AuthorizationOptions) (*Authorization, error) {
	if cfg == nil {
		return nil, ErrNilConfig
	}
	if cfg.DB == nil {
		return nil, ErrMissingDB
	}
	if cfg.JWTSecret == "" {
		return nil, ErrMissingJWTSecret
	}
	if cfg.AuthURL == "" {
		return nil, ErrMissingAuthURL
	}

	a := &Authorization{
		authURL:           cfg.AuthURL,
		signInRedirectURL: firstNonEmpty(cfg.SignInRedirectURL, cfg.AuthURL+"/sign-in"),
		cookieSessionName: firstNonEmpty(cfg.CookieSessionName, DefaultCookieSessionName),
	}

	if cfg.LDAPConfig != nil {
		ldapClient, err := ldap.New(*cfg.LDAPConfig)
		if err != nil {
			return nil, fmt.Errorf("%w: %v", ldap.ErrInvalidConfig, err)
		}
		a.ldapClient = ldapClient
	}

	a.cookieDomain = "." + utils.GetDomainWithoutWWW(a.authURL)

	a.dbManager = models.New().
		WithDb(cfg.DB).
		WithRedis(cfg.Redis).
		WithSessionsTableName(cfg.SessionTableName).
		WithUsersTableName(cfg.UserTableName).
		WithUserModel(cfg.UserModel).
		WithSessionModel(cfg.SessionModel)

	if cfg.AutoMigration {
		a.dbManager.WithAutoMigration()
		if err := a.dbManager.DB().AutoMigrate(
			a.dbManager.GetUserModel(),
			a.dbManager.GetSessionModel(),
		); err != nil {
			return nil, fmt.Errorf("%w: %v", ErrAutoMigration, err)
		}
	}

	signingMethod := firstNonEmpty(cfg.SigningMethodHMAC, DefaultSigningMethodHMAC)
	accessLifetime := firstNonEmpty(cfg.AccessTokenDuration, DefaultAccessTokenLifetime)
	refreshLifetime := firstNonEmpty(cfg.RefreshTokenDuration, DefaultRefreshTokenLifetime)

	a.tokenManager = utils.NewTokenManager(
		a.dbManager,
		accessLifetime,
		refreshLifetime,
		cfg.JWTSecret,
		signingMethod,
	)

	passwordCost := cfg.PasswordCost
	if passwordCost == 0 {
		passwordCost = DefaultPasswordCost
	}
	a.passwordManager = utils.NewPasswordManager(passwordCost)

	return a, nil
}

// --- Accessors ------------------------------------------------------------

// DBManager exposes the underlying database manager.
func (a *Authorization) DBManager() *models.DBManager { return a.dbManager }

// PasswordManager exposes the underlying password manager.
func (a *Authorization) PasswordManager() *utils.PasswordManager { return a.passwordManager }

// TokenManager exposes the underlying token manager.
func (a *Authorization) TokenManager() *utils.TokenManager { return a.tokenManager }

// AuthURL returns the configured authentication base URL.
func (a *Authorization) AuthURL() string { return a.authURL }

// CookieSessionName returns the cookie name used to carry the session id.
func (a *Authorization) CookieSessionName() string { return a.cookieSessionName }

// --- Claims & roles -------------------------------------------------------

// GetClaims returns the jwt.MapClaims set by the JWT middleware. It
// errors out if no token is present or the claim type is unexpected.
func (a *Authorization) GetClaims(ctx fiber.Ctx) (jwt.MapClaims, error) {
	token := jwtware.FromContext(ctx)
	if token == nil {
		return nil, ErrMissingJWTContext
	}
	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, ErrInvalidClaims
	}
	return claims, nil
}

// GetRoles extracts the "roles" claim as a []string. Several encodings
// are accepted because the claim crosses JSON, jwt and DB boundaries.
func (a *Authorization) GetRoles(ctx fiber.Ctx) ([]string, error) {
	claims, err := a.GetClaims(ctx)
	if err != nil {
		return nil, err
	}
	raw, ok := claims["roles"]
	if !ok || raw == nil {
		return nil, ErrInvalidRoles
	}
	return rolesFromAny(raw)
}

// rolesFromAny decodes whatever the JWT library handed us for the
// "roles" claim into a clean []string.
func rolesFromAny(raw any) ([]string, error) {
	switch v := raw.(type) {
	case []string:
		return v, nil
	case json.RawMessage:
		return utils.FormatRoles(v), nil
	case string:
		return utils.FormatRoles(json.RawMessage(v)), nil
	case []any:
		out := make([]string, 0, len(v))
		for _, x := range v {
			s, ok := x.(string)
			if !ok {
				return nil, ErrInvalidRoles
			}
			out = append(out, s)
		}
		return out, nil
	default:
		return nil, ErrInvalidRoles
	}
}

// --- Session & user lookup ------------------------------------------------

// GetSession loads a session (and its user) by id, using the Redis cache
// when available.
func (a *Authorization) GetSession(ctx context.Context, sessionID string) (*models.Session, error) {
	return a.dbManager.GetSessionFromDB(ctx, sessionID)
}

// GetAuthDataAPI extracts the authenticated principal from a JWT-protected
// request.
func (a *Authorization) GetAuthDataAPI(ctx fiber.Ctx) (AuthData, error) {
	claims, err := a.GetClaims(ctx)
	if err != nil {
		return AuthData{}, err
	}
	data := AuthData{
		SessionID: stringClaim(claims, "session_id"),
		UserID:    stringClaim(claims, "user_id"),
	}
	if roles, err := a.GetRoles(ctx); err == nil {
		data.Roles = roles
	} else {
		data.Roles = []string{}
	}
	return data, nil
}

// GetAuthDataWEB extracts the authenticated principal from a
// cookie-protected request by loading the matching session row.
func (a *Authorization) GetAuthDataWEB(ctx fiber.Ctx, reqCtx context.Context) (AuthData, error) {
	session, err := a.GetSession(reqCtx, a.GetSessionID(ctx))
	if err != nil {
		return AuthData{}, err
	}
	return AuthData{
		SessionID: session.ID,
		UserID:    session.UserID,
		Roles:     utils.FormatRoles(session.User.Roles),
	}, nil
}

func (a *Authorization) LDAPClient() (bool, *ldap.Client) { return a.ldapClient != nil, a.ldapClient }

// User returns the authenticated principal for the current request.
// Pass fromAPI=true to read it out of the JWT instead of the session
// cookie. The variadic shape preserves the original ergonomic API.
func (a *Authorization) User(c fiber.Ctx, reqCtx context.Context, fromAPI ...bool) (*AuthData, error) {
	useAPI := len(fromAPI) > 0 && fromAPI[0]
	var (
		data AuthData
		err  error
	)
	if useAPI {
		data, err = a.GetAuthDataAPI(c)
	} else {
		data, err = a.GetAuthDataWEB(c, reqCtx)
	}
	if err != nil {
		return nil, err
	}
	return &data, nil
}

// stringClaim safely extracts a string value from jwt.MapClaims.
func stringClaim(claims jwt.MapClaims, key string) string {
	if v, ok := claims[key]; ok {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

// GetRole checks authorization against endpoint role names and user role grants.
//
// endpointRoles are plain names required by the route (e.g. "admin", "hr").
// userRoles use "name:perms" where perms is r (read), w (write), or rw (both).
//
// Returns:
//   - hasRole: user has at least one endpoint role (name match before ":")
//   - canRead: matched grant includes r or rw
//   - canWrite: matched grant includes w or rw
func (a *Authorization) GetRole(endpointRoles, userRoles []string) (hasRole, canRead, canWrite bool) {
	if len(endpointRoles) == 0 || len(userRoles) == 0 {
		return false, false, false
	}

	allowed := make(map[string]struct{}, len(endpointRoles))
	for _, r := range endpointRoles {
		r = strings.TrimSpace(r)
		if r == "" {
			continue
		}
		// Allow endpoint config like "admin:rw" — only the role name is compared.
		if name, _, ok := strings.Cut(r, ":"); ok {
			r = strings.TrimSpace(name)
		}
		allowed[r] = struct{}{}
	}
	if len(allowed) == 0 {
		return false, false, false
	}

	for _, userRole := range userRoles {
		name, perms, ok := parseUserRoleGrant(userRole)
		if !ok {
			continue
		}
		if _, ok := allowed[name]; !ok {
			continue
		}
		hasRole = true
		if roleGrantAllowsRead(perms) {
			canRead = true
		}
		if roleGrantAllowsWrite(perms) {
			canWrite = true
		}
	}
	return hasRole, canRead, canWrite
}

func parseUserRoleGrant(userRole string) (name, perms string, ok bool) {
	userRole = strings.TrimSpace(userRole)
	if userRole == "" {
		return "", "", false
	}
	name, perms, found := strings.Cut(userRole, ":")
	name = strings.TrimSpace(name)
	if name == "" {
		return "", "", false
	}
	if found {
		perms = strings.TrimSpace(strings.ToLower(perms))
	}
	return name, perms, true
}

func roleGrantAllowsRead(perms string) bool {
	return strings.Contains(perms, "r")
}

func roleGrantAllowsWrite(perms string) bool {
	return strings.Contains(perms, "w")
}

// compile-time assertion that errors.New (and therefore errors.Is) still
// works on our sentinels even if someone wraps them.
var _ = errors.Is
