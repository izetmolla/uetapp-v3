package render

import (
	"context"

	"github.com/gofiber/fiber/v3"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type GeneralDataFunc func(c fiber.Ctx, reqCtx context.Context, serviceName string, forApi bool) (map[string]any, error)

type Config struct {
	DB              *gorm.DB
	Redis           *redis.Client
	ServiceName     string
	WithGeneralData GeneralDataFunc
}
