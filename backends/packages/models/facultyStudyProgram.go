package models

import (
	"time"

	"gorm.io/gorm"
)

type FacultyStudyProgramStatus string

const (
	FacultyStudyProgramStatusActive   FacultyStudyProgramStatus = "active"
	FacultyStudyProgramStatusInactive FacultyStudyProgramStatus = "inactive"
)

// Server specific settings.
type FacultyStudyProgram struct {
	FacultyID      int64        `json:"faculty_id" gorm:"type:bigint;not null;uniqueIndex:idx_faculty_study_program"`
	Faculty        Faculty      `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`
	StudyProgramID int64        `json:"study_program_id" gorm:"type:bigint;not null;uniqueIndex:idx_faculty_study_program"`
	StudyProgram   StudyProgram `json:"study_program" gorm:"foreignKey:StudyProgramID;references:ID"`

	Status FacultyStudyProgramStatus `json:"status" gorm:"default:active;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *FacultyStudyProgram) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b FacultyStudyProgram) TableName() string {
	return "faculty_study_programs"
}
