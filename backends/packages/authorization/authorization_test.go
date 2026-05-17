package authorization_test

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/flowtrove/packages/authorization"
	"github.com/flowtrove/packages/authorization/models"
	"github.com/flowtrove/packages/authorization/utils"
	"github.com/glebarez/sqlite"
	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// usersDDL / sessionsDDL mirror the production schema closely enough
// for tests but drop the Postgres-only `gen_random_uuid()` default
// (BeforeCreate fills the id either way). JSON-bearing columns are
// declared BLOB so the sqlite driver returns them as []byte, which is
// what json.RawMessage expects when scanning - declaring them TEXT
// causes a "unsupported Scan, storing driver.Value type string into
// type *json.RawMessage" error.
const usersDDL = `
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  last_name TEXT,
  email TEXT,
  username TEXT UNIQUE,
  password TEXT,
  image TEXT,
  is_confirmed INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active',
  roles BLOB DEFAULT '[]',
  content BLOB DEFAULT '{}',
  metadata BLOB DEFAULT '{}',
  created_at DATETIME,
  updated_at DATETIME,
  deleted_at DATETIME
);`

const sessionsDDL = `
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  ip_address TEXT,
  user_agent TEXT,
  method TEXT DEFAULT 'credentials',
  expires_at DATETIME,
  is_deleted INTEGER DEFAULT 0,
  created_at DATETIME,
  updated_at DATETIME,
  deleted_at DATETIME
);`

// newAuth boots an in-process Authorization wired against an in-memory
// SQLite DB. Tests use it instead of a real PostgreSQL because we want
// runs to be hermetic, fast and parallelizable.
func newAuth(t *testing.T) (*authorization.Authorization, *gorm.DB) {
	t.Helper()

	// Each test gets its own in-memory database. We use cache=shared
	// so the connection pool sees the same DB across goroutines (the
	// concurrent refresh test depends on this), and a per-test
	// name so otherwise unrelated tests cannot collide.
	dsn := "file:" + uniqueDBName(t) + "?mode=memory&cache=shared"
	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("open sqlite: %v", err)
	}
	for _, ddl := range []string{usersDDL, sessionsDDL} {
		if err := db.Exec(ddl).Error; err != nil {
			t.Fatalf("create schema: %v", err)
		}
	}
	t.Cleanup(func() {
		sqlDB, _ := db.DB()
		_ = sqlDB.Close()
	})

	auth, err := authorization.NewAuthorization(&authorization.AuthorizationOptions{
		DB:                   db,
		JWTSecret:            "test-secret-do-not-use-in-prod",
		AccessTokenDuration:  "1m",
		RefreshTokenDuration: "1h",
		AuthURL:              "https://example.com",
		UserModel:            &models.User{},
		SessionModel:         &models.Session{},
	})
	if err != nil {
		t.Fatalf("NewAuthorization: %v", err)
	}
	return auth, db
}

// uniqueDBName produces a per-test SQLite memory DB name so that
// parallel tests don't share state.
func uniqueDBName(t *testing.T) string {
	t.Helper()
	return "auth-test-" + strings.ReplaceAll(strings.ReplaceAll(t.Name(), "/", "_"), " ", "_")
}

func seedUser(t *testing.T, auth *authorization.Authorization, db *gorm.DB, email, password string, roles []string) *models.User {
	t.Helper()
	hash, err := auth.PasswordManager().HashPassword(password)
	if err != nil {
		t.Fatalf("hash password: %v", err)
	}
	rolesJSON, err := json.Marshal(roles)
	if err != nil {
		t.Fatalf("marshal roles: %v", err)
	}

	id := uuid.NewString()
	now := time.Now().UTC()

	// We use a raw INSERT instead of GORM's Create to avoid the
	// RETURNING clause: SQLite hands JSON columns back as Go strings,
	// but json.RawMessage's Scan implementation only accepts []byte
	// and the resulting "unsupported Scan" error masks the test.
	// Insert JSON values as []byte so SQLite stores them with BLOB
	// affinity, which is what json.RawMessage's Scan implementation
	// can read back. Passing them as Go strings forces TEXT affinity
	// and yields an "unsupported Scan" error on read.
	if err := db.Exec(
		`INSERT INTO users (id, email, username, password, first_name, last_name, image, is_confirmed, status, roles, content, metadata, created_at, updated_at)
         VALUES (?, ?, ?, ?, '', '', '', 0, 'active', ?, ?, ?, ?, ?)`,
		id, email, email, hash, rolesJSON, []byte("{}"), []byte("{}"), now, now,
	).Error; err != nil {
		t.Fatalf("seed user: %v", err)
	}

	return &models.User{
		ID:       id,
		Email:    email,
		Username: email,
		Password: hash,
		Roles:    rolesJSON,
		Content:  json.RawMessage(`{}`),
		Metadata: json.RawMessage(`{}`),
	}
}

