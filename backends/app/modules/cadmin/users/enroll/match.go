package enroll

import (
	"fmt"
	"strings"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

type userIndex struct {
	byID       map[string]*models.User
	byEmail    map[string]*models.User
	byUsername map[string]*models.User
}

type matchResult struct {
	User        *models.User
	MatchedBy   string // id, email, username
	UnmatchedID bool   // csv id was set but not found — fell through to email/username or insert
	Errors      []string
}

func loadUserIndex(db *gorm.DB) (*userIndex, error) {
	var users []models.User
	if err := db.Where("deleted_at IS NULL").Find(&users).Error; err != nil {
		return nil, err
	}
	idx := &userIndex{
		byID:       make(map[string]*models.User, len(users)),
		byEmail:    make(map[string]*models.User, len(users)),
		byUsername: make(map[string]*models.User, len(users)),
	}
	for i := range users {
		u := &users[i]
		if u.ID != "" {
			idx.byID[u.ID] = u
		}
		if e := strings.TrimSpace(u.Email); e != "" {
			idx.byEmail[strings.ToLower(e)] = u
		}
		if un := strings.TrimSpace(u.Username); un != "" {
			idx.byUsername[strings.ToLower(un)] = u
		}
	}
	return idx, nil
}

// resolve matches a CSV row to an existing user using priority:
//  1. id (when present and found)
//  2. email (when id is absent or not found)
//  3. username (when id/email did not match)
//
// If nothing matches, the row is treated as a new user (insert).
func (idx *userIndex) resolve(row csvUserRow) matchResult {
	id := strings.TrimSpace(row.ID)
	email := strings.ToLower(strings.TrimSpace(row.Email))
	username := strings.ToLower(strings.TrimSpace(row.Username))

	unmatchedID := false

	if id != "" {
		if u := idx.byID[id]; u != nil {
			return matchResult{User: u, MatchedBy: "id"}
		}
		unmatchedID = true
	}

	if email != "" {
		if u := idx.byEmail[email]; u != nil {
			if err := idx.crossIdentifierConflict(u, row, "email"); err != nil {
				return matchResult{Errors: []string{err.Error()}}
			}
			return matchResult{User: u, MatchedBy: "email", UnmatchedID: unmatchedID}
		}
	}

	if username != "" {
		if u := idx.byUsername[username]; u != nil {
			if err := idx.crossIdentifierConflict(u, row, "username"); err != nil {
				return matchResult{Errors: []string{err.Error()}}
			}
			return matchResult{User: u, MatchedBy: "username", UnmatchedID: unmatchedID}
		}
	}

	if email == "" && username == "" {
		return matchResult{
			Errors: []string{"email or username is required to create a new user"},
		}
	}

	return matchResult{UnmatchedID: unmatchedID}
}

// crossIdentifierConflict ensures a lower-priority match is not contradicted by
// another identifier in the same row pointing at a different user.
func (idx *userIndex) crossIdentifierConflict(matched *models.User, row csvUserRow, matchedBy string) error {
	id := strings.TrimSpace(row.ID)
	email := strings.ToLower(strings.TrimSpace(row.Email))
	username := strings.ToLower(strings.TrimSpace(row.Username))

	if id != "" && matchedBy != "id" {
		if other := idx.byID[id]; other != nil && other.ID != matched.ID {
			return fmt.Errorf("csv id matches a different user than %s", matchedBy)
		}
	}
	if email != "" && matchedBy != "email" {
		if other := idx.byEmail[email]; other != nil && other.ID != matched.ID {
			return fmt.Errorf("csv email matches a different user than %s", matchedBy)
		}
	}
	if username != "" && matchedBy != "username" {
		if other := idx.byUsername[username]; other != nil && other.ID != matched.ID {
			return fmt.Errorf("csv username matches a different user than %s", matchedBy)
		}
	}
	return nil
}

func buildPreview(rows []csvUserRow, idx *userIndex, fileColumns []string) PreviewResponse {
	seenEmails := make(map[string]int)
	seenUsernames := make(map[string]int)
	seenIDs := make(map[string]int)

	out := PreviewResponse{
		Rows: make([]PreviewRow, 0, len(rows)),
	}

	for i, row := range rows {
		rowNum := i + 2
		pr := PreviewRow{Row: rowNum, CSV: row}
		var rowErrors []string

		emailKey := strings.ToLower(strings.TrimSpace(row.Email))
		usernameKey := strings.ToLower(strings.TrimSpace(row.Username))
		idKey := strings.TrimSpace(row.ID)

		if emailKey != "" {
			if prev, ok := seenEmails[emailKey]; ok {
				rowErrors = append(rowErrors, fmt.Sprintf("duplicate email in CSV (also on row %d)", prev))
				pr.InvalidFields = appendInvalidField(pr.InvalidFields, "email")
			} else {
				seenEmails[emailKey] = rowNum
			}
		}
		if usernameKey != "" {
			if prev, ok := seenUsernames[usernameKey]; ok {
				rowErrors = append(rowErrors, fmt.Sprintf("duplicate username in CSV (also on row %d)", prev))
				pr.InvalidFields = appendInvalidField(pr.InvalidFields, "username")
			} else {
				seenUsernames[usernameKey] = rowNum
			}
		}
		if idKey != "" {
			if prev, ok := seenIDs[idKey]; ok {
				rowErrors = append(rowErrors, fmt.Sprintf("duplicate id in CSV (also on row %d)", prev))
			} else {
				seenIDs[idKey] = rowNum
			}
		}

		if columnInFile(fileColumns, "status") && strings.TrimSpace(row.Status) != "" {
			if _, err := normalizeStatus(row.Status); err != nil {
				rowErrors = append(rowErrors, err.Error())
				pr.InvalidFields = appendInvalidField(pr.InvalidFields, "status")
			}
		}
		if columnInFile(fileColumns, "roles") && strings.TrimSpace(row.Roles) != "" {
			if _, err := parseRoles(row.Roles); err != nil {
				rowErrors = append(rowErrors, err.Error())
				pr.InvalidFields = appendInvalidField(pr.InvalidFields, "roles")
			}
		}

		match := idx.resolve(row)
		rowErrors = append(rowErrors, match.Errors...)
		for _, msg := range match.Errors {
			if k := fieldKeyFromError(msg); k != "" {
				pr.InvalidFields = appendInvalidField(pr.InvalidFields, k)
			}
		}

		if len(rowErrors) > 0 {
			pr.Action = "error"
			pr.Description = "Row cannot be imported"
			pr.Errors = rowErrors
			out.Stats.Invalid++
		} else if match.User != nil {
			pr.Action = "update"
			pr.Existing = existingUserSnapshot(match.User)
			pr.Description = describeUpdate(match.MatchedBy, match.User, row, fileColumns, match.UnmatchedID)
			out.Stats.Update++
		} else {
			pr.Action = "insert"
			pr.Description = describeInsert(row, match.UnmatchedID)
			out.Stats.Insert++
		}

		out.Rows = append(out.Rows, pr)
		out.Stats.Total++
	}

	return out
}

func existingUserSnapshot(u *models.User) *ExistingUser {
	if u == nil {
		return nil
	}
	return &ExistingUser{
		ID:        u.ID,
		FirstName: u.FirstName,
		LastName:  u.LastName,
		Email:     u.Email,
		Username:  u.Username,
		Image:     u.Image,
		Status:    string(u.Status),
		Roles:     rolesToDisplay(u.Roles),
	}
}

func rolesToDisplay(roles models.JSONBArray) string {
	if len(roles) == 0 {
		return ""
	}
	parts := make([]string, 0, len(roles))
	for _, r := range roles {
		if s, ok := r.(string); ok {
			parts = append(parts, s)
		}
	}
	return strings.Join(parts, ", ")
}

func describeUpdate(matchedBy string, existing *models.User, row csvUserRow, fileColumns []string, unmatchedID bool) string {
	var changes []string
	if columnInFile(fileColumns, "first_name") {
		if v := strings.TrimSpace(row.FirstName); v != "" && v != existing.FirstName {
			changes = append(changes, "first name")
		}
	}
	if columnInFile(fileColumns, "last_name") {
		if v := strings.TrimSpace(row.LastName); v != "" && v != existing.LastName {
			changes = append(changes, "last name")
		}
	}
	if columnInFile(fileColumns, "email") {
		if v := strings.TrimSpace(row.Email); v != "" && !strings.EqualFold(v, existing.Email) {
			changes = append(changes, "email")
		}
	}
	if columnInFile(fileColumns, "username") {
		if v := strings.TrimSpace(row.Username); v != "" && !strings.EqualFold(v, existing.Username) {
			changes = append(changes, "username")
		}
	}
	if columnInFile(fileColumns, "password") && strings.TrimSpace(row.Password) != "" {
		changes = append(changes, "password")
	}
	if columnInFile(fileColumns, "image") {
		if v := strings.TrimSpace(row.Image); v != "" && v != existing.Image {
			changes = append(changes, "image")
		}
	}
	if columnInFile(fileColumns, "status") {
		if v := strings.TrimSpace(row.Status); v != "" && strings.ToLower(v) != string(existing.Status) {
			changes = append(changes, "status")
		}
	}
	if columnInFile(fileColumns, "roles") && strings.TrimSpace(row.Roles) != "" {
		changes = append(changes, "roles")
	}

	matchLabel := map[string]string{
		"id":       "database id",
		"email":    "email",
		"username": "username",
	}[matchedBy]

	desc := fmt.Sprintf("Existing user matched by %s will be updated", matchLabel)
	if unmatchedID {
		desc = "CSV id not found; " + strings.ToLower(desc)
	}
	if len(changes) > 0 {
		desc += " (" + strings.Join(changes, ", ") + ")"
	} else {
		desc += " (no field changes detected; row can still be applied)"
	}
	return desc
}

func describeInsert(row csvUserRow, unmatchedID bool) string {
	var desc string
	name := strings.TrimSpace(strings.TrimSpace(row.FirstName) + " " + strings.TrimSpace(row.LastName))
	switch {
	case name != "":
		desc = fmt.Sprintf("New user %q will be created", strings.TrimSpace(name))
	case strings.TrimSpace(row.Email) != "":
		desc = fmt.Sprintf("New user with email %q will be created", strings.TrimSpace(row.Email))
	default:
		desc = fmt.Sprintf("New user %q will be created", strings.TrimSpace(row.Username))
	}
	if unmatchedID {
		desc += " (csv id not found in database)"
	}
	return desc
}

func appendInvalidField(fields []string, key string) []string {
	for _, f := range fields {
		if f == key {
			return fields
		}
	}
	return append(fields, key)
}
