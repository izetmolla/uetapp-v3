package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudyProgram struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:255;"`

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
