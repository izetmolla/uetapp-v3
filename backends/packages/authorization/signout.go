package authorization

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/flowtrove/packages/authorization/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

// SignOut tears down a session: it soft-deletes the DB row and, when a
// Redis cache is configured, evicts the cached entry too.
//
// A missing DB row is *not* an error: it is treated as "already signed
// out" and the cache is best-effort cleared.
func (a *Authorization) SignOut(ctx context.Context, sessionID string) error {
	if a == nil || a.dbManager == nil {
		return errors.New("db manager is not initialized")
	}
	if sessionID == "" {
		return errors.New("session id is required")
	}

	db := a.dbManager

	var session models.Session
	err := db.DB().
		WithContext(ctx).
		Select("id").
		Where("id = ?", sessionID).
		First(&session).Error

	switch {
	case errors.Is(err, gorm.ErrRecordNotFound):
		a.evictSession(ctx, sessionID)
		return nil
	case err != nil:
		return fmt.Errorf("lookup session: %w", err)
	}

	if err := db.DB().
		WithContext(ctx).
		Model(&models.Session{}).
		Where("id = ?", session.ID).
		Update("is_deleted", true).Error; err != nil {
		return fmt.Errorf("soft-delete session: %w", err)
	}

	a.evictSession(ctx, sessionID)
	return nil
}

// evictSession is a Redis-aware best-effort cache eviction. Errors are
// swallowed because failing to evict shouldn't mask a successful DB
// sign-out, and a missing/disabled Redis is not an error condition.
func (a *Authorization) evictSession(ctx context.Context, sessionID string) {
	if a.dbManager == nil || a.dbManager.Redis() == nil {
		return
	}
	_ = a.dbManager.DeleteSessionFromRedis(ctx, sessionID)
}

// RemoveCookie expires the session cookie on the client. It mirrors the
// attributes used by SetCookie so the browser actually deletes the
// cookie instead of writing a second one.
func (a *Authorization) RemoveCookie(c fiber.Ctx, _ string) {
	c.Cookie(&fiber.Cookie{
		Name:     a.cookieSessionName,
		Value:    "",
		Domain:   a.cookieDomain,
		Path:     "/",
		MaxAge:   -1,
		Expires:  time.Unix(0, 0).UTC(),
		HTTPOnly: true,
		Secure:   true,
		SameSite: fiber.CookieSameSiteLaxMode,
	})
}
