package config

import (
	"context"
	"errors"
	"os"
	"strings"

	"github.com/flowtrove/packages/authorization"
	"github.com/flowtrove/packages/authorization/ldap"
	"github.com/flowtrove/packages/models"
	"github.com/flowtrove/packages/render"
	"github.com/gofiber/fiber/v3"
	"github.com/minio/minio-go/v7"
	"github.com/spf13/viper"
	"gorm.io/gorm"
)

type ConfigSettings struct {
	Port        string
	Address     string
	JWTSecret   string
	DatabaseURL string
	RedisURL    string
	AuthURL     string
	LDAPConfig  *ldap.Config
}

type Application interface {
	Postgres() *gorm.DB
	View(ctx fiber.Ctx, optsParams ...render.RenderOptionsFunc) error
	Api(ctx fiber.Ctx, optsParams ...render.RenderOptionsFunc) error
}
type AppClients struct {
	appService string
	serviceID  string
	postgres   *gorm.DB
	auth       *authorization.Authorization
	render     *render.Render
	minio      map[int64]*minio.Client
}

var ExcludedRoutes = []string{}

func BootApplication(cfg ConfigSettings) (*AppClients, error) {
	var err error
	app := AppClients{}
	app.postgres, err = InitializeDatabase(cfg.DatabaseURL)
	if err != nil {
		return nil, err
	}
	if err := AutoMigratePostgress(app.postgres, models.Models()...); err != nil {
		return nil, err
	}

	if app.auth, err = authorization.NewAuthorization(&authorization.AuthorizationOptions{
		DB:        app.postgres,
		JWTSecret: cfg.JWTSecret,
		// 15m gives enough headroom for clock skew, slow networks and
		// concurrent tabs. The frontend refreshes proactively a minute
		// before this expires; a value as low as 15s caused legitimate
		// requests to be rejected mid-flight (and the user signed out)
		// any time there was even a small delay between the client's
		// expiry check and the server seeing the request.
		AccessTokenDuration:  "15s",
		RefreshTokenDuration: "4w",
		AutoMigration:        false,
		UserModel:            &models.User{},
		UserTableName:        "users",
		SessionModel:         &models.Session{},
		SessionTableName:     "sessions",
		AuthURL:              cfg.AuthURL,
		LDAPConfig:           cfg.LDAPConfig,
	}); err != nil {
		return nil, err
	}

	app.render = render.New(&render.Config{
		DB:              app.postgres,
		ServiceName:     "app",
		WithGeneralData: app.withGeneralData(),
	})

	app.minio = map[int64]*minio.Client{}

	return &app, err
}

func (app *AppClients) Postgres() *gorm.DB {
	return app.postgres
}

