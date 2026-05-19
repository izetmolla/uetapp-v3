package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type Student struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	UserID string `json:"user_id" gorm:"type:uuid;default:null"`
	User   User   `json:"user" gorm:"foreignKey:UserID;references:ID"`

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