// --- NewAuthorization ----------------------------------------------------

func TestNewAuthorization_ConfigErrors(t *testing.T) {

	if _, err := authorization.NewAuthorization(nil); !errors.Is(err, authorization.ErrNilConfig) {
		t.Fatalf("nil config: want ErrNilConfig, got %v", err)
	}
	if _, err := authorization.NewAuthorization(&authorization.AuthorizationOptions{}); !errors.Is(err, authorization.ErrMissingDB) {
		t.Fatalf("no db: want ErrMissingDB, got %v", err)
	}
}

// --- Sign-in --------------------------------------------------------------

func TestSignIn_HappyPath(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", []string{"user:rw"})

	res, err := auth.SignIn(
		auth.WithContext(context.Background()),
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}
	if res.SessionID == "" {
		t.Fatal("expected session id")
	}
	if res.Tokens.AccessToken == "" || res.Tokens.RefreshToken == "" {
		t.Fatal("expected token pair")
	}

	claims, err := auth.TokenManager().ExtractAccessClaims(res.Tokens.AccessToken)
	if err != nil {
		t.Fatalf("extract claims: %v", err)
	}
	if claims.UserID == "" {
		t.Fatal("expected user_id claim")
	}
}

func TestSignIn_InvalidPassword(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", nil)

	_, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("wrong"),
	)
	if !errors.Is(err, authorization.ErrInvalidCredentials) {
		t.Fatalf("want ErrInvalidCredentials, got %v", err)
	}
}

func TestSignIn_UnknownEmail(t *testing.T) {
	auth, _ := newAuth(t)

	_, err := auth.SignIn(
		auth.WithEmail("ghost@example.com"),
		auth.WithPassword("anything"),
	)
	if !errors.Is(err, authorization.ErrUserNotFound) {
		t.Fatalf("want ErrUserNotFound, got %v", err)
	}
}

// --- Refresh-token middleware --------------------------------------------

func TestHandleRefreshToken_HappyPath(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", []string{"user:rw"})

	res, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}

	app := fiber.New()
	app.Use(auth.HandleRefreshToken)
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{"ok": true})
	})

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("cft", "yes")
	req.Header.Set("Authorization", "Bearer "+res.Tokens.RefreshToken)

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("want 200, got %d: %s", resp.StatusCode, body)
	}
	body, _ := io.ReadAll(resp.Body)
	// Backend returns the new access token as a JSON-encoded string.
	if !strings.Contains(string(body), ".") {
		t.Fatalf("expected JWT, got %s", body)
	}
}

func TestHandleRefreshToken_InvalidToken(t *testing.T) {
	auth, _ := newAuth(t)

	app := fiber.New()
	app.Use(auth.HandleRefreshToken)
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("cft", "yes")
	req.Header.Set("Authorization", "Bearer not-a-jwt")

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
	body, _ := io.ReadAll(resp.Body)
	if !bytes.Contains(body, []byte(authorization.TOKEN_INVALID)) {
		t.Fatalf("want body to contain %q, got %s", authorization.TOKEN_INVALID, body)
	}
}

func TestHandleRefreshToken_RevokedSession(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", nil)

	res, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}

	// Hard-delete the session row to simulate a revoked session.
	if err := db.Unscoped().
		Where("id = ?", res.SessionID).
		Delete(&models.Session{}).Error; err != nil {
		t.Fatalf("delete session: %v", err)
	}

	app := fiber.New()
	app.Use(auth.HandleRefreshToken)
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("cft", "yes")
	req.Header.Set("Authorization", "Bearer "+res.Tokens.RefreshToken)

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
	body, _ := io.ReadAll(resp.Body)
	if !bytes.Contains(body, []byte(authorization.UNAUTHORIZED)) {
		t.Fatalf("want body to contain %q, got %s", authorization.UNAUTHORIZED, body)
	}
}

