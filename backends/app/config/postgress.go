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
	if err := db.AutoMigrate(models...); err != nil {
		return err
	}
	return dropLegacyStudentScanLevelGroupUniqueIndex(db)
}

// dropLegacyStudentScanLevelGroupUniqueIndex removes the old unique constraint on
// (academic_year_id, faculty_id). Groups are identified by id; multiple groups
// per faculty/year are allowed. GORM AutoMigrate does not drop renamed indexes.
func dropLegacyStudentScanLevelGroupUniqueIndex(db *gorm.DB) error {
	if err := db.Exec(
		`ALTER TABLE student_scan_level_groups DROP CONSTRAINT IF EXISTS idx_student_scan_level_group`,
	).Error; err != nil {
		return err
	}
	return db.Exec(`DROP INDEX IF EXISTS idx_student_scan_level_group`).Error
}
