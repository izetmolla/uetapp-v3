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

// Claims defines the JWT claims for access tokens.
type Claims struct {
	UserID  string          `json:"user_id"`
	Content json.RawMessage `json:"content"`
	Roles   json.RawMessage `json:"roles"`
	jwt.RegisteredClaims
}

// RefreshTokenClaims defines the JWT claims for refresh tokens.
type RefreshTokenClaims struct {
	SessionID           string          `json:"session_id"` // Optional session ID for refresh tokens
	UserID              string          `json:"user_id"`
	AccessTokenLifetime string          `json:"tokenlife,omitempty"`
	SigningMethodHMAC   string          `json:"signing_method,omitempty"`
	Content             json.RawMessage `json:"content,omitempty"`
	Roles               json.RawMessage `json:"roles,omitempty"`
	jwt.RegisteredClaims
}

type Tokens struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
}

type TokenManager struct {
	db                   *models.DBManager
	accessTokenDuration  string
	refreshTokenDuration string
	jwtSecret            string
	signingMethodHMAC    string
}

func NewTokenManager(db *models.DBManager, accessTokenDuration, refreshTokenDuration, jwtSecret, signingMethodHMAC string) *TokenManager {
	if accessTokenDuration == "" {
		accessTokenDuration = "30s"
	}
	if refreshTokenDuration == "" {
		refreshTokenDuration = "365d"
	}
	if signingMethodHMAC == "" {
		signingMethodHMAC = "HS256"
	}
	return &TokenManager{
		db:                   db,
		accessTokenDuration:  accessTokenDuration,
		refreshTokenDuration: refreshTokenDuration,
		jwtSecret:            jwtSecret,
	}
}

type AuthorizeOptions struct {
	ctx       context.Context
	userID    string
	sessionID string
	ipAddress string
	userAgent string
	content   json.RawMessage
	roles     json.RawMessage
}

type AuthorizeOptionsFunc func(*AuthorizeOptions)

func defaultAuthorizeOptions() AuthorizeOptions {
	return AuthorizeOptions{
		userID:    "",
		sessionID: "",
		ipAddress: "",
		userAgent: "",
		ctx:       context.Background(),
		roles:     json.RawMessage("[]"),
		content:   json.RawMessage("{}"),
	}
}

func NewAuthorizeOptions(opts ...AuthorizeOptionsFunc) *AuthorizeOptions {
	o := defaultAuthorizeOptions()
	for _, fn := range opts {
		fn(&o)
	}
	return &o
}

func (o *TokenManager) WithUserID(userID string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		o.userID = userID
	}
}

func (o *TokenManager) WithIPAddress(ipAddress string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		o.ipAddress = ipAddress
	}
}

func (o *TokenManager) WithUserAgent(userAgent string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		o.userAgent = userAgent
	}
}
func (o *TokenManager) WithContext(ctx context.Context) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		o.ctx = ctx
	}
}

func (o *TokenManager) WithContent(content json.RawMessage) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		o.content = content
	}
}

func (o *TokenManager) WithSessionID(sessionID string) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		o.sessionID = sessionID
	}
}

func (o *TokenManager) WithRoles(roles json.RawMessage) AuthorizeOptionsFunc {
	return func(o *AuthorizeOptions) {
		o.roles = roles
	}
}

func (o *TokenManager) GetJWTSecret() string {
	return o.jwtSecret
}

/**
 * Authorize generates a new access token and refresh token for a user.
 * @param userID string - The ID of the user to authorize.
 * @return Tokens - The tokens for the user.
 * @return SessionID - The session ID for the user.
 * @return error - The error if any.
 */
