package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudentScanLevelGroup struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:255;"`

	AcademicYearID              int64                         `json:"academic_year_id" gorm:"type:bigint;not null;index"`
	AcademicYear                AcademicYear                  `json:"academic_year" gorm:"foreignKey:AcademicYearID;references:ID"`
	FacultyID                   int64                         `json:"faculty_id" gorm:"type:bigint;not null;index"`
	Faculty                     Faculty                       `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`
	StudentScanLevelGroupLevels []StudentScanLevelGroupLevels `json:"study_levels" gorm:"foreignKey:StudentScanLevelGroupID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentScanLevelGroup) BeforeDelete(tx *gorm.DB) (err error) {
	return nil
}

func (b *StudentScanLevelGroup) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentScanLevelGroup) TableName() string {
	return "student_scan_level_groups"
}
