package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type OrgUnit struct {
	ID          int64      `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string     `json:"name" gorm:"size:255;"`
	Slug        string     `json:"slug" gorm:"size:255;default:null;"`
	Description string     `json:"description" gorm:"type:text;"`
	Content     JSONBArray `json:"content" gorm:"type:jsonb;default:'{}';"`

	Unit string `json:"unit" gorm:"size:255;"`

	IsDefault bool `json:"is_default" gorm:"default:false;"`
	IsActive  bool `json:"is_active" gorm:"-"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *OrgUnit) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b OrgUnit) TableName() string {
	return "org_units"
}
