package students

import (
	"sort"
	"strings"

	"github.com/flowtrove/packages/datatable"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
)

func queryMockStudents(c fiber.Ctx, columns []datatable.Column) ([]map[string]any, datatable.Pagination, error) {
	q, err := tablequery.Extract(c, columns)
	if err != nil {
		return nil, datatable.Pagination{}, err
	}

	all := sortMockStudents(mockStudentsData(), q.Sorts)
	all = filterMockStudents(all, q.Filters, q.JoinOperator)

	total := len(all)
	page := q.Page
	if page < 1 {
		page = 1
	}
	limit := q.PageSize
	if limit < 1 {
		limit = 10
	}

	totalPages := 0
	if limit > 0 && total > 0 {
		totalPages = (total + limit - 1) / limit
	}

	start := (page - 1) * limit
	if start > total {
		start = total
	}
	end := start + limit
	if end > total {
		end = total
	}

	pageRows := make([]map[string]any, end-start)
	copy(pageRows, all[start:end])

	return pageRows, datatable.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      int64(total),
		TotalPages: totalPages,
		PageCount:  int64(len(pageRows)),
	}, nil
}

func filterMockStudents(students []map[string]any, filters []datatable.Filter, joinOp string) []map[string]any {
	if len(filters) == 0 {
		return students
	}

	filtered := make([]map[string]any, 0, len(students))
	for _, row := range students {
		if matchMockRow(row, filters, joinOp) {
			filtered = append(filtered, row)
		}
	}
	return filtered
}

func sortMockStudents(students []map[string]any, sorts []datatable.Sort) []map[string]any {
	out := make([]map[string]any, len(students))
	copy(out, students)

	if len(sorts) == 0 {
		sort.SliceStable(out, func(i, j int) bool {
			return stringValue(out[i]["graduated_at"]) > stringValue(out[j]["graduated_at"])
		})
		return out
	}

	sort.SliceStable(out, func(i, j int) bool {
		for _, s := range sorts {
			key := s.ID
			if key == "faculties" {
				key = "faculty_id"
			}
			if key == "study_program" {
				key = "study_program_id"
			}
			if key == "study_profile" {
				key = "study_profile_id"
			}

			a := stringValue(out[i][key])
			b := stringValue(out[j][key])
			if a == b {
				continue
			}
			if s.Desc {
				return a > b
			}
			return a < b
		}
		return false
	})

	return out
}

func matchMockRow(row map[string]any, filters []datatable.Filter, joinOp string) bool {
	if len(filters) == 0 {
		return true
	}

	useOr := strings.EqualFold(joinOp, "or")
	matched := !useOr

	for _, f := range filters {
		ok := matchMockFilter(row, f)
		if useOr {
			matched = matched || ok
			if matched {
				return true
			}
		} else {
			matched = matched && ok
			if !matched {
				return false
			}
		}
	}

	return matched
}

func matchMockFilter(row map[string]any, f datatable.Filter) bool {
	key := f.ID
	if key == "faculties" {
		key = "faculty_id"
	}
	if key == "study_program" {
		key = "study_program_id"
	}
	if key == "study_profile" {
		key = "study_profile_id"
	}

	raw := row[key]
	if key == "full_name" && f.Value != "" {
		raw = row["full_name"]
		if raw == nil {
			raw = row["first_name"]
		}
	}

	cell := stringValue(raw)

	values := f.Values
	if len(values) == 0 && f.Value != "" {
		values = []string{f.Value}
	}

	op := strings.ToLower(f.Operator)
	if op == "" {
		if len(values) > 1 {
			op = "inarray"
		} else if f.Variant == "text" || key == "full_name" {
			op = "ilike"
		} else {
			op = "eq"
		}
	}

	switch op {
	case "inarray", "in", "eq", "==", "=":
		for _, v := range values {
			if cell == v {
				return true
			}
		}
		return len(values) == 0
	case "ilike":
		needle := strings.ToLower(f.Value)
		fullName := strings.ToLower(stringValue(row["full_name"]))
		code := strings.ToLower(stringValue(row["student_code"]))
		return strings.Contains(strings.ToLower(cell), needle) ||
			strings.Contains(fullName, needle) ||
			strings.Contains(code, needle)
	default:
		needle := strings.ToLower(f.Value)
		return strings.Contains(strings.ToLower(cell), needle)
	}
}

func stringValue(v any) string {
	if v == nil {
		return ""
	}
	switch val := v.(type) {
	case string:
		return val
	default:
		return ""
	}
}
