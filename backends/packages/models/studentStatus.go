package models

import (
	"time"

	"gorm.io/gorm"
)

type StudentStatusStatus string

const (
	StudentStatusStatusActive   StudentStatusStatus = "active"
	StudentStatusStatusInactive StudentStatusStatus = "inactive"
)

// Server specific settings.
type StudentStatus struct {
	ID          int64               `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string              `json:"name" gorm:"size:255;"`
	Code        string              `json:"code" gorm:"size:255;"`
	Slug        string              `json:"slug" gorm:"size:255;"`
	Description string              `json:"description" gorm:"type:text;"`
	Image       string              `json:"image" gorm:"size:255;"`
	Icon        string              `json:"icon" gorm:"size:255;"`
	Accent      string              `json:"accent" gorm:"size:255;"`
	Status      StudentStatusStatus `json:"status" gorm:"default:active;"`

	Hidden bool `json:"hidden" gorm:"default:false;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentStatus) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentStatus) TableName() string {
	return "student_statuses"
}