func (tm *TokenManager) Authorize(opts ...AuthorizeOptionsFunc) (Tokens, string, error) {
	options := NewAuthorizeOptions(opts...)
	if !json.Valid(options.content) {
		return Tokens{}, "", errors.New("invalid content JSON payload")
	}
	if !json.Valid(options.roles) {
		return Tokens{}, "", errors.New("invalid roles JSON payload")
	}
	sessionID, err := tm.createSession(
		tm.WithContext(options.ctx),
		tm.WithContent(json.RawMessage(options.content)),
		tm.WithUserID(options.userID),
		tm.WithSessionID(options.sessionID),
		tm.WithIPAddress(options.ipAddress),
		tm.WithUserAgent(options.userAgent),
		tm.WithRoles(options.roles),
	)
	if err != nil {
		return Tokens{}, "", err
	}
	accessToken, refreshToken, err := tm.generateTokens(
		tm.WithContext(options.ctx),
		tm.WithUserID(options.userID),
		tm.WithSessionID(sessionID),
		tm.WithContent(options.content),
	)
	if err != nil {
		return Tokens{}, "", err
	}

	tokens := Tokens{
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
	}
	return tokens, sessionID, nil
}

func (tm *TokenManager) createSession(opts ...AuthorizeOptionsFunc) (string, error) {
	options := NewAuthorizeOptions(opts...)
	session := models.Session{
		UserID:    options.userID,
		IPAddress: options.ipAddress,
		UserAgent: options.userAgent,
	}
	if err := tm.db.DB().WithContext(options.ctx).Create(&session).Error; err != nil {
		return "", err
	}
	return session.ID, nil
}

func (tm *TokenManager) generateTokens(opts ...AuthorizeOptionsFunc) (accessToken, refreshToken string, err error) {
	options := NewAuthorizeOptions(opts...)

	accessTokenDuration, err := tm.ParseCustomDuration(tm.accessTokenDuration, "30s")
	if err != nil {
		return "", "", errors.New("failed to parse access token lifetime: " + err.Error())
	}
	accessTokenClaims := &Claims{
		UserID:  options.userID,
		Content: json.RawMessage(options.content),
		Roles:   options.roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(accessTokenDuration)),
		},
	}

	accessToken, err = jwt.NewWithClaims(tm.GetSigningMethod(tm.signingMethodHMAC), accessTokenClaims).SignedString([]byte(tm.jwtSecret))
	if err != nil {
		return "", "", err
	}

	refreshExpDuration, err := tm.ParseCustomDuration(tm.refreshTokenDuration, "365d")
	if err != nil {
		return "", "", fmt.Errorf("failed to parse refresh token lifetime: %w", err)
	}
	refreshExp := time.Now().Add(refreshExpDuration)
	refreshTokenClaims := &RefreshTokenClaims{
		SessionID:           options.sessionID, // Optional session ID for refresh tokens
		UserID:              options.userID,
		AccessTokenLifetime: refreshExpDuration.String(),
		SigningMethodHMAC:   tm.signingMethodHMAC,
		Content:             json.RawMessage(options.content),
		Roles:               json.RawMessage(options.roles),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(refreshExp),
		},
	}

	refreshToken, err = jwt.NewWithClaims(tm.GetSigningMethod(tm.signingMethodHMAC), refreshTokenClaims).SignedString([]byte(tm.jwtSecret))
	if err != nil {
		return "", "", err
	}

	return accessToken, refreshToken, nil
}

// GetTokenFromHeader extracts the JWT token from the Authorization header.
//
// Parameters:
//   - c: Fiber context containing the request headers
//
// Returns:
//   - string: The extracted token
//   - error: Error if token extraction fails
func (a *TokenManager) GetTokenFromHeader(authHeader string) (string, error) {
	if authHeader == "" {
		return "", fmt.Errorf("authorization header is required")
	}

	// Check for Bearer token
	if len(authHeader) > 7 && authHeader[:7] == "Bearer " {
		return authHeader[7:], nil
	}

	// Check for Token scheme
	if len(authHeader) > 6 && authHeader[:6] == "Token " {
		return authHeader[6:], nil
	}

	// Return as-is if no scheme is specified
	return authHeader, nil
}

