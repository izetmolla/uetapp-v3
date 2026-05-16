package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service specific settings.
type AppService struct {
	ID       string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	IdNumber int64  `json:"id_number" gorm:"uniqueIndex;autoIncrement"`
	Name     string `json:"name" gorm:"size:255;"`
	Title    string `json:"title" gorm:"size:255;"`

	Navigations []AppNavigation `json:"navigations,omitempty" gorm:"foreignKey:ServiceID;references:ID"`

	Roles JSONBArray `json:"roles" gorm:"type:jsonb;default:'[]';"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
}

func (b *AppService) BeforeCreate(_ *gorm.DB) (err error) {
	b.ID = uuid.New().String()
	return
}

func (b AppService) TableName() string {
	return "app_services"
}
