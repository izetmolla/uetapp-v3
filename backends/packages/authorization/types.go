package authorization

import (
	"github.com/go-redis/redis/v8"
	"gorm.io/gorm"
)

type AuthorizationOptions struct {
	DB                   *gorm.DB
	Redis                *redis.Client
	JWTSecret            string
	AccessTokenDuration  string
	RefreshTokenDuration string

	UserModel        any
	UserTableName    string
	SessionModel     any
	SessionTableName string
	AutoMigration    bool

	CookieSessionName string
	AuthURL           string
	SignInRedirectURL string
}

type AuthorizationError struct {
	Error error  `json:"error"`
	Field string `json:"field"`
}
