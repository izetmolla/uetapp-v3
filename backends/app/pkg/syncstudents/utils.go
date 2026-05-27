package syncstudents

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

var importProgramSuffixParen = regexp.MustCompile(`\s*\([^)]*\)$`)

const athenaSPIDBatchSize = 50

func normalizeImportName(name string) string {
	return strings.TrimSpace(name)
}

func normalizeDocumentID(documentID string) string {
	return strings.TrimSpace(documentID)
}

func isValidDocumentID(documentID string) bool {
	documentID = normalizeDocumentID(documentID)
	return documentID != "" && documentIDRegex.MatchString(documentID)
}

func chunkStrings(items []string, size int) [][]string {
	if size <= 0 || len(items) == 0 {
		return nil
	}
	chunks := make([][]string, 0, (len(items)+size-1)/size)
	for i := 0; i < len(items); i += size {
		end := i + size
		if end > len(items) {
			end = len(items)
		}
		chunks = append(chunks, items[i:end])
	}
	return chunks
}

func athenaErrorFromBody(body map[string]any) string {
	if body == nil {
		return ""
	}
	if msg, ok := body["message"].(string); ok && msg != "" {
		if errVal, ok := body["error"].(string); ok && errVal != "" {
			return errVal + ": " + msg
		}
		return msg
	}
	if errVal, ok := body["error"].(string); ok {
		return errVal
	}
	return ""
}

func wrapAthenaResponseError(err error) error {
	if err == nil {
		return nil
	}
	msg := err.Error()
	if strings.Contains(msg, "invalid character") && strings.Contains(msg, "'<'") {
		return fmt.Errorf("%w (upstream returned HTML instead of JSON — often caused by a request that is too large; import uses batches of %d SP IDs)", err, athenaSPIDBatchSize)
	}
	return err
}

func dedupeAthenaUsersBySPID(users []AthenaUser) []AthenaUser {
	if len(users) <= 1 {
		return users
	}
	seen := make(map[string]struct{}, len(users))
	out := make([]AthenaUser, 0, len(users))
	for _, user := range users {
		key := normalizeImportName(user.SPID)
		if key == "" {
			out = append(out, user)
			continue
		}
		if _, ok := seen[key]; ok {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, user)
	}
	return out
}

func uniqueDocumentIDsFromUsers(users []AthenaUser) []string {
	seen := make(map[string]struct{})
	out := make([]string, 0)
	for _, user := range users {
		documentID := normalizeDocumentID(user.DocumentID)
		if !isValidDocumentID(documentID) {
			continue
		}
		if _, ok := seen[documentID]; ok {
			continue
		}
		seen[documentID] = struct{}{}
		out = append(out, documentID)
	}
	return out
}

// findStudentByDocumentID matches students by trimmed document_id (case insensitive).
func findStudentByDocumentID(db *gorm.DB, documentID string, dest *models.Student) error {
	documentID = normalizeDocumentID(documentID)
	if documentID == "" {
		return gorm.ErrRecordNotFound
	}
	return db.Unscoped().
		Where("LOWER(TRIM(document_id)) = LOWER(?)", documentID).
		First(dest).Error
}

func normalizeProgramImportName(name string) string {
	name = normalizeImportName(name)
	return normalizeImportName(importProgramSuffixParen.ReplaceAllString(name, ""))
}

// findEntityByImportName matches existing rows by normalized name (trim + case insensitive).
// Unscoped includes soft-deleted rows so imports reuse the same reference instead of inserting duplicates.
func findEntityByImportName(db *gorm.DB, name string, dest any) error {
	name = normalizeImportName(name)
	if name == "" {
		return gorm.ErrRecordNotFound
	}
	return db.Unscoped().
		Where("LOWER(TRIM(name)) = LOWER(?)", name).
		First(dest).Error
}

func optionalString(v any) string {
	if v == nil {
		return ""
	}
	switch val := v.(type) {
	case string:
		return val
	case float64:
		if val == float64(int64(val)) {
			return strconv.FormatInt(int64(val), 10)
		}
		return strconv.FormatFloat(val, 'f', -1, 64)
	case int:
		return strconv.Itoa(val)
	case int64:
		return strconv.FormatInt(val, 10)
	default:
		return fmt.Sprint(val)
	}
}

func optionalStringPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func academicEmailFromAthena(user AthenaUser) string {
	return strings.TrimSpace(user.EmailUET)
}

// academicEmailFromAthenaRecords returns the last non-empty email_uet in the batch.
func academicEmailFromAthenaRecords(records []AthenaUser) string {
	for i := len(records) - 1; i >= 0; i-- {
		if email := academicEmailFromAthena(records[i]); email != "" {
			return email
		}
	}
	return ""
}

func stringPtrChanged(current, next *string) bool {
	if next == nil {
		return false
	}
	if current == nil {
		return true
	}
	return *current != *next
}

func isUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "duplicate") ||
		strings.Contains(msg, "unique constraint") ||
		strings.Contains(msg, "unique index") ||
		strings.Contains(msg, "23505")
}

// extractHttpBodyRows supports upstream shapes:
//   - { "error": "..." }
//   - { "data": [ ... ] }
//   - { "response": { "data": [ ... ] } }
//   - { "response": "[{...}, ...]" } (JSON string)
func extractHttpBodyRows(body map[string]any) ([]any, error) {
	if data, ok := body["data"].([]any); ok {
		return data, nil
	}
	if errorMsg, ok := body["error"].(string); ok {
		return nil, fmt.Errorf("error: %s", errorMsg)
	}
	if dataMap, ok := body["data"].(map[string]any); ok && len(dataMap) > 0 {
		out := make([]any, 0, len(dataMap))
		for _, v := range dataMap {
			out = append(out, v)
		}
		return out, nil
	}
	if dataMapInt, ok := body["data"].(map[any]any); ok && len(dataMapInt) > 0 {
		out := make([]any, 0, len(dataMapInt))
		for _, v := range dataMapInt {
			out = append(out, v)
		}
		return out, nil
	}

	response := body["response"]
	if response == nil {
		return nil, nil
	}
	switch v := response.(type) {
	case map[string]any:
		if data, ok := v["data"].([]any); ok {
			return data, nil
		}
		if dataMap, ok := v["data"].(map[string]any); ok && len(dataMap) > 0 {
			out := make([]any, 0, len(dataMap))
			for _, value := range dataMap {
				out = append(out, value)
			}
			return out, nil
		}
		return nil, fmt.Errorf("response object has no data array")
	case []any:
		return v, nil
	case string:
		var inner any
		if err := json.Unmarshal([]byte(v), &inner); err != nil {
			return nil, fmt.Errorf("decode response string: %w", err)
		}
		switch parsed := inner.(type) {
		case []any:
			return parsed, nil
		case map[string]any:
			return extractHttpBodyRows(parsed)
		default:
			return nil, fmt.Errorf("decoded response string is not an array or object")
		}
	default:
		return nil, fmt.Errorf("response has unexpected type %T", response)
	}
}

func parseBodyRecords[T any](body map[string]any, mapRecord func(map[string]any) T) ([]T, error) {
	rows, err := extractHttpBodyRows(body)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}

	out := make([]T, 0, len(rows))
	for i, row := range rows {
		record, ok := row.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("data[%d] is not an object", i)
		}
		out = append(out, mapRecord(record))
	}
	return out, nil
}
