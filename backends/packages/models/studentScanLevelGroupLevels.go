package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudentScanLevelGroupLevels struct {
	StudentScanLevelGroupID int64                 `json:"student_scan_level_group_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_scan_level_group_levels"`
	StudentScanLevelGroup   StudentScanLevelGroup `json:"student_scan_level_group" gorm:"foreignKey:StudentScanLevelGroupID;references:ID"`
	StudyLevelID            int64                 `json:"study_level_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_scan_level_group_levels"`
	StudyLevel              StudyLevel            `json:"study_level" gorm:"foreignKey:StudyLevelID;references:ID"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentScanLevelGroupLevels) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentScanLevelGroupLevels) TableName() string {
	return "student_scan_level_group_levels"
}
