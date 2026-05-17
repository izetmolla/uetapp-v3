// Package utils provides the building blocks consumed by the
// authorization package: token generation, password hashing and
// small request-scoped helpers.
//
// The token manager is the performance-critical piece: callers go
// through it on every sign-in and every refresh. To keep the hot
// path allocation-free, the token manager pre-parses durations,
// pre-resolves the JWT signing method and reuses byte slices for
// the secret.
package utils

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/flowtrove/packages/authorization/models"
	"github.com/golang-jwt/jwt/v5"
)

// Claims are the JWT claims embedded in access tokens.
type Claims struct {
	UserID  string          `json:"user_id"`
	Content json.RawMessage `json:"content"`
	Roles   json.RawMessage `json:"roles"`
	jwt.RegisteredClaims
}

// RefreshTokenClaims are the JWT claims embedded in refresh tokens.
type RefreshTokenClaims struct {
	SessionID           string          `json:"session_id"`
	UserID              string          `json:"user_id"`
	AccessTokenLifetime string          `json:"tokenlife,omitempty"`
	SigningMethodHMAC   string          `json:"signing_method,omitempty"`
	Content             json.RawMessage `json:"content,omitempty"`
	Roles               json.RawMessage `json:"roles,omitempty"`
	jwt.RegisteredClaims
}

// Tokens groups the access/refresh pair returned to clients.
type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

// TokenManager issues and validates JWTs.
//
// A TokenManager is safe for concurrent use.
type TokenManager struct {
	db *models.DBManager

	accessTokenDurationStr  string
	refreshTokenDurationStr string
	accessTokenDuration     time.Duration
	refreshTokenDuration    time.Duration

	signingMethodName string
	signingMethod     *jwt.SigningMethodHMAC
	jwtSecret         []byte
}

// NewTokenManager validates its arguments and pre-computes the
// expensive bits (duration parsing, signing-method lookup).
//
// Empty strings are replaced with sensible defaults.
func NewTokenManager(
	db *models.DBManager,
	accessTokenDuration string,
	refreshTokenDuration string,
	jwtSecret string,
	signingMethodHMAC string,
) *TokenManager {
	if accessTokenDuration == "" {
		accessTokenDuration = "30s"
	}
	if refreshTokenDuration == "" {
		refreshTokenDuration = "365d"
	}
	if signingMethodHMAC == "" {
		signingMethodHMAC = "HS256"
	}

	tm := &TokenManager{
		db:                      db,
		accessTokenDurationStr:  accessTokenDuration,
		refreshTokenDurationStr: refreshTokenDuration,
		signingMethodName:       signingMethodHMAC,
		signingMethod:           resolveSigningMethod(signingMethodHMAC),
		jwtSecret:               []byte(jwtSecret),
	}

	// Best-effort precompute; if parsing fails we fall back to a sane
	// default so that the package does not panic during boot. The
	// per-call helpers re-parse on demand if the cached value is zero.
	if d, err := ParseCustomDuration(accessTokenDuration, "30s"); err == nil {
		tm.accessTokenDuration = d
	} else {
		tm.accessTokenDuration = 30 * time.Second
	}
	if d, err := ParseCustomDuration(refreshTokenDuration, "365d"); err == nil {
		tm.refreshTokenDuration = d
	} else {
		tm.refreshTokenDuration = 365 * 24 * time.Hour
	}

	return tm
}

// GetJWTSecret returns the raw JWT secret. Used by middlewares that
// need to construct their own jwtware.Config.
func (tm *TokenManager) GetJWTSecret() string {
	return string(tm.jwtSecret)
}

// SigningMethod returns the resolved JWT signing method.
func (tm *TokenManager) SigningMethod() *jwt.SigningMethodHMAC {
	return tm.signingMethod
}

// AccessTokenDuration returns the parsed access-token lifetime.
func (tm *TokenManager) AccessTokenDuration() time.Duration {
	return tm.accessTokenDuration
}

// RefreshTokenDuration returns the parsed refresh-token lifetime.
func (tm *TokenManager) RefreshTokenDuration() time.Duration {
	return tm.refreshTokenDuration
}

// --- Authorize options ----------------------------------------------------

// AuthorizeOptions carries every input required to issue a new token pair.
// Build it via functional options (WithUserID, WithRoles, ...).
type AuthorizeOptions struct {
	ctx       context.Context
	userID    string
	sessionID string
	ipAddress string
	userAgent string
	content   json.RawMessage
	roles     json.RawMessage
}

// AuthorizeOptionsFunc is the functional-option type used with Authorize,
// RefreshAccessToken and the low-level token generators.
type AuthorizeOptionsFunc func(*AuthorizeOptions)

func defaultAuthorizeOptions() AuthorizeOptions {
	return AuthorizeOptions{
		ctx:     context.Background(),
		roles:   json.RawMessage("[]"),
		content: json.RawMessage("{}"),
	}
}