// --- API authorization middleware ----------------------------------------

func TestUseAPIAuthorization_MissingToken(t *testing.T) {
	auth, _ := newAuth(t)

	app := fiber.New()
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/me", nil)

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}

	body, _ := io.ReadAll(resp.Body)
	// The Fiber JWT middleware uses 400 for "missing" tokens. What we
	// guarantee is that the body carries a structured `code` so the
	// frontend never has to fall back to status-code-only heuristics.
	if !bytes.Contains(body, []byte(authorization.AUTH_REQUIRED)) {
		t.Fatalf("want body to contain %q, got status=%d body=%s",
			authorization.AUTH_REQUIRED, resp.StatusCode, body)
	}
}

func TestUseAPIAuthorization_InvalidToken(t *testing.T) {
	auth, _ := newAuth(t)

	app := fiber.New()
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer this-is-not-a-jwt")

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
	body, _ := io.ReadAll(resp.Body)
	if !bytes.Contains(body, []byte(authorization.TOKEN_INVALID)) {
		t.Fatalf("want body to contain %q, got %s", authorization.TOKEN_INVALID, body)
	}
}

func TestUseAPIAuthorization_ExpiredToken(t *testing.T) {
	auth, db := newAuth(t)
	user := seedUser(t, auth, db, "alice@example.com", "hunter2!", []string{"user:rw"})

	// Hand-roll an already-expired access token. The package's
	// duration parser doesn't support negative values, so we sign the
	// JWT directly with a past `exp` claim to simulate the
	// "token expired while in flight" scenario that triggered the
	// original sign-out bug on the frontend.
	pastExp := time.Now().Add(-1 * time.Minute)
	pastIat := time.Now().Add(-2 * time.Minute)
	expiredClaims := &utils.Claims{
		UserID:  user.ID,
		Content: json.RawMessage(`{}`),
		Roles:   user.Roles,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(pastExp),
			IssuedAt:  jwt.NewNumericDate(pastIat),
		},
	}
	expiredToken, err := jwt.NewWithClaims(jwt.SigningMethodHS256, expiredClaims).
		SignedString([]byte("test-secret-do-not-use-in-prod"))
	if err != nil {
		t.Fatalf("sign expired token: %v", err)
	}

	app := fiber.New()
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer "+expiredToken)

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401, got %d", resp.StatusCode)
	}
	body, _ := io.ReadAll(resp.Body)
	// This is the regression test for the original bug: an expired
	// access token MUST come back with code TOKEN_EXPIRED so the
	// frontend can refresh-and-retry instead of signing the user out.
	if !bytes.Contains(body, []byte(authorization.TOKEN_EXPIRED)) {
		t.Fatalf("want body to contain %q, got %s", authorization.TOKEN_EXPIRED, body)
	}
}

func TestUseAPIAuthorization_ValidToken(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", []string{"user:rw"})

	res, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}

	app := fiber.New()
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("Authorization", "Bearer "+res.Tokens.AccessToken)

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		t.Fatalf("want 200, got %d: %s", resp.StatusCode, body)
	}
}

func TestUseAPIAuthorization_RolesGate(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", []string{"user:rw"})

	res, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}

	app := fiber.New()
	app.Use(auth.UseAPIAuthorization(auth.WithRoles([]string{"admin:rw"})))
	app.Get("/admin", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/admin", nil)
	req.Header.Set("Authorization", "Bearer "+res.Tokens.AccessToken)

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusForbidden {
		t.Fatalf("want 403, got %d", resp.StatusCode)
	}
	body, _ := io.ReadAll(resp.Body)
	if !bytes.Contains(body, []byte(authorization.INSUFFICIENT_PERMISSIONS)) {
		t.Fatalf("want body to contain %q, got %s", authorization.INSUFFICIENT_PERMISSIONS, body)
	}
}

// --- WEB authorization middleware ----------------------------------------

