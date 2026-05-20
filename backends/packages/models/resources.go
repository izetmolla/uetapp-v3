package models

import (
	"time"

	"gorm.io/gorm"
)

type ResourceDriver string

const (
	ResourceDriverHTTPRequest ResourceDriver = "http-request"
)

// Server specific settings.
type Resource struct {
	ID          int64  `json:"id" gorm:"primaryKey;autoIncrement"`
	Name        string `json:"name" gorm:"size:255;"`
	Description string `json:"description" gorm:"type:text;"`

	Driver ResourceDriver `json:"driver" gorm:"size:255;"`

	Config     JSONBAny   `json:"config" gorm:"type:jsonb;default:'{}';"`
	ConfigForm JSONBArray `json:"config_form" gorm:"type:jsonb;default:'[]';"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *Resource) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b Resource) TableName() string {
	return "resources"
}

var HttpRequestConfig = []map[string]any{
	{
		"name":        "GET",
		"description": "GET request",
		"url":         "https://example.com",
		"method":      "GET",
		"headers": map[string]string{
			"Content-Type": "application/json",
		},
		"body": map[string]any{
			"name": "John Doe",
		},
	},
}
