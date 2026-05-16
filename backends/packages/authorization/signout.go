package authorization

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/flowtrove/packages/authorization/models"
	"github.com/flowtrove/packages/authorization/utils"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// SignInOptions is the options for the SignIn method
type SignOutOptions struct {
	Ctx       context.Context
	SessionID string
}

// SignInOptionsFunc is a function that sets the options for the SignIn method
type SignOutOptionsFunc func(*SignOutOptions)

func defaultSignOutOptions() SignOutOptions {
	return SignOutOptions{
		Ctx:       context.Background(),
		SessionID: "",
	}
}

// NewSignInOptions creates a new SignInOptions struct with the given options
func NewSignOutOptions(opts ...SignOutOptionsFunc) *SignOutOptions {
	o := defaultSignOutOptions()
	for _, fn := range opts {
		fn(&o)
	}
	return &o
}

func (o *Authorization) SignOut(ctx context.Context, sessionID string) error {
	db := o.DBManager()
	if db == nil {
		return errors.New("db manager is not initialized")
	}
	var session models.Session
	if err := db.DB().WithContext(ctx).Where("id = ?", sessionID).Select("id").First(&session).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return db.DeleteSessionFromRedis(ctx, sessionID)
		}
		return err
	}

	if err := db.DB().WithContext(ctx).Model(&models.Session{}).Where("id = ?", session.ID).Update("is_deleted", true).Error; err != nil {
		return err
	}
	if err := db.DeleteSessionFromRedis(ctx, sessionID); err != nil {
		return err
	}

	return nil
}

func (a *Authorization) RemoveCookie(c fiber.Ctx, _ string) {
	// Match SetCookie name/domain/path/flags; MaxAge<0 and epoch Expires issue Max-Age=0 + Expires in the past so browsers remove the cookie.
	cookie := &fiber.Cookie{
		Name:     a.cookieSessionName,
		Value:    "",
		Domain:   fmt.Sprintf(".%s", utils.GetDomainWithoutWWW(a.authURL)),
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0).UTC(),
		HTTPOnly: true,
		Secure:   true,
		SameSite: fiber.CookieSameSiteLaxMode,
	}
	c.Cookie(cookie)
}