// NewAuthorizeOptions applies the provided functional options on top of
// the defaults and returns a populated AuthorizeOptions struct.
func NewAuthorizeOptions(opts ...AuthorizeOptionsFunc) *AuthorizeOptions {
	o := defaultAuthorizeOptions()
	for _, fn := range opts {
		if fn != nil {
			fn(&o)
		}
	}
	return &o
}

// WithUserID sets the user id stamped into the issued tokens / session.
func (tm *TokenManager) WithUserID(userID string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) { o.userID = userID }
}

// WithIPAddress records the client IP on the session row.
func (tm *TokenManager) WithIPAddress(ipAddress string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) { o.ipAddress = ipAddress }
}

// WithUserAgent records the User-Agent on the session row.
func (tm *TokenManager) WithUserAgent(userAgent string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) { o.userAgent = userAgent }
}

// WithContext propagates a context.Context through the call chain.
func (tm *TokenManager) WithContext(ctx context.Context) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		if ctx != nil {
			o.ctx = ctx
		}
	}
}

// WithContent attaches arbitrary application content (JSON) to the tokens.
func (tm *TokenManager) WithContent(content json.RawMessage) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		if len(content) > 0 {
			o.content = content
		}
	}
}

// WithSessionID forces a particular session id (used internally by the
// access-token generator after the session row has been created).
func (tm *TokenManager) WithSessionID(sessionID string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) { o.sessionID = sessionID }
}

// WithRoles sets the user roles embedded in the issued tokens.
func (tm *TokenManager) WithRoles(roles json.RawMessage) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		if len(roles) > 0 {
			o.roles = roles
		}
	}
}

// --- Token issuance -------------------------------------------------------

// Authorize creates a fresh session row and signs an access/refresh token
// pair for it.
//
// It returns the token pair, the new session id and an error, if any.
func (tm *TokenManager) Authorize(opts ...AuthorizeOptionsFunc) (Tokens, string, error) {
	options := NewAuthorizeOptions(opts...)

	if !json.Valid(options.content) {
		return Tokens{}, "", errors.New("invalid content JSON payload")
	}
	if !json.Valid(options.roles) {
		return Tokens{}, "", errors.New("invalid roles JSON payload")
	}

	sessionID, err := tm.createSession(options)
	if err != nil {
		return Tokens{}, "", fmt.Errorf("create session: %w", err)
	}

	accessToken, refreshToken, err := tm.signTokenPair(options, sessionID)
	if err != nil {
		return Tokens{}, "", err
	}

	return Tokens{AccessToken: accessToken, RefreshToken: refreshToken}, sessionID, nil
}

// createSession persists a new session row.
func (tm *TokenManager) createSession(o *AuthorizeOptions) (string, error) {
	if tm.db == nil {
		return "", errors.New("db manager is not initialized")
	}
	session := models.Session{
		UserID:    o.userID,
		IPAddress: o.ipAddress,
		UserAgent: o.userAgent,
	}
	if err := tm.db.DB().WithContext(o.ctx).Create(&session).Error; err != nil {
		return "", err
	}
	return session.ID, nil
}

