package authorization

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/flowtrove/packages/authorization/utils"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// SignInRequest is the canonical sign-in payload accepted by callers
// that want to use the package's request struct directly.
type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// SignInResponse is returned by SignIn / CheckEmail. It groups the
// authenticated user, the new session id, the token pair and any
// validation error encountered.
type SignInResponse struct {
	User      any                `json:"user"`
	SessionID string             `json:"session_id"`
	Tokens    utils.Tokens       `json:"tokens"`
	Error     AuthorizationError `json:"error"`
}

// --- Functional options --------------------------------------------------

// SignInOptions is the input bag built by the WithXxx functional options
// below and consumed by SignIn / CheckEmail.
type SignInOptions struct {
	Ctx           context.Context
	Email         string
	Password      string
	Content       json.RawMessage
	IPAddress     string
	UserAgent     string
	Method        string
	PasswordCheck bool
}

// SignInOptionsFunc mutates a SignInOptions in place.
type SignInOptionsFunc func(*SignInOptions)

func defaultSignInOptions() SignInOptions {
	return SignInOptions{Ctx: context.Background(), Method: "credentials", PasswordCheck: true}
}

// NewSignInOptions applies the provided functional options on top of
// the defaults.
func NewSignInOptions(opts ...SignInOptionsFunc) *SignInOptions {
	o := defaultSignInOptions()
	for _, fn := range opts {
		if fn != nil {
			fn(&o)
		}
	}
	return &o
}

// WithContext propagates a context through the sign-in pipeline.
// fiber.Ctx satisfies context.Context in Fiber v3, so passing the
// request context works seamlessly.
func (a *Authorization) WithContext(ctx context.Context) SignInOptionsFunc {
	return func(o *SignInOptions) {
		if ctx != nil {
			o.Ctx = ctx
		}
	}
}

// WithEmail sets the email used for the lookup.
func (a *Authorization) WithEmail(email string) SignInOptionsFunc {
	return func(o *SignInOptions) { o.Email = email }
}

// WithPassword sets the cleartext password used for the verification.
func (a *Authorization) WithPassword(password string) SignInOptionsFunc {
	return func(o *SignInOptions) { o.Password = password }
}

// WithCredentials is a convenience for setting Email and Password in one call.
func (a *Authorization) WithCredentials(email, password string) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.Email = email
		o.Password = password
	}
}

// WithContent attaches arbitrary application content that is then
// stamped into the JWT.
func (a *Authorization) WithContent(content json.RawMessage) SignInOptionsFunc {
	return func(o *SignInOptions) { o.Content = content }
}

// WithIPAddress records the client IP on the session row.
func (a *Authorization) WithIPAddress(ipAddress string) SignInOptionsFunc {
	return func(o *SignInOptions) { o.IPAddress = ipAddress }
}

// WithUserAgent records the User-Agent on the session row.
func (a *Authorization) WithUserAgent(userAgent string) SignInOptionsFunc {
	return func(o *SignInOptions) { o.UserAgent = userAgent }
}

// WithMethod records the method on the session row.
func (a *Authorization) WithMethod(method string) SignInOptionsFunc {
	return func(o *SignInOptions) { o.Method = method }
}

// Skip Password Check
func (a *Authorization) WithPasswordCheck(passwordCheck bool) SignInOptionsFunc {
	return func(o *SignInOptions) { o.PasswordCheck = passwordCheck }
}

// --- SignIn / CheckEmail --------------------------------------------------

