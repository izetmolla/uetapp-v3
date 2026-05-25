package models

import (
	"time"

	"gorm.io/gorm"
)

type StudyProgramStatus string

const (
	StudyProgramStatusActive   StudyProgramStatus = "active"
	StudyProgramStatusInactive StudyProgramStatus = "inactive"
)

// Server specific settings.
type StudyProgram struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:255;uniqueIndex"`
	Slug string `json:"slug" gorm:"size:255;"`

	Status StudyProgramStatus `json:"status" gorm:"default:active;"`

	Faculties   []FacultyStudyProgram `json:"faculties" gorm:"foreignKey:StudyProgramID;references:ID"`
	Profiles    []StudyProgramProfile `json:"profiles" gorm:"foreignKey:StudyProgramID;references:ID"`
	StudyLevels []StudyProgramLevels  `json:"study_levels" gorm:"foreignKey:StudyProgramID;references:ID"`
	Students    []StudentStudyProgram `json:"students" gorm:"foreignKey:StudyProgramID;references:ID"`

	Language   StudyProgramLanguage `json:"language" gorm:"foreignKey:LanguageID;references:ID"`
	LanguageID *int64               `json:"language_id" gorm:"type:bigint;index"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudyProgram) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudyProgram) TableName() string {
	return "study_programs"
}
