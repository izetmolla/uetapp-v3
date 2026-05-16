package render

import (
	"context"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type RenderInterface interface {
	Render() *Render
	View(c fiber.Ctx, params ...any) error
	ApiError(c fiber.Ctx) error
}

type Render struct {
	serviceName string
	db          *gorm.DB
	redis       *redis.Client

	themes_table_name string
	WithGeneralData   GeneralDataFunc
}

func New(cfg *Config) *Render {
	return &Render{
		serviceName:     cfg.ServiceName,
		db:              cfg.DB,
		redis:           cfg.Redis,
		WithGeneralData: cfg.WithGeneralData,
	}
}

type RenderOptionsFunc func(*RenderOptions)
type RenderOptions struct {
	ctx   context.Context
	title string
	data  any

	// Error handling
	err          error
	errorStatus  int
	errorCode    string
	errorDetails map[string]any
}

func defaultRenderOptions() RenderOptions {
	return RenderOptions{
		ctx:          context.Background(),
		title:        "Home",
		err:          nil,
		errorStatus:  0,
		errorCode:    "",
		errorDetails: map[string]any{},
	}
}

func (r *Render) Render() *Render {
	return r
}

func (app *Render) NewRender(opts ...RenderOptionsFunc) *RenderOptions {
	o := defaultRenderOptions()
	for _, fn := range opts {
		fn(&o)
	}
	return &o
}

// WithContext returns a functional option that sets the context for the view.
//
// Example:
//
//	return app.View(c, app.WithContext(ctx))
//	return app.View(c, app.WithContext(context.Background()))
func (app *Render) WithContext(ctx context.Context) RenderOptionsFunc {
	return func(o *RenderOptions) {
		o.ctx = ctx
	}
}

// WithTitle returns a functional option that sets the title for the render.
//
// Example:
//
//	return app.View(c, app.WithTitle("Hello, World!"))
func (app *Render) WithTitle(title string) RenderOptionsFunc {
	return func(o *RenderOptions) {
		o.title = title
	}
}

// WithData returns a functional option that sets the data for the render.
//
// Example:
//
//	return app.View(c, app.WithData(fiber.Map{
//		"message": "Hello, World!",
//	}))
func (app *Render) WithData(data any) RenderOptionsFunc {
	return func(o *RenderOptions) {
		o.data = data
	}
}
