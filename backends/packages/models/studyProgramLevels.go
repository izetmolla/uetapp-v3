package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudyProgramLevels struct {
	StudyProgramID int64        `json:"study_program_id" gorm:"type:bigint;not null;uniqueIndex:idx_study_program_levels"`
	StudyProgram   StudyProgram `json:"study_program" gorm:"foreignKey:StudyProgramID;references:ID"`
	StudyLevelID   int64        `json:"study_level_id" gorm:"type:bigint;not null;uniqueIndex:idx_study_program_levels"`
	StudyLevel     StudyLevel   `json:"study_level" gorm:"foreignKey:StudyLevelID;references:ID"`

	OldID string `json:"old_id" gorm:"size:255;default:null;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudyProgramLevels) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudyProgramLevels) TableName() string {
	return "study_program_levels"
}