// SignIn authenticates a user with email + password, creates a session,
// issues a token pair and returns everything bundled in a SignInResponse.
//
// On a *user-facing* failure (user not found / wrong password) the
// returned error is one of the package sentinels (ErrUserNotFound,
// ErrInvalidCredentials) and SignInResponse.Error is populated with a
// friendly field marker. Unexpected errors (DB failures, JSON errors)
// are returned wrapped.
func (a *Authorization) SignIn(opts ...SignInOptionsFunc) (SignInResponse, error) {
	options := NewSignInOptions(opts...)

	user, err := a.dbManager.FindUser(options.Ctx, options.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return SignInResponse{
				Error: AuthorizationError{Error: ErrUserNotFound, Field: "email"},
			}, ErrUserNotFound
		}
		return SignInResponse{
			Error: AuthorizationError{Error: err, Field: "email"},
		}, fmt.Errorf("find user: %w", err)
	}

	if options.PasswordCheck && !a.passwordManager.IsValidPassword(user.Password, options.Password) {
		return SignInResponse{
			Error: AuthorizationError{Error: ErrInvalidCredentials, Field: "password"},
		}, ErrInvalidCredentials
	}

	content, err := normalizeContent(options.Content)
	if err != nil {
		return SignInResponse{}, err
	}

	tm := a.tokenManager
	tokens, sessionID, err := tm.Authorize(
		tm.WithContext(options.Ctx),
		tm.WithUserID(user.ID),
		tm.WithRoles(user.Roles),
		tm.WithIPAddress(options.IPAddress),
		tm.WithUserAgent(options.UserAgent),
		tm.WithContent(content),
		tm.WithMethod(options.Method),
	)
	if err != nil {
		return SignInResponse{}, fmt.Errorf("issue tokens: %w", err)
	}

	utils.StripPasswordFromUserModel(user)
	return SignInResponse{
		Tokens:    tokens,
		SessionID: sessionID,
		User:      user,
	}, nil
}

// SignInAfterLDAP issues tokens for a user already authenticated via LDAP.
// The local password is not checked; email must match an existing users row.
func (a *Authorization) SignInAfterLDAP(opts ...SignInOptionsFunc) (SignInResponse, error) {
	options := NewSignInOptions(opts...)

	user, err := a.dbManager.FindUser(options.Ctx, options.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return SignInResponse{
				Error: AuthorizationError{Error: ErrUserNotFound, Field: "email"},
			}, ErrUserNotFound
		}
		return SignInResponse{
			Error: AuthorizationError{Error: err, Field: "email"},
		}, fmt.Errorf("find user: %w", err)
	}

	content, err := normalizeContent(options.Content)
	if err != nil {
		return SignInResponse{}, err
	}

	tm := a.tokenManager
	tokens, sessionID, err := tm.Authorize(
		tm.WithContext(options.Ctx),
		tm.WithUserID(user.ID),
		tm.WithRoles(user.Roles),
		tm.WithIPAddress(options.IPAddress),
		tm.WithUserAgent(options.UserAgent),
		tm.WithContent(content),
	)
	if err != nil {
		return SignInResponse{}, fmt.Errorf("issue tokens: %w", err)
	}

	utils.StripPasswordFromUserModel(user)
	return SignInResponse{
		Tokens:    tokens,
		SessionID: sessionID,
		User:      user,
	}, nil
}

// CheckEmail returns the (password-stripped) user matching the supplied
// email, without performing any credential check. Useful for two-step
// sign-in UIs.
func (a *Authorization) CheckEmail(opts ...SignInOptionsFunc) (SignInResponse, error) {
	options := NewSignInOptions(opts...)

	user, err := a.dbManager.FindUser(options.Ctx, options.Email)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return SignInResponse{
				Error: AuthorizationError{Error: ErrUserNotFound, Field: "email"},
			}, ErrUserNotFound
		}
		return SignInResponse{
			Error: AuthorizationError{Error: err, Field: "email"},
		}, fmt.Errorf("find user: %w", err)
	}

	utils.StripPasswordFromUserModel(user)
	return SignInResponse{User: user}, nil
}

// normalizeContent guarantees the content passed downstream is valid
// JSON. Empty input becomes an empty object so the resulting JWT still
// holds a well-formed "content" field.
func normalizeContent(content json.RawMessage) (json.RawMessage, error) {
	if len(content) == 0 {
		return json.RawMessage(`{}`), nil
	}
	if !json.Valid(content) {
		return nil, ErrInvalidContent
	}
	return content, nil
}

// --- Cookie helpers ------------------------------------------------------

// SetCookie stores the session id in an HTTP-only, secure cookie scoped
// to the auth domain. The cookie is valid for 365 days and uses
// SameSite=Lax so cross-subdomain navigation keeps the user signed in.
func (a *Authorization) SetCookie(c fiber.Ctx, sessionID string) {
	c.Cookie(&fiber.Cookie{
		Name:     a.cookieSessionName,
		Value:    sessionID,
		Domain:   a.cookieDomain,
		Path:     "/",
		Expires:  time.Now().Add(365 * 24 * time.Hour),
		HTTPOnly: true,
		Secure:   true,
		SameSite: fiber.CookieSameSiteLaxMode,
	})
}
