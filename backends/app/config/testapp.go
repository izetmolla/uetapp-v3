package config

import "gorm.io/gorm"

// NewTestAppClients returns AppClients backed by db for integration tests.
func NewTestAppClients(db *gorm.DB) *AppClients {
	return &AppClients{postgres: db}
}
