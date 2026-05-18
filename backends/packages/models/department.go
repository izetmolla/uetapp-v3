package models

import (
	"time"

	"gorm.io/gorm"
)

type DepartmentStatus string

const (
	DepartmentStatusActive   DepartmentStatus = "active"
	DepartmentStatusInactive DepartmentStatus = "inactive"
)

// Server specific settings.
type Department struct {
	ID          int64            `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string           `json:"name" gorm:"size:255;"`
	Slug        string           `json:"slug" gorm:"size:255;default:null;"`
	Description string           `json:"description" gorm:"type:text;"`
	Image       string           `json:"image" gorm:"size:255;"`
	Status      DepartmentStatus `json:"status" gorm:"default:active;"`

	FacultyID int64   `json:"faculty_id" gorm:"type:bigint;not null;index"`
	Faculty   Faculty `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *Department) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b Department) TableName() string {
	return "departments"
}
