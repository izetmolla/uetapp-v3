package models

import (
	"time"

	"gorm.io/gorm"
)

type StudentStatusStatus string

// Server specific settings.
type StudentStatus struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:255; uniqueIndex:idx_student_status"`
	Type string `json:"type" gorm:"size:255;"`

	Code        string `json:"code" gorm:"size:255;"`
	Slug        string `json:"slug" gorm:"size:255;"`
	Description string `json:"description" gorm:"type:text;"`
	Image       string `json:"image" gorm:"size:255;"`
	Icon        string `json:"icon" gorm:"size:255;"`
	Accent      string `json:"accent" gorm:"size:255;"`

	Hidden bool `json:"hidden" gorm:"default:false;"`

	Programs []StudentStudyProgram `json:"programs" gorm:"foreignKey:StudentStatusID;references:ID"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentStatus) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentStatus) TableName() string {
	return "student_statuses"
}