func GetConfigSettings() (*ConfigSettings, error) {
	// Process env (e.g. Kubernetes env / secrets) must work without a .env file.
	viper.AutomaticEnv()

	if _, statErr := os.Stat(".env"); statErr == nil {
		viper.SetConfigFile(".env")
		if err := viper.ReadInConfig(); err != nil {
			return nil, err
		}
	} else if !errors.Is(statErr, os.ErrNotExist) {
		return nil, statErr
	}

	configSettings := ConfigSettings{}
	if viper.GetString("ENV") != "production" {
		os.Setenv("ENV", "development")
	}
	if viper.GetString("PORT") != "" {
		configSettings.Port = viper.GetString("PORT")
	} else {
		configSettings.Port = "3000"
	}

	if viper.GetString("ADDRESS") != "" {
		configSettings.Address = viper.GetString("ADDRESS")
	} else {
		configSettings.Address = "0.0.0.0"
	}
	if viper.GetString("JWT_SECRET") != "" {
		configSettings.JWTSecret = viper.GetString("JWT_SECRET")
	} else {
		return nil, errors.New("JWT_SECRET is not set")
	}
	if viper.GetString("AUTH_URL") != "" {
		configSettings.AuthURL = viper.GetString("AUTH_URL")
	} else {
		return nil, errors.New("AUTH_URL is not set")
	}
	if viper.GetString("DATABASE_URL") != "" {
		configSettings.DatabaseURL = viper.GetString("DATABASE_URL")
	} else {
		return nil, errors.New("DATABASE_URL is not set")
	}

	//LDAP Config
	if viper.GetString("LDAP_URL") != "" {
		configSettings.LDAPConfig = &ldap.Config{}
		// URL:            "ldaps://ad.example.com:636",
		configSettings.LDAPConfig.URL = viper.GetString("LDAP_URL")
		// BindDN:         "...",
		if bindDN := viper.GetString("LDAP_BIND_DN"); bindDN != "" {
			configSettings.LDAPConfig.BindDN = bindDN
			bindPassword := viper.GetString("LDAP_BIND_PASSWORD")
			if bindPassword == "" {
				return nil, errors.New("LDAP_BIND_PASSWORD is required when LDAP_BIND_DN is set")
			}
			configSettings.LDAPConfig.BindPassword = bindPassword
		}
		// BaseDN:         "DC=example,DC=com",
		if viper.GetString("LDAP_BASE_DN") != "" {
			configSettings.LDAPConfig.BaseDN = viper.GetString("LDAP_BASE_DN")
		}
		// UserFilter:     "(&(objectClass=user)(mail=%s))",
		if viper.GetString("LDAP_USER_FILTER") != "" {
			configSettings.LDAPConfig.UserFilter = viper.GetString("LDAP_USER_FILTER")
		}
		// UserAttribute:  "mail",
		if viper.GetString("LDAP_USER_ATTRIBUTE") != "" {
			configSettings.LDAPConfig.UserAttribute = viper.GetString("LDAP_USER_ATTRIBUTE")
		}
		// NameAttributes: []string{"displayName", "cn"},
		if viper.GetString("LDAP_NAME_ATTRIBUTES") != "" {
			configSettings.LDAPConfig.NameAttributes = strings.Split(viper.GetString("LDAP_NAME_ATTRIBUTES"), ",")
		}
		// RoleAttribute:  "memberOf", // AD groups → User.Roles
		if viper.GetString("LDAP_ROLE_ATTRIBUTE") != "" {
			configSettings.LDAPConfig.RoleAttribute = viper.GetString("LDAP_ROLE_ATTRIBUTE")
		}
		// Attributes:     []string{"title", "department", "sAMAccountName"},
		if viper.GetString("LDAP_ATTRIBUTES") != "" {
			configSettings.LDAPConfig.Attributes = strings.Split(viper.GetString("LDAP_ATTRIBUTES"), ",")
		}
		if viper.GetBool("LDAP_INSECURE_SKIP_VERIFY") {
			configSettings.LDAPConfig.InsecureSkipVerify = true
		}
		if sn := viper.GetString("LDAP_TLS_SERVER_NAME"); sn != "" {
			configSettings.LDAPConfig.TLSServerName = sn
		}
		if viper.GetBool("LDAP_DIRECT_BIND") {
			configSettings.LDAPConfig.DirectBind = true
		}
		if domain := viper.GetString("LDAP_DOMAIN"); domain != "" {
			configSettings.LDAPConfig.Domain = strings.TrimPrefix(domain, "@")
		}
		if bindTpl := viper.GetString("LDAP_USER_BIND_DN"); bindTpl != "" {
			configSettings.LDAPConfig.UserBindDN = bindTpl
		} else if configSettings.LDAPConfig.DirectBind && configSettings.LDAPConfig.Domain == "" {
			configSettings.LDAPConfig.UserBindDN = "%s"
		}
	}

	return &configSettings, nil
}

func (app *AppClients) ServiceName() string {
	if app.appService == "" {
		app.appService = "app"
	}
	return app.appService
}

func (app *AppClients) Render() *render.Render {
	return app.render
}

func (app *AppClients) View(c fiber.Ctx, optsParams ...render.RenderOptionsFunc) error {
	return app.render.View(c, optsParams...)
}
func (app *AppClients) Api(c fiber.Ctx, optsParams ...render.RenderOptionsFunc) error {
	return app.render.Api(c, optsParams...)
}

func (app *AppClients) Auth() *authorization.Authorization {
	return app.auth
}

func (app *AppClients) ApiNotFound(c fiber.Ctx) error {
	return app.render.Api(c,
		app.render.WithStatus(fiber.StatusNotFound),
		app.render.WithData(fiber.Map{
			"error":   true,
			"message": "API Not Found",
			"code":    "NOT_FOUND",
			"status":  fiber.StatusNotFound,
			"details": map[string]any{
				"method": c.Method(),
				"url":    c.OriginalURL(),
			},
		}))
}

func (app *AppClients) ViewNotFound(c fiber.Ctx) error {
	return app.render.View(c,
		app.render.WithContext(c.Context()),
		app.render.WithTitle("Not Found"),
		app.render.WithError(errors.New("View Not Found")),
		app.render.WithStatus(fiber.StatusNotFound),
		app.render.WithData(fiber.Map{
			"error":   true,
			"message": "View Not Found",
			"code":    "NOT_FOUND",
			"status":  fiber.StatusNotFound,
			"details": map[string]any{
				"method": c.Method(),
				"url":    c.OriginalURL(),
			},
		}))
}

func (app *AppClients) WebView(params ...string) fiber.Handler {
	r := app.Render()
	return func(c fiber.Ctx) error {
		if len(params) > 0 {
			r.WithTitle(params[0])
		}

		return app.View(c, r.WithContext(c.Context()))
	}
}

func (app *AppClients) USER(c fiber.Ctx, reqCtx context.Context, fromAPI ...bool) (*authorization.AuthData, error) {
	return app.auth.User(c, reqCtx, fromAPI...)
}

func (app *AppClients) GetRole(endpointRoles, userRoles []string) (bool, bool, bool) {
	if app.auth == nil {
		return false, false, false
	}
	return app.auth.GetRole(endpointRoles, userRoles)
}
