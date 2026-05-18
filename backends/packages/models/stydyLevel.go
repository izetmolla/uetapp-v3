package models

import (
	"time"

	"gorm.io/gorm"
)

type StudyLevelStatus string

const (
	StudyLevelStatusActive   StudyLevelStatus = "active"
	StudyLevelStatusInactive StudyLevelStatus = "inactive"
)

// Server specific settings.
type StudyLevel struct {
	ID          int64            `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string           `json:"name" gorm:"size:255;"`
	Code        string           `json:"code" gorm:"size:255;"`
	Slug        string           `json:"slug" gorm:"size:255;"`
	Description string           `json:"description" gorm:"type:text;"`
	Image       string           `json:"image" gorm:"size:255;"`
	Status      StudyLevelStatus `json:"status" gorm:"default:active;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudyLevel) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudyLevel) TableName() string {
	return "study_levels"
}
