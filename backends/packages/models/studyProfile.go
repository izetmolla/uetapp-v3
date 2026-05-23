package models

import (
	"time"

	"gorm.io/gorm"
)

type StudyProfileStatus string

const (
	StudyProfileStatusActive   StudyProfileStatus = "active"
	StudyProfileStatusInactive StudyProfileStatus = "inactive"
)

// Server specific settings.
type StudyProfile struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:255;"`

	Status StudyProfileStatus `json:"status" gorm:"default:active;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudyProfile) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudyProfile) TableName() string {
	return "study_profiles"
}
