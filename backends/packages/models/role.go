package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type Role struct {
	ID int64 `json:"id" gorm:"primaryKey;autoIncrement"`

	Name        string `json:"name" gorm:"size:50;"`
	Description string `json:"description" gorm:"size:255;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *Role) BeforeCreate(_ *gorm.DB) (err error) {
	return
}
