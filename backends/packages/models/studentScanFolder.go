package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudentScanFolder struct {
	ID   int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name string `json:"name" gorm:"size:255;"`

	AcademicYearID int64        `json:"academic_year_id" gorm:"type:bigint;not null;index"`
	AcademicYear   AcademicYear `json:"academic_year" gorm:"foreignKey:AcademicYearID;references:ID"`
	FacultyID      int64        `json:"faculty_id" gorm:"type:bigint;not null;index"`
	Faculty        Faculty      `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`
	StudyLevelID   int64        `json:"study_level_id" gorm:"type:bigint;not null;index"`
	StudyLevel     StudyLevel   `json:"study_level" gorm:"foreignKey:StudyLevelID;references:ID"`

	Docs []StudentScanFolderDoc `json:"docs" gorm:"foreignKey:StudentScanFolderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentScanFolder) BeforeDelete(tx *gorm.DB) (err error) {
	if b.ID == 0 {
		return nil
	}
	return tx.Where("student_scan_folder_id = ?", b.ID).Delete(&StudentScanFolderDoc{}).Error
}

func (b *StudentScanFolder) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentScanFolder) TableName() string {
	return "student_scan_folders"
}
