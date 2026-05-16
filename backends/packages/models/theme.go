package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service specific settings.
type Theme struct {
	ID          string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string `json:"name" gorm:"size:255;"`
	BodyContent string `json:"body_content" gorm:"type:text;"`
	Version     string `json:"version" gorm:"size:255;"`
	Status      string `json:"status" gorm:"size:255;"`
	Service     string `json:"service" gorm:"size:255;"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
}

func (b *Theme) BeforeCreate(_ *gorm.DB) (err error) {
	b.ID = uuid.New().String()
	return
}

func (b *Theme) TableName() string {
	return "themes"
}
