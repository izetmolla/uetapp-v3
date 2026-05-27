package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type Student struct {
	ID         int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	DocumentId string `json:"document_id" gorm:"size:255;uniqueIndex"`

	Firstname   string `json:"firstname" gorm:"size:255;"`
	Lastname    string `json:"lastname" gorm:"size:255;"`
	Fathersname string `json:"fathersname" gorm:"size:255;"`
	Email       string `json:"email" gorm:"size:255;"`
	Phone       string `json:"phone" gorm:"size:255;"`
	Mobile      string `json:"mobile" gorm:"size:255;"`

	Birthdate   string `json:"birthdate" gorm:"size:255;"`
	Gender      string `json:"gender" gorm:"size:255;"`
	Nationality string `json:"nationality" gorm:"size:255;"`

	Status string `json:"status" gorm:"default:active;"`

	UserID string `json:"user_id" gorm:"type:uuid;default:null"`
	User   User   `json:"user" gorm:"foreignKey:UserID;references:ID"`

	Programs             []StudentStudyProgram `json:"programs" gorm:"foreignKey:StudentID;references:ID"`
	StudentToScanFolders []StudentToScanFolder `json:"student_to_scan_folders" gorm:"foreignKey:StudentScanFolderID;references:ID"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (Student) TableName() string {
	return "students"
}

func (b *Student) BeforeCreate(_ *gorm.DB) (err error) {
	return
}