// RefreshAccessToken generates a new access token using the provided JWT options.
//
// Parameters:
//   - opt: JWT options containing user ID, metadata, and roles
//
// Returns:
//   - string: The new access token
//   - error: Error if token generation fails
func (tm *TokenManager) RefreshAccessToken(refreshTokenClaims *RefreshTokenClaims, sessionData *models.Session, opts ...AuthorizeOptionsFunc) (string, error) {
	options := NewAuthorizeOptions(opts...)
	accessExpDuration, err := tm.ParseCustomDuration(tm.accessTokenDuration, "30s")
	if err != nil {
		return "", fmt.Errorf("failed to parse access token lifetime: %w", err)
	}
	expirationTime := time.Now().Add(accessExpDuration)
	claims := &Claims{
		UserID:  refreshTokenClaims.UserID,
		Content: json.RawMessage(options.content),
		Roles:   json.RawMessage(sessionData.User.Roles),
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
		},
	}
	return jwt.NewWithClaims(tm.GetSigningMethod(tm.signingMethodHMAC), claims).SignedString([]byte(tm.jwtSecret))
}

// ExtractToken parses and validates a JWT token string.
//
// Parameters:
//   - tokenString: The JWT token string to parse
//
// Returns:
//   - *RefreshTokenClaims: The parsed token claims
//   - error: Error if token parsing fails
func (tm *TokenManager) ExtractToken(tokenString string) (*RefreshTokenClaims, error) {
	token, err := jwt.ParseWithClaims(tokenString, &RefreshTokenClaims{}, func(token *jwt.Token) (any, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}
		return []byte(tm.jwtSecret), nil
	})

	if err != nil {
		return nil, err
	}

	if claims, ok := token.Claims.(*RefreshTokenClaims); ok && token.Valid {
		return claims, nil
	}

	return nil, errors.New("invalid token")
}

// GetSigningMethod returns the JWT signing method based on the provided string.
// Defaults to HS256 if the method is unknown or empty.
//
// Parameters:
//   - method: The signing method string (e.g., "HS256", "HS384", "HS512")
//
// Returns:
//   - *jwt.SigningMethodHMAC: The corresponding signing method
func (tm *TokenManager) GetSigningMethod(method string) *jwt.SigningMethodHMAC {
	switch strings.ToLower(method) {
	case "hs256":
		return jwt.SigningMethodHS256
	case "hs384":
		return jwt.SigningMethodHS384
	case "hs512":
		return jwt.SigningMethodHS512
	default:
		return jwt.SigningMethodHS256
	}
}

// ParseCustomDuration parses a custom duration string (e.g., "1d", "30s") or returns the default if empty.
//
// Parameters:
//   - input: The duration string to parse (e.g., "30s", "1h", "7d", "1y")
//   - defaultInput: The default duration string if input is empty
//
// Returns:
//   - time.Duration: The parsed duration
//   - error: Error if parsing fails
func (tm *TokenManager) ParseCustomDuration(input, defaultInput string) (time.Duration, error) {
	if input == "" {
		input = defaultInput
	}
	unitMultipliers := map[string]time.Duration{
		"s":  time.Second,
		"m":  time.Minute,
		"h":  time.Hour,
		"d":  time.Hour * 24,
		"w":  time.Hour * 24 * 7,
		"mo": time.Hour * 24 * 30,  // approximate month
		"y":  time.Hour * 24 * 365, // approximate year
	}

	var numPart strings.Builder
	var unitPart strings.Builder

	for _, r := range input {
		if r >= '0' && r <= '9' {
			numPart.WriteRune(r)
		} else {
			unitPart.WriteRune(r)
		}
	}

	num, err := strconv.Atoi(numPart.String())
	if err != nil {
		return 0, fmt.Errorf("invalid number: %w", err)
	}

	unit := unitPart.String()
	multiplier, ok := unitMultipliers[unit]
	if !ok {
		return 0, errors.New("invalid time unit: " + unit)
	}

	return time.Duration(num) * multiplier, nil
}
