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

	Short      string `json:"short" gorm:"size:255;"`
	Students   int64  `json:"students" gorm:"-"`
	Folders    int64  `json:"folders" gorm:"-"`
	Completion int64  `json:"completion" gorm:"-"`
	Accent     string `json:"accent" gorm:"size:255;"`
	Icon       string `json:"icon" gorm:"size:255;"`

	Departments   []Department          `json:"departments" gorm:"foreignKey:FacultyID;references:ID"`
	StudyLevels   []FacultyStudyLevel   `json:"study_levels" gorm:"foreignKey:FacultyID;references:ID"`
	StudyPrograms []FacultyStudyProgram `json:"study_programs" gorm:"foreignKey:FacultyID;references:ID"`

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
