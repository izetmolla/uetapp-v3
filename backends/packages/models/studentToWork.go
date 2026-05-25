package models

import (
	"time"

	"gorm.io/gorm"
)

type StudentToWorkStatus string

const (
	StudentToWorkStatusPending   StudentToWorkStatus = "pending"
	StudentToWorkStatusCompleted StudentToWorkStatus = "completed"
)

// Server specific settings.
type StudentToScanFolder struct {
	StudentScanFolderID int64             `json:"student_scan_folder_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_to_work"`
	StudentScanFolder   StudentScanFolder `json:"student_scan_folder" gorm:"foreignKey:StudentScanFolderID;references:ID"`
	StudentID           int64             `json:"student_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_to_work"`
	Student             Student           `json:"student" gorm:"foreignKey:StudentID;references:ID"`

	Status StudentToWorkStatus `json:"status" gorm:"default:pending;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentToScanFolder) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentToScanFolder) TableName() string {
	return "student_to_works"
}
