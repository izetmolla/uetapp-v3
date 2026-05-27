package enroll

import (
	"encoding/csv"
	"encoding/json"
	"fmt"
	"io"
	"sort"
	"strings"

	"github.com/flowtrove/packages/models"
)

// csvTemplateColumns are the only columns imported into the users table.
var csvTemplateColumns = []string{
	"id",
	"first_name",
	"last_name",
	"email",
	"username",
	"password",
	"image",
	"status",
	"roles",
}

var userDBColumnSet map[string]struct{}

func init() {
	userDBColumnSet = make(map[string]struct{}, len(csvTemplateColumns))
	for _, c := range csvTemplateColumns {
		userDBColumnSet[c] = struct{}{}
	}
}

const csvTemplateContent = "id,first_name,last_name,email,username,password,image,status,roles\n"

type csvUserRow struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	Password  string `json:"password"`
	Image     string `json:"image"`
	Status    string `json:"status"`
	Roles     string `json:"roles"`
}

type parseCSVResult struct {
	Rows        []csvUserRow
	Columns     ColumnReport
	FileColumns []string // user-table columns present in the CSV header
}

func parseCSV(r io.Reader) (*parseCSVResult, error) {
	reader := csv.NewReader(r)
	reader.TrimLeadingSpace = true
	records, err := reader.ReadAll()
	if err != nil {
		return nil, fmt.Errorf("read csv: %w", err)
	}
	if len(records) == 0 {
		return nil, fmt.Errorf("csv file is empty")
	}

	header := normalizeCSVHeader(records[0])
	report := buildColumnReport(header)
	colIndex := mapKnownCSVColumns(header)

	rows := make([]csvUserRow, 0, len(records)-1)
	for i := 1; i < len(records); i++ {
		rec := records[i]
		if isEmptyCSVRecord(rec) {
			continue
		}
		row := csvUserRow{}
		for key, idx := range colIndex {
			val := ""
			if idx < len(rec) {
				val = strings.TrimSpace(rec[idx])
			}
			switch key {
			case "id":
				row.ID = val
			case "first_name":
				row.FirstName = val
			case "last_name":
				row.LastName = val
			case "email":
				row.Email = val
			case "username":
				row.Username = val
			case "password":
				row.Password = val
			case "image":
				row.Image = val
			case "status":
				row.Status = val
			case "roles":
				row.Roles = val
			}
		}
		rows = append(rows, row)
	}
	if len(rows) == 0 {
		return nil, fmt.Errorf("csv has no data rows")
	}
	if len(colIndex) == 0 {
		return nil, fmt.Errorf("csv has no columns that match the users table (%s)",
			strings.Join(csvTemplateColumns, ", "))
	}

	fileColumns := make([]string, 0, len(colIndex))
	for k := range colIndex {
		fileColumns = append(fileColumns, k)
	}
	sort.Strings(fileColumns)

	return &parseCSVResult{Rows: rows, Columns: report, FileColumns: fileColumns}, nil
}

func columnInFile(fileColumns []string, key string) bool {
	if len(fileColumns) == 0 {
		return true
	}
	for _, c := range fileColumns {
		if c == key {
			return true
		}
	}
	return false
}

func buildColumnReport(header []string) ColumnReport {
	seen := make(map[string]struct{})
	matched := make([]ColumnInfo, 0, len(header))
	unknown := make([]ColumnInfo, 0)

	for _, h := range header {
		if h == "" {
			continue
		}
		if _, dup := seen[h]; dup {
			unknown = append(unknown, ColumnInfo{
				Key:    h,
				Status: "unknown",
				Label:  h + " (duplicate header)",
			})
			continue
		}
		seen[h] = struct{}{}

		if _, ok := userDBColumnSet[h]; ok {
			matched = append(matched, ColumnInfo{
				Key:    h,
				Status: "matched",
				Label:  h,
			})
		} else {
			unknown = append(unknown, ColumnInfo{
				Key:    h,
				Status: "unknown",
				Label:  h,
			})
		}
	}

	missing := make([]ColumnInfo, 0)
	for _, want := range csvTemplateColumns {
		if _, ok := seen[want]; !ok {
			missing = append(missing, ColumnInfo{
				Key:    want,
				Status: "missing",
				Label:  want,
			})
		}
	}

	return ColumnReport{
		Matched: matched,
		Unknown: unknown,
		Missing: missing,
	}
}

func mapKnownCSVColumns(header []string) map[string]int {
	m := make(map[string]int)
	seen := make(map[string]struct{})
	for i, h := range header {
		if h == "" {
			continue
		}
		if _, ok := userDBColumnSet[h]; !ok {
			continue
		}
		if _, dup := seen[h]; dup {
			continue
		}
		seen[h] = struct{}{}
		m[h] = i
	}
	return m
}

func normalizeCSVHeader(header []string) []string {
	out := make([]string, len(header))
	for i, h := range header {
		out[i] = strings.ToLower(strings.TrimSpace(strings.TrimPrefix(h, "\ufeff")))
	}
	return out
}

func isEmptyCSVRecord(rec []string) bool {
	for _, v := range rec {
		if strings.TrimSpace(v) != "" {
			return false
		}
	}
	return true
}

func parseRoles(raw string) (models.JSONBArray, error) {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return models.JSONBArray{}, nil
	}
	if strings.HasPrefix(raw, "[") {
		var roles []string
		if err := json.Unmarshal([]byte(raw), &roles); err != nil {
			return nil, fmt.Errorf("roles must be a JSON array of strings")
		}
		out := make(models.JSONBArray, len(roles))
		for i, r := range roles {
			out[i] = strings.TrimSpace(r)
		}
		return out, nil
	}
	parts := strings.Split(raw, ",")
	out := make(models.JSONBArray, 0, len(parts))
	for _, p := range parts {
		p = strings.TrimSpace(p)
		if p != "" {
			out = append(out, p)
		}
	}
	return out, nil
}

func normalizeStatus(raw string) (models.UserStatus, error) {
	raw = strings.ToLower(strings.TrimSpace(raw))
	if raw == "" {
		return models.Active, nil
	}
	switch models.UserStatus(raw) {
	case models.Active, models.Inactive, models.Suspended:
		return models.UserStatus(raw), nil
	default:
		return "", fmt.Errorf("status must be active, inactive, or suspended")
	}
}

func fieldKeyFromError(err string) string {
	lower := strings.ToLower(err)
	switch {
	case strings.Contains(lower, "status"):
		return "status"
	case strings.Contains(lower, "roles"):
		return "roles"
	case strings.Contains(lower, "email"):
		return "email"
	case strings.Contains(lower, "username"):
		return "username"
	case strings.Contains(lower, "password"):
		return "password"
	case strings.Contains(lower, " id"):
		return "id"
	}
	return ""
}
