package models

import (
	"time"

	"github.com/google/uuid"

	"gorm.io/gorm"
)

type UserStatus string

const (
	Active    UserStatus = "active"
	Inactive  UserStatus = "inactive"
	Suspended UserStatus = "suspended"
)

// Server specific settings.
type User struct {
	ID string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`

	FirstName    string `json:"first_name" gorm:"size:50;"`
	LastName     string `json:"last_name" gorm:"size:50;"`
	Email        string `json:"email" gorm:"size:50;default:null;"`
	Username     string `json:"username" gorm:"size:50;unique;default:null;"`
	LdapUsername string `json:"ldap_username" gorm:"size:50;default:null;"`
	Password     string `json:"password" gorm:"size:100;"`

	Image string `json:"image" gorm:"size:200;"`

	// Devices []Device `json:"devices" gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	IsConfirmed bool       `json:"is_confirmed" gorm:"default:false;"`
	Status      UserStatus `json:"status" gorm:"default:active;"`
	Roles       JSONBArray `json:"roles" gorm:"type:jsonb;default:'[]';"`
	Content     JSONBAny   `json:"content" gorm:"type:jsonb;default:'{}';"`

	Metadata JSONBAny `json:"meta_data" gorm:"type:jsonb;default:'{}';"`

	Sessions []Session `json:"sessions" gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *User) BeforeCreate(_ *gorm.DB) (err error) {
	b.ID = uuid.New().String()
	return
}

func (b User) TableName() string {
	return "users"
}
