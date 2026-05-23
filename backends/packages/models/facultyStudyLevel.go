package models

import (
	"time"

	"gorm.io/gorm"
)

type FacultyStudyLevelStatus string

const (
	FacultyStudyLevelStatusActive   FacultyStudyLevelStatus = "active"
	FacultyStudyLevelStatusInactive FacultyStudyLevelStatus = "inactive"
)

// Server specific settings.
type FacultyStudyLevel struct {
	FacultyID    int64      `json:"faculty_id" gorm:"type:bigint;not null;index"`
	Faculty      Faculty    `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`
	StudyLevelID int64      `json:"study_level_id" gorm:"type:bigint;not null;index"`
	StudyLevel   StudyLevel `json:"study_level" gorm:"foreignKey:StudyLevelID;references:ID"`

	Status FacultyStudyLevelStatus `json:"status" gorm:"default:active;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *FacultyStudyLevel) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b FacultyStudyLevel) TableName() string {
	return "faculty_study_levels"
}
