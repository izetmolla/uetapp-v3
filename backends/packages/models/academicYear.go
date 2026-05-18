package models

import (
	"time"

	"gorm.io/gorm"
)

type AcademicYearStatus string

// Server specific settings.
type AcademicYear struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Year string `json:"year" gorm:"size:10;"`

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
