package models

import (
	"time"

	"gorm.io/gorm"
)

type StudyProgramLanguageStatus string

const (
	StudyProgramLanguageStatusActive   StudyProgramLanguageStatus = "active"
	StudyProgramLanguageStatusInactive StudyProgramLanguageStatus = "inactive"
)

// Server specific settings.
type StudyProgramLanguage struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:255;"`
	Code string `json:"code" gorm:"size:255;"`

	Status StudyProgramLanguageStatus `json:"status" gorm:"default:active;"`

	FacultyID int64   `json:"faculty_id" gorm:"type:bigint;not null;index"`
	Faculty   Faculty `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudyProgramLanguage) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudyProgramLanguage) TableName() string {
	return "study_program_languages"
}
