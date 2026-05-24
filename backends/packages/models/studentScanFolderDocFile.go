package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudentScanFolderDocFile struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	StudentScanFolderDocID int64                `json:"student_scan_folder_doc_id" gorm:"type:bigint;not null;index"`
	StudentScanFolderDoc   StudentScanFolderDoc `json:"student_scan_folder_doc" gorm:"foreignKey:StudentScanFolderDocID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentScanFolderDocFile) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentScanFolderDocFile) TableName() string {
	return "student_scan_folder_doc_files"
}
