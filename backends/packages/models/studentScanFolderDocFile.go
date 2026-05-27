package models

import (
	"time"

	"gorm.io/gorm"
)

type StudentScanFolderDocFileStatus string

const (
	StudentScanFolderDocFileStatusPending   StudentScanFolderDocFileStatus = "pending"
	StudentScanFolderDocFileStatusCompleted StudentScanFolderDocFileStatus = "completed"
)

type StudentScanFolderDocFileType string

const (
	StudentScanFolderDocFileTypePDF   StudentScanFolderDocFileType = "pdf"
	StudentScanFolderDocFileTypeImage StudentScanFolderDocFileType = "image"
)

// Server specific settings.
type StudentScanFolderDocFile struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	StudentScanFolderDocID int64                `json:"student_scan_folder_doc_id" gorm:"type:bigint;not null;index"`
	StudentScanFolderDoc   StudentScanFolderDoc `json:"student_scan_folder_doc" gorm:"foreignKey:StudentScanFolderDocID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	ResourceID int64                          `json:"resource_id" gorm:"type:bigint;not null;index"`
	Resource   Resource                       `json:"resource" gorm:"foreignKey:ResourceID;references:ID"`
	Bucket     string                         `json:"bucket" gorm:"type:varchar(255);default:null"`
	Type       StudentScanFolderDocFileType   `json:"type" gorm:"type:varchar(255);default:null"`
	Status     StudentScanFolderDocFileStatus `json:"status" gorm:"type:varchar(255);default:pending"`

	Size      int64  `json:"size" gorm:"type:bigint;default:0"`
	MimeType  string `json:"mime_type" gorm:"type:varchar(50);default:null"`
	Extension string `json:"extension" gorm:"type:varchar(50);default:null"`

	Path string `json:"path" gorm:"type:text;default:null"`

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
