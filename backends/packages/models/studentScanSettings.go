package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudentScanSettings struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	Option string   `json:"option" gorm:"type:varchar(255);default:null"`
	Config JSONBAny `json:"config" gorm:"type:jsonb;default:'{}';"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentScanSettings) BeforeCreate(_ *gorm.DB) (err error) {
	if b.Config == nil {
		b.Config = JSONBAny(StudentScanSettingsDefaultConfig)
	}
	return
}

func (b StudentScanSettings) TableName() string {
	return "student_scan_settings"
}

var StudentScanSettingsDefaultConfig JSONBAny = JSONBAny{
	"contract_storage_location": "minio",
}
