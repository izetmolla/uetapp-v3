// Package models defines data models for authentication and storage.
// This package contains GORM models for User and Session entities,
// designed for cross-database compatibility (PostgreSQL, MySQL, SQLite, MariaDB).
package models

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

// SetUsersTableName sets the table name for User model.
// This is called during initialization to support custom table names.
func (d *DBManager) SetUsersTableName(name string) {
	if name == "" {
		name = "users"
	}
	tableNameRegistry.Lock()
	defer tableNameRegistry.Unlock()
	tableNameRegistry.usersTable = name
}

// GetUsersTableName returns the current User table name.
func (d *DBManager) GetUsersTableName() string {
	tableNameRegistry.RLock()
	defer tableNameRegistry.RUnlock()
	return tableNameRegistry.usersTable
}

type UserStatus string

const (
	Active    UserStatus = "active"
	Inactive  UserStatus = "inactive"
	Suspended UserStatus = "suspended"
)

// Server specific settings.
type User struct {
	ID string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`

	FirstName string `json:"first_name" gorm:"size:50;"`
	LastName  string `json:"last_name" gorm:"size:50;"`
	Email     string `json:"email" gorm:"size:50;default:null;"`
	Username  string `json:"username" gorm:"size:50;unique;default:null;"`
	Password  string `json:"password" gorm:"size:100;"`

	Image string `json:"image" gorm:"size:200;"`

	// Devices []Device `json:"devices" gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	IsConfirmed bool            `json:"is_confirmed" gorm:"default:false;"`
	Status      UserStatus      `json:"status" gorm:"default:active;"`
	Roles       json.RawMessage `json:"roles" gorm:"type:jsonb;default:'[]';"`
	Content     json.RawMessage `json:"content" gorm:"type:jsonb;default:'{}';"`

	Metadata json.RawMessage `json:"meta_data" gorm:"type:jsonb;default:'{}';"`

	Sessions []Session `json:"sessions" gorm:"foreignKey:UserID;constraint:OnUpdate:CASCADE,OnDelete:CASCADE;"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *User) BeforeCreate(_ *gorm.DB) (err error) {
	b.ID = uuid.New().String()
	return
}

// TableName specifies the table name for User.
// Returns the configured table name from Authorization config, or default "users".
func (User) TableName() string {
	tableNameRegistry.RLock()
	defer tableNameRegistry.RUnlock()
	return tableNameRegistry.usersTable
}

// FindUser loads one row into a new instance of the registered user model (see WithUserModel).
// The return value is always a pointer to struct; it is a clone so concurrent calls do not share state.
func (d *DBManager) FindUser(ctx context.Context, usernameOrEmail string) (*User, error) {
	if d == nil || d.db == nil {
		return nil, errors.New("db manager is not initialized")
	}
	user := &User{}
	if err := d.db.
		WithContext(ctx).
		Raw(fmt.Sprintf("SELECT * FROM %s WHERE username = ? OR email = ?", d.GetUsersTableName()), usernameOrEmail, usernameOrEmail).
		First(user).Error; err != nil {
		return nil, err
	}
	return user, nil
}
