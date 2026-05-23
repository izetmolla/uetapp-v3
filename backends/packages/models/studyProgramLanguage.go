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

	StudyPrograms []StudyProgram `json:"study_programs" gorm:"foreignKey:LanguageID;references:ID"`

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
