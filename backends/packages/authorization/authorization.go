package authorization

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"

	"github.com/flowtrove/packages/authorization/models"
	"github.com/flowtrove/packages/authorization/utils"
	jwtware "github.com/gofiber/contrib/v3/jwt"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

type AuthorizationInterface interface {
	SignIn(opts ...SignInOptionsFunc) (SignInResponse, error)
}
type Authorization struct {
	dbManager       *models.DBManager
	passwordManager *utils.PasswordManager
	tokenManager    *utils.TokenManager

	cookieSessionName string
	authURL           string
	signInRedirectURL string
}

func NewAuthorization(cfg *AuthorizationOptions) (*Authorization, error) {
	auth := Authorization{}

	if cfg.DB == nil {
		return nil, errors.New("DB is required")
	}

	if cfg.JWTSecret == "" {
		return nil, errors.New("JWT_SECRET is required")
	}

	auth.dbManager = models.New().
		WithDb(cfg.DB).
		WithRedis(cfg.Redis).
		WithSessionsTableName(cfg.SessionTableName).
		WithUsersTableName(cfg.UserTableName).
		WithUserModel(cfg.UserModel).
		WithSessionModel(cfg.SessionModel).
		WithAutoMigration()

	if cfg.AuthURL == "" {
		return nil, errors.New("AUTH_URL is required")
	} else {
		auth.authURL = cfg.AuthURL
	}
	if cfg.SignInRedirectURL == "" {
		auth.signInRedirectURL = fmt.Sprintf("%s/sign-in", auth.authURL)
	} else {
		auth.signInRedirectURL = cfg.SignInRedirectURL
	}
	if cfg.CookieSessionName == "" {
		auth.cookieSessionName = DefaultCookieSessionName
	} else {
		auth.cookieSessionName = cfg.CookieSessionName
	}

	if cfg.AutoMigration {
		if err := auth.dbManager.DB().AutoMigrate(auth.dbManager.GetUserModel(), auth.dbManager.GetSessionModel()); err != nil {
			return nil, err
		}
	}

	auth.tokenManager = utils.NewTokenManager(auth.dbManager, cfg.AccessTokenDuration, cfg.RefreshTokenDuration, cfg.JWTSecret, "HS256")
	auth.passwordManager = utils.NewPasswordManager(12)

	return &auth, nil
}

func (a *Authorization) DBManager() *models.DBManager {
	return a.dbManager
}

func (a *Authorization) PasswordManager() *utils.PasswordManager {
	return a.passwordManager
}

func (a *Authorization) TokenManager() *utils.TokenManager {
	return a.tokenManager
}

func (a *Authorization) GetClaims(ctx fiber.Ctx) (any, error) {
	user := jwtware.FromContext(ctx)
	if user == nil {
		return nil, errors.New("missing jwt token in context")
	}
	claims, ok := user.Claims.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	return claims, nil
}

func (a *Authorization) GetRoles(ctx fiber.Ctx) ([]string, error) {
	claimsAny, err := a.GetClaims(ctx)
	if err != nil {
		return nil, err
	}
	mc, ok := claimsAny.(jwt.MapClaims)
	if !ok {
		return nil, errors.New("invalid claims")
	}
	raw := mc["roles"]
	if raw == nil {
		return nil, errors.New("invalid roles")
	}
	if roles, ok := raw.([]string); ok {
		return roles, nil
	}
	arr, ok := raw.([]any)
	if !ok {
		return nil, errors.New("invalid roles")
	}
	out := make([]string, 0, len(arr))
	for _, x := range arr {
		s, ok := x.(string)
		if !ok {
			return nil, errors.New("invalid roles")
		}
		out = append(out, s)
	}
	return out, nil
}

func (a *Authorization) GetSession(ctx context.Context, sessionID string) (*models.Session, error) {
	return a.dbManager.GetSessionFromDB(ctx, sessionID)
}

type AuthData struct {
	SessionID string
	UserID    string
	Roles     []string
}

func (a *Authorization) GetAuthDataAPI(ctx fiber.Ctx) (d AuthData, err error) {
	claims, err := a.GetClaims(ctx)
	if err != nil {
		return d, err
	}
	mc, ok := claims.(jwt.MapClaims)
	if !ok {
		return d, errors.New("invalid claims")
	}
	d.SessionID, ok = mc["session_id"].(string)
	if !ok {
		d.SessionID = ""
	}
	d.UserID, ok = mc["user_id"].(string)
	if !ok {
		d.UserID = ""
	}
	rolesRaw, ok := mc["roles"].(json.RawMessage)
	if ok {
		d.Roles = utils.FormatRoles(rolesRaw)
	}

	return d, nil
}
func (a *Authorization) GetAuthDataWEB(ctx fiber.Ctx) (AuthData, error) {
	sessionID := a.GetSessionID(ctx)
	session, err := a.GetSession(ctx.Context(), sessionID)
	if err != nil {
		return AuthData{}, err
	}
	return AuthData{
		SessionID: sessionID,
		UserID:    session.UserID,
		Roles:     utils.FormatRoles(session.User.Roles),
	}, nil
}
