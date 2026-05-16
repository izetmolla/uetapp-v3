package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// Service specific settings.
type ServiceNavigation struct {
	ID       string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	IdNumber int64  `json:"id_number" gorm:"uniqueIndex;autoIncrement"`

	ServiceID string `json:"service_id" gorm:"type:uuid;not null;index:idx_app_navigation_service_id"`
	ParentID  string `json:"parent_id" gorm:"type:uuid;default:null;index:idx_app_navigation_parent_id"`

	Title       string           `json:"title" gorm:"size:255;"`
	Icon        string           `json:"icon" gorm:"size:255;"`
	To          string           `json:"to" gorm:"type:text;"`
	IsNew       bool             `json:"isNew" gorm:"column:isNew;default:false;"`
	IsComing    bool             `json:"isComing" gorm:"column:isComing;default:false;"`
	IsDataBadge string           `json:"isDataBadge" gorm:"column:isDataBadge;size:255;"`
	NewTab      bool             `json:"newTab" gorm:"column:newTab;default:false;"`
	IsExternal  bool             `json:"isExternal" gorm:"column:isExternal;default:false;"`
	Roles       JSONBStringArray `json:"roles" gorm:"type:jsonb;default:'[]';"`

	Children []ServiceNavigation `json:"children,omitempty" gorm:"foreignKey:ParentID;references:ID"`

	Service Service `json:"service" gorm:"foreignKey:ServiceID;references:ID"`
	OrderNr int64   `json:"order_nr" gorm:"column:order_nr;default:0;"`

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `json:"deleted_at"`
}

func (b *ServiceNavigation) BeforeCreate(_ *gorm.DB) (err error) {
	b.ID = uuid.New().String()
	return
}

func (b ServiceNavigation) TableName() string {
	return "service_navigations"
}
