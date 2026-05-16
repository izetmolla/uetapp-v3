package authorization

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/flowtrove/packages/authorization/utils"
	"github.com/gofiber/fiber/v3"
)

type SignInRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignInResponse struct {
	User      any                `json:"user"`
	SessionID string             `json:"session_id"`
	Tokens    utils.Tokens       `json:"tokens"`
	Error     AuthorizationError `json:"error"`
}

// SignInOptions is the options for the SignIn method
type SignInOptions struct {
	Ctx       context.Context
	Email     string
	Password  string
	Content   json.RawMessage
	IPAddress string
	UserAgent string
}

// SignInOptionsFunc is a function that sets the options for the SignIn method
type SignInOptionsFunc func(*SignInOptions)

func defaultSignInOptions() SignInOptions {
	return SignInOptions{
		Ctx:      context.Background(),
		Email:    "",
		Password: "",
	}
}

// NewSignInOptions creates a new SignInOptions struct with the given options
func NewSignInOptions(opts ...SignInOptionsFunc) *SignInOptions {
	o := defaultSignInOptions()
	for _, fn := range opts {
		fn(&o)
	}
	return &o
}

// WithContext sets the context for the SignIn method
func (o *Authorization) WithContext(ctx fiber.Ctx) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.Ctx = ctx
	}
}

// WithEmail sets the email for the SignIn method
func (o *Authorization) WithEmail(email string) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.Email = email
	}
}

// WithPassword sets the password for the SignIn method
func (o *Authorization) WithPassword(password string) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.Password = password
	}
}

func (o *Authorization) WithCredentials(email, password string) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.Email = email
		o.Password = password
	}
}

func (o *Authorization) WithContent(content json.RawMessage) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.Content = content
	}
}

func (o *Authorization) WithIPAddress(ipAddress string) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.IPAddress = ipAddress
	}
}

func (o *Authorization) WithUserAgent(userAgent string) SignInOptionsFunc {
	return func(o *SignInOptions) {
		o.UserAgent = userAgent
	}
}

func (a *Authorization) SignIn(opts ...SignInOptionsFunc) (SignInResponse, error) {
	userResponse := SignInResponse{}
	db := a.DBManager()
	tm := a.TokenManager()
	options := NewSignInOptions(opts...)

	user, err := db.FindUser(options.Ctx, options.Email)
	if err != nil {
		return SignInResponse{Error: AuthorizationError{Error: errors.New("user not found"), Field: "email"}}, err
	}

	if !a.passwordManager.IsValidPassword(user.Password, options.Password) {
		userResponse.Error = AuthorizationError{Error: errors.New("invalid credentials"), Field: "password"}
		return userResponse, errors.New("invalid credentials")
	}

	content := options.Content
	if len(content) == 0 {
		content, err = json.Marshal(map[string]any{})
		if err != nil {
			return userResponse, err
		}
	}

	tokens, sessionID, err := tm.Authorize(
		tm.WithContext(options.Ctx),
		tm.WithUserID(user.ID),
		tm.WithRoles(user.Roles),
		tm.WithIPAddress(options.IPAddress),
		tm.WithUserAgent(options.UserAgent),
		tm.WithContent(content),
	)
	if err != nil {
		return userResponse, err
	}

	userResponse.Tokens = tokens
	userResponse.SessionID = sessionID
	utils.StripPasswordFromUserModel(user)
	userResponse.User = user

	return userResponse, nil
}

func (a *Authorization) CheckEmail(opts ...SignInOptionsFunc) (SignInResponse, error) {
	db := a.DBManager()
	options := NewSignInOptions(opts...)
	user, err := db.FindUser(options.Ctx, options.Email)
	if err != nil {
		return SignInResponse{Error: AuthorizationError{Error: errors.New("user not found"), Field: "email"}}, err
	}
	if user == nil {
		return SignInResponse{Error: AuthorizationError{Error: errors.New("user not found"), Field: "email"}}, nil
	}
	utils.StripPasswordFromUserModel(user)
	return SignInResponse{User: user}, nil
}

func (a *Authorization) SetCookie(c fiber.Ctx, sessionID string) {
	cookie := new(fiber.Cookie)
	cookie.Name = a.cookieSessionName
	cookie.Value = sessionID
	// Set Domain to a dot-prefixed base domain to cover all subdomains.
	cookie.Domain = fmt.Sprintf(".%s", utils.GetDomainWithoutWWW(a.authURL))
	cookie.Path = "/"
	cookie.Expires = time.Now().Add(365 * 24 * time.Hour)
	cookie.HTTPOnly = true
	cookie.Secure = true
	cookie.SameSite = fiber.CookieSameSiteLaxMode
	c.Cookie(cookie)
}
