package models

import (
	"time"

	"gorm.io/gorm"
)

type AcademicYearStatus string

var (
	AcademicYearStatusActive   AcademicYearStatus = "active"
	AcademicYearStatusInactive AcademicYearStatus = "archived"
)

// Server specific settings.
type AcademicYear struct {
	ID     int64              `json:"id" gorm:"primaryKey;autoIncrement"`
	Year   string             `json:"year" gorm:"size:10;"`
	Status AcademicYearStatus `json:"status" gorm:"default:active;"`

	Folders    int64  `json:"folders" gorm:"-"`
	Students   int64  `json:"students" gorm:"-"`
	Faculties  int64  `json:"faculties" gorm:"-"`
	Completion int64  `json:"completion" gorm:"-"`
	Accent     string `json:"accent" gorm:"size:255;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *AcademicYear) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b AcademicYear) TableName() string {
	return "academic_years"
}
