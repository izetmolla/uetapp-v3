package render

import (
	"context"

	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type GeneralDataFunc func(ctx context.Context, serviceName string) (map[string]any, error)

type Config struct {
	DB              *gorm.DB
	Redis           *redis.Client
	ServiceName     string
	WithGeneralData GeneralDataFunc
}
