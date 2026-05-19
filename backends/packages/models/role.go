package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type Role struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	Name        string `json:"name" gorm:"size:50;uniqueIndex"`
	Description string `json:"description" gorm:"size:255;"`
	Status      Status `json:"status" gorm:"size:20;default:active;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (Role) TableName() string {
	return "roles"
}

func (b *Role) BeforeCreate(_ *gorm.DB) (err error) {
	return
}
