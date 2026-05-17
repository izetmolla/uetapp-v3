# Authorization Package

Go module: `github.com/flowtrove/packages/authorization`

A Fiber + GORM + JWT authorization layer for **API** (Bearer tokens) and **WEB** (HTTP-only session cookies) applications. It handles sign-in, sign-out, session storage, role checks, and refresh-token flows behind a single `*Authorization` facade.

---

## Table of contents

1. [Architecture](#architecture)
2. [Requirements](#requirements)
3. [Quick start](#quick-start)
4. [Configuration](#configuration)
5. [Authentication modes](#authentication-modes)
6. [Package API reference](#package-api-reference)
7. [Functional options](#functional-options)
8. [Middleware](#middleware)
9. [JWT & tokens](#jwt--tokens)
10. [Utils subpackage](#utils-subpackage)
11. [Errors & API codes](#errors--api-codes)
12. [Defaults & constants](#defaults--constants)
13. [Duration format](#duration-format)
14. [End-to-end examples](#end-to-end-examples)

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     *authorization.Authorization                 │
├──────────────┬────────────────────┬─────────────────────────────┤
│  SignIn      │  Middlewares       │  User / session lookup      │
│  CheckEmail  │  UseAPIAuthorization│  GetSession                 │
│  SignOut     │  UseWEBAuthorization│  User / GetAuthDataAPI|WEB  │
│  SetCookie   │  HandleRefreshToken │  GetClaims / GetRoles       │
└──────┬───────┴─────────┬──────────┴──────────────┬──────────────┘
       │                 │                         │
       ▼                 ▼                         ▼
┌──────────────┐  ┌──────────────┐         ┌──────────────┐
│ utils.       │  │ utils.       │         │ models.      │
│ PasswordMgr  │  │ TokenManager │         │ DBManager    │
└──────────────┘  └──────────────┘         └──────┬───────┘
                                                  │
                                    ┌─────────────┴─────────────┐
                                    ▼                           ▼
                              PostgreSQL / GORM            Redis (optional)
```

| Layer | Responsibility |
|-------|----------------|
| **`authorization`** | Public API: sign-in/out, cookies, Fiber middlewares, principal extraction |
| **`utils`** | JWT signing/parsing, bcrypt passwords, small helpers |
| **`models`** | GORM session/user persistence, optional Redis session cache |

---

## Requirements

- Go 1.26+
- [Fiber v3](https://github.com/gofiber/fiber)
- [GORM](https://gorm.io) with a configured `*gorm.DB`
- [golang-jwt/jwt/v5](https://github.com/golang-jwt/jwt)
- Optional: [go-redis](https://github.com/go-redis/redis) for session caching

---

## Quick start

### 1. Bootstrap at application startup

```go
import (
    "github.com/flowtrove/packages/authorization"
    "github.com/flowtrove/packages/models"
)

auth, err := authorization.NewAuthorization(&authorization.AuthorizationOptions{
    DB:                   db,
    Redis:                redisClient, // optional
    JWTSecret:            os.Getenv("JWT_SECRET"),
    AccessTokenDuration:  "60s",
    RefreshTokenDuration: "4w",
    AuthURL:              "https://auth.example.com",
    UserModel:            &models.User{},
    UserTableName:        "users",
    SessionModel:         &models.Session{},
    SessionTableName:     "sessions",
    AutoMigration:        false,
})
if err != nil {
    log.Fatal(err)
}
```

### 2. Mount middlewares

```go
app := fiber.New()

// WEB: cookie session, redirect to sign-in when missing
app.Use(auth.UseWEBAuthorization(
    auth.WithExcludedPaths([]string{"/sign-in", "/public"}),
))

// API group: Bearer JWT
api := app.Group("/api")
api.Use(auth.UseAPIAuthorization(
    auth.WithExcludedPaths([]string{"/api/authorization"}),
))

// Optional: refresh-token endpoint (opt-in via header)
api.Use(auth.HandleRefreshToken)
```

### 3. Sign-in handler

```go
func signIn(c fiber.Ctx) error {
    var req struct {
        Email    string `json:"email"`
        Password string `json:"password"`
    }
    if err := c.Bind().JSON(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
    }

    res, err := auth.SignIn(
        auth.WithContext(c.Context()),
        auth.WithCredentials(req.Email, req.Password),
        auth.WithIPAddress(c.IP()),
        auth.WithUserAgent(c.Get("User-Agent")),
    )
    if err != nil {
        if errors.Is(err, authorization.ErrInvalidCredentials) {
            return c.Status(401).JSON(fiber.Map{"code": authorization.INVALID_CREDENTIALS})
        }
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    auth.SetCookie(c, res.SessionID) // WEB clients
    return c.JSON(fiber.Map{
        "user":       res.User,
        "tokens":     res.Tokens,
        "session_id": res.SessionID,
    })
}
```

### 4. Read the current user in a handler

```go
// WEB (cookie session)
data, err := auth.User(c, c.Context())

// API (JWT from UseAPIAuthorization)
data, err := auth.User(c, c.Context(), true)
if err != nil {
    return c.Status(401).JSON(fiber.Map{"code": authorization.UNAUTHORIZED})
}
// data.UserID, data.SessionID, data.Roles
```

---

## Configuration

### `AuthorizationOptions`

| Field | Required | Default | Description |
|-------|----------|---------|-------------|
| `DB` | **yes** | — | GORM database handle |
| `JWTSecret` | **yes** | — | HMAC secret for signing JWTs |
| `AuthURL` | **yes** | — | Base URL of the auth service (used for cookie domain) |
| `Redis` | no | `nil` | Redis client for session cache |
| `SigningMethodHMAC` | no | `"HS256"` | `HS256`, `HS384`, or `HS512` |
| `AccessTokenDuration` | no | `"30s"` | Access token lifetime (see [duration format](#duration-format)) |
| `RefreshTokenDuration` | no | `"1h"` | Refresh token lifetime |
| `UserModel` | no | package default | Custom GORM user struct pointer |
| `UserTableName` | no | `"users"` | Users table name |
| `SessionModel` | no | package default | Custom GORM session struct pointer |
| `SessionTableName` | no | `"sessions"` | Sessions table name |
| `AutoMigration` | no | `false` | Run GORM `AutoMigrate` on user/session models at boot |
| `CookieSessionName` | no | `"cnf.id"` | HTTP cookie name for session id |
| `SignInRedirectURL` | no | `{AuthURL}/sign-in` | Redirect target for unauthenticated WEB requests |
| `PasswordCost` | no | `12` | Bcrypt cost factor |

---

## Authentication modes

| Mode | Transport | Middleware | Principal source |
|------|-----------|------------|------------------|
| **WEB** | HTTP-only cookie (`CookieSessionName`) | `UseWEBAuthorization` | Session row in DB / Redis |
| **API** | `Authorization: Bearer <access_token>` | `UseAPIAuthorization` | JWT claims in Fiber context |

Both modes share the same session row created at sign-in. The access token embeds `user_id` and `roles`; the refresh token embeds `session_id` for renewal.

---

## Package API reference

All methods below are on `*Authorization` unless noted.

### Constructor

#### `NewAuthorization(cfg *AuthorizationOptions) (*Authorization, error)`

Validates configuration, wires DB/token/password managers, optionally migrates schema.

```go
auth, err := authorization.NewAuthorization(&authorization.AuthorizationOptions{
    DB:        db,
    JWTSecret: "super-secret",
    AuthURL:   "https://app.example.com",
})
if errors.Is(err, authorization.ErrMissingJWTSecret) {
    // handle misconfiguration
}
```

**Returns errors:** `ErrNilConfig`, `ErrMissingDB`, `ErrMissingJWTSecret`, `ErrMissingAuthURL`, `ErrAutoMigration` (wrapped).

---

### Accessors

| Method | Returns | Description |
|--------|---------|-------------|
| `DBManager()` | `*models.DBManager` | Low-level DB/Redis access |
| `PasswordManager()` | `*utils.PasswordManager` | Hash / verify passwords |
| `TokenManager()` | `*utils.TokenManager` | Issue / parse JWTs directly |
| `AuthURL()` | `string` | Configured auth base URL |
| `CookieSessionName()` | `string` | Session cookie name |

```go
hash, err := auth.PasswordManager().HashPassword("plain-text")
ok := auth.PasswordManager().IsValidPassword(storedHash, "plain-text")

tm := auth.TokenManager()
secret := tm.GetJWTSecret() // for custom jwtware setup
```

---

### Sign-in & user lookup

#### `SignIn(opts ...SignInOptionsFunc) (SignInResponse, error)`

Authenticates by email/username + password, creates a session, returns tokens and user (password stripped).

```go
res, err := auth.SignIn(
    auth.WithContext(ctx),
    auth.WithEmail("user@example.com"),
    auth.WithPassword("secret"),
    auth.WithIPAddress("203.0.113.1"),
    auth.WithUserAgent("Mozilla/5.0"),
    auth.WithContent(json.RawMessage(`{"tenant":"acme"}`)),
)

if errors.Is(err, authorization.ErrUserNotFound) {
    // res.Error.Field == "email"
}
if errors.Is(err, authorization.ErrInvalidCredentials) {
    // res.Error.Field == "password"
}

// Success
fmt.Println(res.SessionID)
fmt.Println(res.Tokens.AccessToken)
fmt.Println(res.Tokens.RefreshToken)
```

**`SignInResponse` fields:**

| Field | Type | Description |
|-------|------|-------------|
| `User` | `any` | User model (password cleared) |
| `SessionID` | `string` | New session UUID |
| `Tokens` | `utils.Tokens` | Access + refresh JWT pair |
| `Error` | `AuthorizationError` | Populated on validation failures |

---

#### `CheckEmail(opts ...SignInOptionsFunc) (SignInResponse, error)`

Looks up a user by email/username **without** checking the password. Useful for multi-step sign-in UIs.

```go
res, err := auth.CheckEmail(
    auth.WithContext(c.Context()),
    auth.WithEmail("user@example.com"),
)
if errors.Is(err, authorization.ErrUserNotFound) {
    return c.Status(404).JSON(fiber.Map{"exists": false})
}
return c.JSON(fiber.Map{"user": res.User})
```

---

#### `SetCookie(c fiber.Ctx, sessionID string)`

Sets the session cookie for WEB clients. Domain is derived from `AuthURL` (dot-prefixed, e.g. `.example.com`). Cookie is `HttpOnly`, `Secure`, `SameSite=Lax`, 365-day expiry.

```go
res, _ := auth.SignIn(auth.WithCredentials(email, password))
auth.SetCookie(c, res.SessionID)
```

---

### Sign-out

#### `SignOut(ctx context.Context, sessionID string) error`

Soft-deletes the session (`is_deleted = true`) and evicts Redis cache when configured. A missing session is **not** an error (idempotent sign-out).

```go
sessionID := auth.GetSessionID(c)
if err := auth.SignOut(c.Context(), sessionID); err != nil {
    return err
}
auth.RemoveCookie(c, sessionID)
```

---

#### `RemoveCookie(c fiber.Ctx, _ string)`

Expires the session cookie on the client. The second parameter is ignored (kept for API compatibility).

```go
auth.RemoveCookie(c, "")
```

---

### Session & principal

#### `GetSession(ctx context.Context, sessionID string) (*models.Session, error)`

Loads session + user roles. Uses Redis when available, falls back to PostgreSQL.

```go
session, err := auth.GetSession(c.Context(), sessionID)
if errors.Is(err, gorm.ErrRecordNotFound) {
    // invalid / expired session
}
```

---

#### `GetSessionID(c fiber.Ctx) string`

Reads the session id from the request cookie.

```go
id := auth.GetSessionID(c) // "" if not signed in
```

---

#### `GetAuthDataAPI(c fiber.Ctx) (AuthData, error)`

Extracts `user_id`, `session_id`, and `roles` from JWT claims (requires `UseAPIAuthorization` on the route).

```go
data, err := auth.GetAuthDataAPI(c)
// data.UserID, data.SessionID, data.Roles
```

---

#### `GetAuthDataWEB(c fiber.Ctx, reqCtx context.Context) (AuthData, error)`

Loads session from cookie + DB/Redis.

```go
data, err := auth.GetAuthDataWEB(c, c.Context())
```

---

#### `User(c fiber.Ctx, reqCtx context.Context, fromAPI ...bool) (*AuthData, error)`

Unified entry point. Pass `fromAPI: true` for JWT; omit or `false` for cookie session.

```go
// WEB handler
principal, err := auth.User(c, c.Context())

// API handler (after UseAPIAuthorization)
principal, err := auth.User(c, c.Context(), true)

if principal != nil {
    log.Println(principal.UserID, principal.Roles)
}
```

**`AuthData`:**

```go
type AuthData struct {
    SessionID string
    UserID    string
    Roles     []string
}
```

---

### JWT claims helpers

#### `GetClaims(c fiber.Ctx) (jwt.MapClaims, error)`

Returns raw JWT map claims from Fiber JWT middleware context.

```go
claims, err := auth.GetClaims(c)
userID := claims["user_id"].(string)
```

---

#### `GetRoles(c fiber.Ctx) ([]string, error)`

Parses the `roles` claim from JWT. Accepts `[]string`, `[]any`, `json.RawMessage`, or JSON string.

```go
roles, err := auth.GetRoles(c)
if slices.Contains(roles, "admin:rw") {
    // allowed
}
```

---

### Middleware

#### `UseAPIAuthorization(opts ...AuthConfigOptions) fiber.Handler`

Protects routes with `Authorization: Bearer <token>`. Optional role gate and path exclusions.

```go
api := app.Group("/api/v1")

api.Use(auth.UseAPIAuthorization(
    auth.WithExcludedPaths([]string{
        "/api/v1/health",
        "/api/v1/authorization/sign-in",
    }),
    auth.WithRoles([]string{"user:rw", "admin:rw"}),
))

api.Get("/profile", func(c fiber.Ctx) error {
    data, _ := auth.GetAuthDataAPI(c)
    return c.JSON(data)
})
```

**Unauthorized / forbidden responses:**

All authentication failures from `UseAPIAuthorization` come back as a stable JSON envelope so frontend interceptors can branch on the `code` rather than guessing from the status line:

```json
{ "error": "access token expired", "message": "access token expired", "code": "TOKEN_EXPIRED" }
```

| Status | Code                      | Meaning |
|--------|---------------------------|---------|
| 401    | `AUTH_REQUIRED`           | No `Authorization` header on a protected route |
| 401    | `TOKEN_EXPIRED`           | Access token's `exp` is in the past — refresh and retry |
| 401    | `TOKEN_INVALID`           | Bad signature, unparseable header, or otherwise unusable token |
| 403    | `INSUFFICIENT_PERMISSIONS`| Authenticated but missing the required role |

---

#### `UseWEBAuthorization(opts ...AuthConfigOptions) fiber.Handler`

Protects HTML/SSR routes via session cookie. Missing session → redirect to sign-in with `?redirectUrl=...`.

```go
app.Use(auth.UseWEBAuthorization(
    auth.WithExcludedPaths([]string{"/sign-in", "/assets"}),
    auth.WithRoles([]string{"user:rw"}),
))
```

---

#### `HandleRefreshToken(c fiber.Ctx) error`

Middleware that **only** runs when the client sends header `cft: yes` (see `RefreshTokenHandlerIdentifier`). Issues a new access token from a refresh token.

```go
app.Use(auth.HandleRefreshToken)
```

**Client request:**

```http
POST /api/refresh
cft: yes
Authorization: Bearer <refresh_token>
```

Or JSON body:

```json
{ "refresh_token": "<refresh_token>" }
```

**Success response:** raw access token string (JSON-encoded).

---

### Auth middleware options

Options are methods on `*Authorization` and passed to `UseAPIAuthorization` / `UseWEBAuthorization`:

| Option | Type | Effect |
|--------|------|--------|
| `WithExcludedPaths(paths []string)` | prefix match | Skip auth for matching paths |
| `WithRoles(roles []string)` | any-of | Require at least one role |
| `WithReauthorize(bool)` | flag | Reserved for future re-auth flows |
| `WithRedirectToSignIn(bool)` | flag | Reserved / WEB redirect tuning |
| `WithDebug(bool)` | flag | Reserved for verbose logging |

```go
auth.UseWEBAuthorization(
    auth.WithExcludedPaths([]string{"/public", "/sign-in"}),
    auth.WithRoles([]string{"admin:rw"}),
)
```

#### `NewAuthConfig(opts ...AuthConfigOptions) *AuthConfig`

Builds a config struct without attaching middleware (advanced/testing).

```go
cfg := authorization.NewAuthConfig(
    auth.WithRoles([]string{"admin:rw"}),
)
```

---

### Sign-in functional options

Used with `SignIn` and `CheckEmail`:

| Option | Sets |
|--------|------|
| `WithContext(ctx context.Context)` | Request context (use `c.Context()` in Fiber) |
| `WithEmail(email string)` | Email or username for lookup |
| `WithPassword(password string)` | Cleartext password |
| `WithCredentials(email, password string)` | Both email and password |
| `WithContent(content json.RawMessage)` | Custom JSON embedded in JWT `content` claim |
| `WithIPAddress(ip string)` | Stored on session row |
| `WithUserAgent(ua string)` | Stored on session row |

#### `NewSignInOptions(opts ...SignInOptionsFunc) *SignInOptions`

Builds options without calling `SignIn` (testing / custom pipelines).

```go
opts := authorization.NewSignInOptions(
    auth.WithEmail("a@b.com"),
    auth.WithPassword("pass"),
)
```

---

## JWT & tokens

### Access token claims (`utils.Claims`)

| Claim | Type | Description |
|-------|------|-------------|
| `user_id` | string | Authenticated user UUID |
| `content` | JSON object | Application-specific payload from `WithContent` |
| `roles` | JSON array | User roles from DB |
| `exp` | number | Expiry (from `AccessTokenDuration`) |
| `iat` | number | Issued at |

### Refresh token claims (`utils.RefreshTokenClaims`)

| Claim | Type | Description |
|-------|------|-------------|
| `session_id` | string | Session UUID for DB lookup |
| `user_id` | string | User UUID |
| `content` | JSON | Copied from sign-in |
| `roles` | JSON | Copied from sign-in |
| `tokenlife` | string | Refresh duration string |
| `signing_method` | string | e.g. `HS256` |
| `exp` / `iat` | number | Standard JWT timestamps |

### Issuing tokens manually

Use `TokenManager` when you need tokens outside `SignIn` (e.g. service accounts, impersonation):

```go
tm := auth.TokenManager()

tokens, sessionID, err := tm.Authorize(
    tm.WithContext(ctx),
    tm.WithUserID(userID),
    tm.WithRoles(json.RawMessage(`["admin:rw"]`)),
    tm.WithIPAddress("127.0.0.1"),
    tm.WithUserAgent("internal-job"),
    tm.WithContent(json.RawMessage(`{}`)),
)
```

### Refreshing an access token manually

```go
refreshToken := "..." // from client
claims, err := tm.ExtractToken(refreshToken)
session, err := auth.GetSession(ctx, claims.SessionID)
newAccess, err := tm.RefreshAccessToken(claims, session)
```

### Parsing tokens

```go
// Refresh token
refreshClaims, err := tm.ExtractToken(tokenString)

// Access token
accessClaims, err := tm.ExtractAccessClaims(tokenString)
```

### Authorization header parsing

```go
token, err := tm.GetTokenFromHeader(c.Get("Authorization"))
// Accepts: "Bearer <token>", "Token <token>", or raw token
```

---

## Utils subpackage

Import: `github.com/flowtrove/packages/authorization/utils`

### `TokenManager`

| Method | Description |
|--------|-------------|
| `NewTokenManager(db, accessDur, refreshDur, secret, hmac)` | Constructor; pre-parses durations |
| `Authorize(opts...)` | Create session + sign token pair |
| `RefreshAccessToken(claims, session, opts...)` | New access token |
| `ExtractToken(string)` | Parse refresh JWT |
| `ExtractAccessClaims(string)` | Parse access JWT |
| `GetTokenFromHeader(string)` | Strip Bearer/Token prefix |
| `GetJWTSecret()` | Secret string for jwtware |
| `SigningMethod()` | Resolved `*jwt.SigningMethodHMAC` |
| `AccessTokenDuration()` / `RefreshTokenDuration()` | Parsed `time.Duration` |
| `WithUserID`, `WithRoles`, `WithContent`, `WithContext`, `WithSessionID`, `WithIPAddress`, `WithUserAgent` | Functional options for `Authorize` |

### `PasswordManager`

| Method | Description |
|--------|-------------|
| `NewPasswordManager(cost int)` | Bcrypt manager (cost 4–31) |
| `HashPassword(password string)` | Returns bcrypt hash |
| `IsValidPassword(hash, password string)` | Constant-time compare |
| `Cost()` | Current bcrypt cost |

```go
pm := utils.NewPasswordManager(12)
hash, err := pm.HashPassword("my-password")
if pm.IsValidPassword(hash, "my-password") {
    // ok
}
```

### Package-level helpers

| Function | Description |
|----------|-------------|
| `ParseCustomDuration(input, defaultInput string)` | Parse `"30s"`, `"4w"`, `"1mo"`, etc. |
| `FormatRoles(json.RawMessage)` | `[]string` from JSON roles column |
| `StripPasswordFromUserModel(any)` | Clears `Password` field via reflection |
| `IsExcludedPath(excluded []string, path string)` | Prefix-based path whitelist |
| `GetDomainWithoutWWW(url string)` | Hostname for cookie domain |

---

## Errors & API codes

### Sentinel errors (`errors.Is`)

| Variable | When |
|----------|------|
| `ErrNilConfig` | `NewAuthorization(nil)` |
| `ErrMissingDB` | No database |
| `ErrMissingJWTSecret` | Empty secret |
| `ErrMissingAuthURL` | Empty auth URL |
| `ErrAutoMigration` | Migration failed |
| `ErrUserNotFound` | Unknown email/username |
| `ErrInvalidCredentials` | Wrong password |
| `ErrInvalidContent` | Invalid `WithContent` JSON |
| `ErrMissingJWTContext` | No JWT in Fiber context |
| `ErrInvalidClaims` | Claims type mismatch |
| `ErrInvalidRoles` | Malformed roles claim |
| `ErrMissingRefreshToken` | Refresh middleware: no token |
| `ErrSessionNotFound` | Session missing on refresh |

```go
res, err := auth.SignIn(auth.WithCredentials(email, pass))
switch {
case errors.Is(err, authorization.ErrUserNotFound):
    return c.Status(404).JSON(...)
case errors.Is(err, authorization.ErrInvalidCredentials):
    return c.Status(401).JSON(fiber.Map{"code": authorization.INVALID_CREDENTIALS})
}
```

### JSON error codes (middleware / refresh)

| Variable | Typical HTTP status |
|----------|---------------------|
| `INVALID_CREDENTIALS` | 401 |
| `TOKEN_EXPIRED` | 401 |
| `TOKEN_INVALID` | 401 |
| `AUTH_REQUIRED` | 401 |
| `INSUFFICIENT_PERMISSIONS` | 403 |
| `ROLE_NOT_ALLOWED` | 403 |
| `API_KEY_FORBIDDEN` | 403 |
| `UNAUTHORIZED` | 401 |
| `SERVER_ERROR` | 500 |

---

## Defaults & constants

### Headers

| Constant | Value | Purpose |
|----------|-------|---------|
| `RefreshTokenHandlerIdentifier` | `"cft"` | Client sets `cft: yes` to trigger refresh middleware |
| `ReauthorizeHandlerIdentifier` | `"cra"` | Reserved for re-authorization flows |

### Token / session defaults

| Variable | Default |
|----------|---------|
| `DefaultAccessTokenLifetime` | `"30s"` |
| `DefaultRefreshTokenLifetime` | `"1h"` |
| `DefaultSigningMethodHMAC` | `"HS256"` |
| `DefaultCookieSessionName` | `"cnf.id"` |
| `DefaultPasswordCost` | `12` |
| `DefaultRedisTTL` | `30m` |
| `DefaultRedisPrefix` | `"AUTHSESSIONS"` |

---

## Duration format

`AccessTokenDuration` and `RefreshTokenDuration` use a compact syntax:

| Unit | Meaning | Example |
|------|---------|---------|
| `s` | seconds | `30s` |
| `m` | minutes | `15m` |
| `h` | hours | `2h` |
| `d` | days | `7d` |
| `w` | weeks | `4w` |
| `mo` | months (~30d) | `1mo` |
| `y` | years (~365d) | `1y` |

```go
d, err := utils.ParseCustomDuration("4w", "30s")
```

---

## End-to-end examples

### Complete Fiber app wiring

```go
func main() {
    db := openDB()
    auth, err := authorization.NewAuthorization(&authorization.AuthorizationOptions{
        DB:                   db,
        JWTSecret:            os.Getenv("JWT_SECRET"),
        AccessTokenDuration:  "10s",
        RefreshTokenDuration: "4w",
        AuthURL:              os.Getenv("AUTH_URL"),
        UserModel:            &models.User{},
        SessionModel:         &models.Session{},
    })
    if err != nil {
        log.Fatal(err)
    }

    app := fiber.New()

    // Public
    app.Get("/sign-in", signInPage)
    app.Post("/api/authorization/sign-in", signInHandler(auth))

    // Protected WEB
    app.Use(auth.UseWEBAuthorization(
        auth.WithExcludedPaths([]string{"/sign-in", "/api"}),
    ))

    // Protected API
    api := app.Group("/api")
    api.Use(auth.HandleRefreshToken)
    api.Use(auth.UseAPIAuthorization())

    api.Get("/me", func(c fiber.Ctx) error {
        u, err := auth.User(c, c.Context(), true)
        if err != nil {
            return c.Status(401).JSON(fiber.Map{"code": authorization.UNAUTHORIZED})
        }
        return c.JSON(u)
    })

    log.Fatal(app.Listen(":3000"))
}
```

### Two-step sign-in (check email, then password)

```go
// Step 1: does this email exist?
res, err := auth.CheckEmail(
    auth.WithContext(c.Context()),
    auth.WithEmail(email),
)
if errors.Is(err, authorization.ErrUserNotFound) {
    return c.JSON(fiber.Map{"step": 1, "exists": false})
}
return c.JSON(fiber.Map{"step": 1, "exists": true, "user": res.User})

// Step 2: full sign-in
res, err = auth.SignIn(
    auth.WithContext(c.Context()),
    auth.WithCredentials(email, password),
)
```

### Role-gated admin API

```go
admin := api.Group("/admin")
admin.Use(auth.UseAPIAuthorization(
    auth.WithRoles([]string{"admin:rw"}),
))
admin.Get("/users", listUsers)
```

### Custom JWT content for multi-tenant apps

```go
content, _ := json.Marshal(map[string]string{
    "tenant_id": tenantID,
    "locale":    "en",
})

res, err := auth.SignIn(
    auth.WithCredentials(email, password),
    auth.WithContent(content),
)
// content is available in access token claims and can be read via GetClaims
```

### Sign-out flow

```go
func signOut(c fiber.Ctx) error {
    sid := auth.GetSessionID(c)
    if err := auth.SignOut(c.Context(), sid); err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }
    auth.RemoveCookie(c, "")
    return c.JSON(fiber.Map{"message": "signed out"})
}
```

### Refresh token from SPA / mobile

```http
POST /api/some-protected-route
cft: yes
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
Content-Type: application/json

{}
```

Response: new access token (string).

---

## Types reference

### `SignInRequest` / `RegisterRequest`

```go
type SignInRequest struct {
    Email    string `json:"email"`
    Password string `json:"password"`
}

type RegisterRequest struct { // placeholder for future register flow
    Email    string `json:"email"`
    Password string `json:"password"`
}
```

`RegisterResponse` currently only exposes a `Token` field and is not wired to handlers in this package.

### `AuthorizationError`

```go
type AuthorizationError struct {
    Error error  `json:"error"`
    Field string `json:"field"` // e.g. "email", "password"
}
```

---

## Models package (internal)

The `models` subpackage provides `DBManager`, `User`, and `Session` GORM types. You typically customize them via `AuthorizationOptions.UserModel` / `SessionModel` without importing `models` in application handlers.

| `DBManager` method | Description |
|--------------------|-------------|
| `FindUser(ctx, emailOrUsername)` | Load user by email **or** username |
| `GetSessionFromDB(ctx, sessionID)` | Session + user roles (Redis → DB) |
| `DeleteSessionFromRedis(ctx, sessionID)` | Cache eviction |

---

## Project integration (uetapp-v3)

This repo wires the package in `backends/app/config/config.go`:

```go
app.auth, err = authorization.NewAuthorization(&authorization.AuthorizationOptions{
    DB:                   app.postgres,
    JWTSecret:            cfg.JWTSecret,
    // 15m gives enough headroom for clock skew, slow networks and
    // concurrent tabs. The frontend refreshes proactively a minute
    // before this expires.
    AccessTokenDuration:  "15m",
    RefreshTokenDuration: "4w",
    UserModel:            &models.User{},
    SessionModel:         &models.Session{},
    AuthURL:              cfg.AuthURL,
})
```

> **Note** – do not set `AccessTokenDuration` to a value below ~30s in production.
> A short TTL means the frontend has to refresh on almost every request, which
> magnifies the impact of any transient network or DB hiccup and can manifest
> as random sign-outs.

Handlers live under `backends/app/internal/authorization/`. Application code reads the principal via `app.USER(c, reqCtx, forApi)` which delegates to `auth.User`.

---

## License

Part of the uetapp-v3 / flowtrove monorepo. See repository root for license terms.
