package models

import (
	"time"

	"gorm.io/gorm"
)

type FacultyStatus string

const (
	FacultyStatusActive   FacultyStatus = "active"
	FacultyStatusInactive FacultyStatus = "inactive"
)

// Server specific settings.
type Faculty struct {
	ID          int64         `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string        `json:"name" gorm:"size:255;"`
	Slug        string        `json:"slug" gorm:"size:255;default:null;"`
	Description string        `json:"description" gorm:"type:text;"`
	Image       string        `json:"image" gorm:"size:255;"`
	Status      FacultyStatus `json:"status" gorm:"default:active;"`

	Departments []Department `json:"departments" gorm:"foreignKey:FacultyID;references:ID"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *Faculty) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b Faculty) TableName() string {
	return "faculties"
}
