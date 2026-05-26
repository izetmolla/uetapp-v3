package config

import (
	"github.com/spf13/viper"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func InitializeDatabase(databaseURL string) (*gorm.DB, error) {
	config := &gorm.Config{}
	if viper.GetString("ENV") == "production" {
		config.Logger = logger.Default.LogMode(logger.Silent)
	}
	db, err := gorm.Open(postgres.Open(databaseURL), config)
	if err != nil {
		return nil, err
	}
	return db, nil
}

func AutoMigratePostgress(db *gorm.DB, models ...any) error {
	return db.AutoMigrate(models...)
}
