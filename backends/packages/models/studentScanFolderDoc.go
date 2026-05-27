package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudentScanFolderDoc struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	StudentScanFolderID int64             `json:"student_scan_folder_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_scan_folder_doc"`
	StudentScanFolder   StudentScanFolder `json:"student_scan_folder" gorm:"foreignKey:StudentScanFolderID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE"`
	StudentID           int64             `json:"student_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_scan_folder_doc"`
	Student             Student           `json:"student" gorm:"foreignKey:StudentID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	StudentStudyProgramID *int64               `json:"student_study_program_id,omitempty" gorm:"type:bigint;uniqueIndex:idx_student_scan_folder_doc"`
	StudentStudyProgram   *StudentStudyProgram `json:"student_study_program,omitempty" gorm:"foreignKey:StudentStudyProgramID;references:ID;constraint:OnUpdate:CASCADE,OnDelete:RESTRICT"`

	Files []StudentScanFolderDocFile `json:"files" gorm:"foreignKey:StudentScanFolderDocID;references:ID"`

	Completed bool `json:"completed" gorm:"default:false;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentScanFolderDoc) BeforeDelete(tx *gorm.DB) (err error) {
	if b.ID == 0 {
		return nil
	}
	return tx.Where("student_scan_folder_doc_id = ?", b.ID).Delete(&StudentScanFolderDocFile{}).Error
}

func (b *StudentScanFolderDoc) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentScanFolderDoc) TableName() string {
	return "student_scan_folder_docs"
}
