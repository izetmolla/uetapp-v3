package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SetSessionsTableName sets the table name for Session model.
// This is called during initialization to support custom table names.
func (d *DBManager) SetSessionsTableName(name string) {
	if name == "" {
		name = "sessions"
	}
	tableNameRegistry.Lock()
	defer tableNameRegistry.Unlock()
	tableNameRegistry.sessionsTable = name
}

// GetSessionsTableName returns the current Session table name.
func (d *DBManager) GetSessionsTableName() string {
	tableNameRegistry.RLock()
	defer tableNameRegistry.RUnlock()
	return tableNameRegistry.sessionsTable
}

// User represents a registered user in the system.
// It includes authentication, profile information, and relationships to other entities.
type Session struct {
	ID string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	// fiberauth.Session
	UserID string `json:"user_id" gorm:"type:uuid;default:null"`
	User   User   `json:"user" gorm:"foreignKey:UserID;references:ID"`

	IPAddress string `json:"ip_address" gorm:"size:50;"`
	UserAgent string `json:"user_agent" gorm:"size:255;"`
	Method    string `json:"method" gorm:"size:50;default:'credentials';"`

	ExpiresAt time.Time `json:"expires_at" gorm:"autoCreateTime"`
	IsDeleted bool      `json:"is_deleted" gorm:"default:false"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

// BeforeCreate sets a UUID for the user before creation.
// This ensures consistent ID generation across different database systems.
func (u *Session) BeforeCreate(tx *gorm.DB) error {
	if u.ID == "" {
		u.ID = uuid.New().String()
	}
	return nil
}

// TableName specifies the table name for Session.
// Returns the configured table name from Authorization config, or default "sessions".
func (Session) TableName() string {
	tableNameRegistry.RLock()
	defer tableNameRegistry.RUnlock()
	return tableNameRegistry.sessionsTable
}
