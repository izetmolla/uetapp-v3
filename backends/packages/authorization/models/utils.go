package models

import (
	"encoding/json"
	"fmt"
)

// validateSessionData validates session data for required fields.
func validateSessionData(session *SessionData) error {
	if session == nil {
		return fmt.Errorf("session data cannot be nil")
	}
	if session.ID == "" {
		return fmt.Errorf("session ID cannot be empty")
	}
	if session.UserID == "" {
		return fmt.Errorf("user ID cannot be empty")
	}
	return nil
}

// buildRedisKey creates a Redis key with the configured prefix.
func buildRedisKey(prefix, sessionID string) string {
	if prefix == "" {
		prefix = "ft_auth"
	}
	return fmt.Sprintf("%s:%s", prefix, sessionID)
}

// serializeSessionData serializes session data to JSON for Redis storage.
func serializeSessionData(session *SessionData) ([]byte, error) {
	if session == nil {
		return nil, fmt.Errorf("session data cannot be nil")
	}

	data, err := json.Marshal(session)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal session data: %w", err)
	}

	return data, nil
}

// deserializeSessionData deserializes JSON data from Redis into session data.
func deserializeSessionData(data []byte) (*SessionData, error) {
	if len(data) == 0 {
		return nil, fmt.Errorf("session data is empty")
	}

	var response SessionData
	if err := json.Unmarshal(data, &response); err != nil {
		return nil, fmt.Errorf("failed to unmarshal session data: %w", err)
	}

	return &response, nil
}