func TestUseWEBAuthorization_NoCookieRedirect(t *testing.T) {
	auth, _ := newAuth(t)

	app := fiber.New()
	app.Use(auth.UseWEBAuthorization())
	app.Get("/dashboard", func(c fiber.Ctx) error { return c.SendString("ok") })

	req := httptest.NewRequest(http.MethodGet, "/dashboard", nil)
	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusTemporaryRedirect {
		t.Fatalf("want 307, got %d", resp.StatusCode)
	}
	if loc := resp.Header.Get("Location"); !strings.Contains(loc, "/sign-in") {
		t.Fatalf("expected sign-in redirect, got %q", loc)
	}
}

func TestUseWEBAuthorization_HappyPath(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", nil)

	res, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}

	app := fiber.New()
	app.Use(auth.UseWEBAuthorization())
	app.Get("/dashboard", func(c fiber.Ctx) error { return c.SendString("ok") })

	req := httptest.NewRequest(http.MethodGet, "/dashboard", nil)
	req.AddCookie(&http.Cookie{Name: auth.CookieSessionName(), Value: res.SessionID})

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusOK {
		t.Fatalf("want 200, got %d", resp.StatusCode)
	}
}

// --- Sign-out -------------------------------------------------------------

func TestSignOut_Idempotent(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", nil)

	res, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}
	ctx := context.Background()
	if err := auth.SignOut(ctx, res.SessionID); err != nil {
		t.Fatalf("first sign-out: %v", err)
	}
	// A second sign-out for the same session must succeed too: it's
	// the path the response interceptor takes when it discovers a
	// session has already been invalidated server-side.
	if err := auth.SignOut(ctx, res.SessionID); err != nil {
		t.Fatalf("second sign-out: %v", err)
	}

	// Subsequent refresh attempts must fail cleanly (no panic, no
	// 500), so the frontend retry flow can detect and surface the
	// terminal state.
	app := fiber.New()
	app.Use(auth.HandleRefreshToken)
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	req := httptest.NewRequest(http.MethodGet, "/me", nil)
	req.Header.Set("cft", "yes")
	req.Header.Set("Authorization", "Bearer "+res.Tokens.RefreshToken)

	resp, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
	if err != nil {
		t.Fatalf("Test: %v", err)
	}
	if resp.StatusCode != http.StatusUnauthorized {
		t.Fatalf("want 401 after sign-out, got %d", resp.StatusCode)
	}
}

// --- Concurrency ----------------------------------------------------------

func TestRefresh_ConcurrentRequestsShareToken(t *testing.T) {
	auth, db := newAuth(t)
	seedUser(t, auth, db, "alice@example.com", "hunter2!", nil)

	res, err := auth.SignIn(
		auth.WithEmail("alice@example.com"),
		auth.WithPassword("hunter2!"),
	)
	if err != nil {
		t.Fatalf("sign-in: %v", err)
	}

	app := fiber.New()
	app.Use(auth.HandleRefreshToken)
	app.Use(auth.UseAPIAuthorization())
	app.Get("/me", func(c fiber.Ctx) error { return c.JSON(fiber.Map{"ok": true}) })

	// 16 concurrent refresh requests must each get a valid access
	// token and a 200 response. This is the server-side counterpart to
	// the frontend single-flight refresh: the backend must not start
	// rejecting tokens just because they're issued in close
	// succession.
	const concurrency = 16
	type result struct {
		status int
		body   string
	}
	results := make(chan result, concurrency)
	for i := 0; i < concurrency; i++ {
		go func() {
			req := httptest.NewRequest(http.MethodGet, "/me", nil)
			req.Header.Set("cft", "yes")
			req.Header.Set("Authorization", "Bearer "+res.Tokens.RefreshToken)
			r, err := app.Test(req, fiber.TestConfig{Timeout: 5 * time.Second})
			if err != nil {
				results <- result{status: -1, body: err.Error()}
				return
			}
			body, _ := io.ReadAll(r.Body)
			results <- result{status: r.StatusCode, body: string(body)}
		}()
	}
	deadline := time.After(15 * time.Second)
	for i := 0; i < concurrency; i++ {
		select {
		case r := <-results:
			if r.status != http.StatusOK {
				t.Fatalf("concurrent refresh #%d: want 200, got %d (%s)", i, r.status, r.body)
			}
		case <-deadline:
			t.Fatalf("timed out waiting for concurrent refresh #%d", i)
		}
	}
}
