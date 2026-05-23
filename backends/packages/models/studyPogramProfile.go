package models

import (
	"time"

	"gorm.io/gorm"
)

type StudyProgramProfileStatus string

const (
	StudyProgramProfileStatusActive   StudyProgramProfileStatus = "active"
	StudyProgramProfileStatusInactive StudyProgramProfileStatus = "inactive"
)

// Server specific settings.
type StudyProgramProfile struct {
	StudyProgramID int64        `json:"study_program_id" gorm:"type:bigint;not null;uniqueIndex:idx_study_program_profile"`
	StudyProgram   StudyProgram `json:"study_program" gorm:"foreignKey:StudyProgramID;references:ID"`
	StudyProfileID int64        `json:"study_profile_id" gorm:"type:bigint;not null;uniqueIndex:idx_study_program_profile"`
	StudyProfile   StudyProfile `json:"study_profile" gorm:"foreignKey:StudyProfileID;references:ID"`

	OldID string `json:"old_id" gorm:"size:255;default:null;"`

	Status StudyProgramProfileStatus `json:"status" gorm:"default:active;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudyProgramProfile) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudyProgramProfile) TableName() string {
	return "study_program_profiles"
}
