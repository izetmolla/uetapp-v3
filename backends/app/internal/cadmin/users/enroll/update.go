package enroll

import (
	"errors"
	"fmt"
	"strings"

	"github.com/flowtrove/packages/authorization/utils"
	"github.com/flowtrove/packages/models"
)

// csvRowUpdates builds a partial UPDATE map: only columns present in the CSV
// file with a non-empty cell value for this row. id is never updated.
func csvRowUpdates(row csvUserRow, pm *utils.PasswordManager, fileColumns []string) (map[string]interface{}, error) {
	updates := make(map[string]interface{})

	setString := func(key, val string) {
		if !columnInFile(fileColumns, key) {
			return
		}
		v := strings.TrimSpace(val)
		if v == "" {
			return
		}
		updates[key] = v
	}

	setString("first_name", row.FirstName)
	setString("last_name", row.LastName)
	setString("email", row.Email)
	setString("username", row.Username)
	setString("image", row.Image)

	if columnInFile(fileColumns, "password") && strings.TrimSpace(row.Password) != "" {
		hash, err := hashCSVPassword(pm, row.Password)
		if err != nil {
			return nil, fmt.Errorf("hash password: %w", err)
		}
		updates["password"] = hash
	}

	if columnInFile(fileColumns, "status") && strings.TrimSpace(row.Status) != "" {
		status, err := normalizeStatus(row.Status)
		if err != nil {
			return nil, err
		}
		updates["status"] = status
	}

	if columnInFile(fileColumns, "roles") && strings.TrimSpace(row.Roles) != "" {
		roles, err := parseRoles(row.Roles)
		if err != nil {
			return nil, err
		}
		payload, err := models.JSONBArrayBytes(roles)
		if err != nil {
			return nil, err
		}
		updates["roles"] = payload
	}

	return updates, nil
}

func mergeUserUpdates(existing *models.User, updates map[string]interface{}) *models.User {
	if existing == nil {
		return nil
	}
	merged := *existing
	for key, val := range updates {
		switch key {
		case "first_name":
			merged.FirstName = val.(string)
		case "last_name":
			merged.LastName = val.(string)
		case "email":
			merged.Email = val.(string)
		case "username":
			merged.Username = val.(string)
		case "image":
			merged.Image = val.(string)
		case "password":
			merged.Password = val.(string)
		case "status":
			merged.Status = val.(models.UserStatus)
		case "roles":
			if raw, ok := val.([]byte); ok {
				var roles models.JSONBArray
				if err := roles.Scan(raw); err == nil {
					merged.Roles = roles
				}
			}
		}
	}
	return &merged
}

func csvToUserForInsert(row csvUserRow, pm *utils.PasswordManager, fileColumns []string) (*models.User, error) {
	user := &models.User{}

	if columnInFile(fileColumns, "first_name") && strings.TrimSpace(row.FirstName) != "" {
		user.FirstName = strings.TrimSpace(row.FirstName)
	}
	if columnInFile(fileColumns, "last_name") && strings.TrimSpace(row.LastName) != "" {
		user.LastName = strings.TrimSpace(row.LastName)
	}
	if columnInFile(fileColumns, "email") && strings.TrimSpace(row.Email) != "" {
		user.Email = strings.TrimSpace(row.Email)
	}
	if columnInFile(fileColumns, "username") && strings.TrimSpace(row.Username) != "" {
		user.Username = strings.TrimSpace(row.Username)
	}
	if columnInFile(fileColumns, "image") && strings.TrimSpace(row.Image) != "" {
		user.Image = strings.TrimSpace(row.Image)
	}

	if columnInFile(fileColumns, "password") && strings.TrimSpace(row.Password) != "" {
		hash, err := hashCSVPassword(pm, row.Password)
		if err != nil {
			return nil, fmt.Errorf("hash password: %w", err)
		}
		user.Password = hash
	}

	if columnInFile(fileColumns, "status") && strings.TrimSpace(row.Status) != "" {
		status, err := normalizeStatus(row.Status)
		if err != nil {
			return nil, err
		}
		user.Status = status
	} else {
		user.Status = models.Active
	}

	if columnInFile(fileColumns, "roles") && strings.TrimSpace(row.Roles) != "" {
		roles, err := parseRoles(row.Roles)
		if err != nil {
			return nil, err
		}
		user.Roles = roles
	} else {
		user.Roles = models.JSONBArray{}
	}

	if strings.TrimSpace(user.Email) == "" && strings.TrimSpace(user.Username) == "" {
		return nil, errors.New("email or username is required")
	}
	user.IsConfirmed = false

	return user, nil
}
