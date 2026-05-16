package render

import (
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type Config struct {
	db    *gorm.DB
	redis *redis.Client
}