// signTokenPair signs an access and a refresh token in one shot.
// Time.Now() is called once and reused so the lifetimes line up exactly.
func (tm *TokenManager) signTokenPair(o *AuthorizeOptions, sessionID string) (string, string, error) {
	now := time.Now()

	accessClaims := &Claims{
		UserID:  o.userID,
		Content: o.content,
		Roles:   o.roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(tm.accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	accessToken, err := jwt.NewWithClaims(tm.signingMethod, accessClaims).SignedString(tm.jwtSecret)
	if err != nil {
		return "", "", fmt.Errorf("sign access token: %w", err)
	}

	refreshClaims := &RefreshTokenClaims{
		SessionID:           sessionID,
		UserID:              o.userID,
		AccessTokenLifetime: tm.refreshTokenDuration.String(),
		SigningMethodHMAC:   tm.signingMethodName,
		Content:             o.content,
		Roles:               o.roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(tm.refreshTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	refreshToken, err := jwt.NewWithClaims(tm.signingMethod, refreshClaims).SignedString(tm.jwtSecret)
	if err != nil {
		return "", "", fmt.Errorf("sign refresh token: %w", err)
	}

	return accessToken, refreshToken, nil
}

// RefreshAccessToken issues a new access token from a previously-validated
// refresh-token claims set and the matching session row.
//
// Extra functional options can be passed to override the embedded content.
func (tm *TokenManager) RefreshAccessToken(
	refreshTokenClaims *RefreshTokenClaims,
	sessionData *models.Session,
	opts ...AuthorizeOptionsFunc,
) (string, error) {
	if refreshTokenClaims == nil {
		return "", errors.New("refresh token claims are required")
	}
	if sessionData == nil {
		return "", errors.New("session data is required")
	}

	options := NewAuthorizeOptions(opts...)
	now := time.Now()

	claims := &Claims{
		UserID:  refreshTokenClaims.UserID,
		Content: options.content,
		Roles:   sessionData.User.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(now.Add(tm.accessTokenDuration)),
			IssuedAt:  jwt.NewNumericDate(now),
		},
	}
	return jwt.NewWithClaims(tm.signingMethod, claims).SignedString(tm.jwtSecret)
}

// --- Header & token parsing ----------------------------------------------

// GetTokenFromHeader strips the "Bearer "/"Token " scheme from an
// Authorization header value. Returns the value as-is if no scheme is set
// and an error when the header is empty.
func (tm *TokenManager) GetTokenFromHeader(authHeader string) (string, error) {
	if authHeader == "" {
		return "", errors.New("authorization header is required")
	}
	switch {
	case len(authHeader) > 7 && strings.EqualFold(authHeader[:7], "Bearer "):
		return authHeader[7:], nil
	case len(authHeader) > 6 && strings.EqualFold(authHeader[:6], "Token "):
		return authHeader[6:], nil
	default:
		return authHeader, nil
	}
}

// ExtractToken parses and validates a refresh token, returning its claims.
func (tm *TokenManager) ExtractToken(tokenString string) (*RefreshTokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &RefreshTokenClaims{}, tm.keyFunc)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*RefreshTokenClaims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

// ExtractAccessClaims parses and validates an access token, returning its claims.
func (tm *TokenManager) ExtractAccessClaims(tokenString string) (*Claims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &Claims{}, tm.keyFunc)
	if err != nil {
		return nil, err
	}
	claims, ok := token.Claims.(*Claims)
	if !ok || !token.Valid {
		return nil, errors.New("invalid token")
	}
	return claims, nil
}

func (tm *TokenManager) keyFunc(token *jwt.Token) (any, error) {
	if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
		return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
	}
	return tm.jwtSecret, nil
}

// GetSigningMethod returns the JWT signing method named by `method`.
// Unknown / empty values fall back to HS256.
//
// Kept on the receiver for backward compatibility; new callers should use
// SigningMethod() to read the resolved value.
func (tm *TokenManager) GetSigningMethod(method string) *jwt.SigningMethodHMAC {
	return resolveSigningMethod(method)
}

func resolveSigningMethod(method string) *jwt.SigningMethodHMAC {
	switch strings.ToLower(method) {
	case "hs384":
		return jwt.SigningMethodHS384
	case "hs512":
		return jwt.SigningMethodHS512
	case "hs256", "":
		return jwt.SigningMethodHS256
	default:
		return jwt.SigningMethodHS256
	}
}

// --- Duration parsing -----------------------------------------------------

// unitMultipliers maps the package's custom duration units to their value.
//
// Declared as a package-level variable so it is allocated once instead of
// on every ParseCustomDuration call.
var unitMultipliers = map[string]time.Duration{
	"s":  time.Second,
	"m":  time.Minute,
	"h":  time.Hour,
	"d":  24 * time.Hour,
	"w":  7 * 24 * time.Hour,
	"mo": 30 * 24 * time.Hour,  // approximate month
	"y":  365 * 24 * time.Hour, // approximate year
}

// ParseCustomDuration parses values such as "30s", "15m", "1h", "7d",
// "4w", "1mo" or "1y". The empty string falls back to `defaultInput`.
//
// Kept as a package-level function (and the historical method on
// TokenManager forwards to it) so callers can reach it without a
// TokenManager instance.
func ParseCustomDuration(input, defaultInput string) (time.Duration, error) {
	if input == "" {
		input = defaultInput
	}

	// Split into the numeric prefix and the unit suffix without
	// allocating two strings.Builders like the previous implementation.
	splitAt := len(input)
	for i, r := range input {
		if r < '0' || r > '9' {
			splitAt = i
			break
		}
	}
	if splitAt == 0 {
		return 0, errors.New("invalid duration: missing number")
	}

	num, err := strconv.Atoi(input[:splitAt])
	if err != nil {
		return 0, fmt.Errorf("invalid number: %w", err)
	}
	unit := input[splitAt:]
	multiplier, ok := unitMultipliers[unit]
	if !ok {
		return 0, fmt.Errorf("invalid time unit: %q", unit)
	}
	return time.Duration(num) * multiplier, nil
}

// ParseCustomDuration is preserved as a method on TokenManager for
// backward compatibility. New callers should use the package-level
// ParseCustomDuration directly.
func (tm *TokenManager) ParseCustomDuration(input, defaultInput string) (time.Duration, error) {
	return ParseCustomDuration(input, defaultInput)
}
