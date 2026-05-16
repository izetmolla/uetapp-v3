package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service specific settings.
type Template struct {
	ID          string     `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	IdNumber    int64      `json:"id_number" gorm:"uniqueIndex;autoIncrement"`
	Name        string     `json:"name" gorm:"size:255;"`
	Description string     `json:"description" gorm:"type:text;"`
	Image       string     `json:"image" gorm:"size:255;"`
	Content     JSONBArray `json:"content" gorm:"type:jsonb;default:'[]';"`
	IsDefault   bool       `json:"is_default" gorm:"default:false;"`

	IsActive  bool           `json:"is_active" gorm:"-"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
}

func (b *Template) BeforeCreate(_ *gorm.DB) (err error) {
	b.ID = uuid.New().String()
	return
}
