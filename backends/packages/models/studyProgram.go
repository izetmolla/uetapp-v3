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
	Name string `json:"name" gorm:"size:255;"`

	Status StudyProgramStatus `json:"status" gorm:"default:active;"`

	FacultyID int64   `json:"faculty_id" gorm:"type:bigint;not null;index"`
	Faculty   Faculty `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`

	Profiles []StudyProgramProfile `json:"profiles" gorm:"foreignKey:StudyProgramID;references:ID"`
	Levels   []StudyProgramLevels  `json:"levels" gorm:"foreignKey:StudyProgramID;references:ID"`

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
