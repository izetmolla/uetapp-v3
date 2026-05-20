package globalsearch

import (
	"fmt"
	"strconv"
)

// Student is a trimmed view of an external student record for global search (not every API field).
type Student struct {
	PersonID         string `json:"person_id"`
	StudentFID       string `json:"student_fid"`
	Firstname        string `json:"firstname"`
	Surname          string `json:"surname"`
	Fathersname      string `json:"fathersname,omitempty"`
	EmailUET         string `json:"email_uet,omitempty"`
	Email            string `json:"email,omitempty"`
	Faculty          string `json:"faculty,omitempty"`
	Department       string `json:"department,omitempty"`
	Program          string `json:"program,omitempty"`
	ProgramSpecialty string `json:"program_specialty,omitempty"`
	StudyLevel       string `json:"study_level,omitempty"`
	Status           string `json:"status,omitempty"`
	StatusType       string `json:"status_type,omitempty"`
	DocumentID       string `json:"document_id,omitempty"`
}

// StudentsSearchMeta holds pagination from the upstream student API.
type StudentsSearchMeta struct {
	Page       int `json:"page"`
	PerPage    int `json:"perpage"`
	TotalPages int `json:"total_pages"`
	TotalRows  int `json:"total_rows"`
}

// parseStudentsSearchBody maps the upstream { data, page, perpage, ... } body into typed results.
// Returns empty slices on missing or unexpected shapes instead of panicking.
func parseStudentsSearchBody(body any) ([]Student, StudentsSearchMeta) {
	root, ok := body.(map[string]any)
	if !ok {
		return nil, StudentsSearchMeta{}
	}

	meta := StudentsSearchMeta{
		Page:       optionalInt(root["page"]),
		PerPage:    optionalInt(root["perpage"]),
		TotalPages: optionalInt(root["total_pages"]),
		TotalRows:  optionalInt(root["total_rows"]),
	}

	raw, ok := root["data"]
	if !ok || raw == nil {
		return nil, meta
	}

	rows, ok := raw.([]any)
	if !ok {
		return nil, meta
	}

	students := make([]Student, 0, len(rows))
	for _, row := range rows {
		record, ok := row.(map[string]any)
		if !ok {
			continue
		}
		students = append(students, studentFromRecord(record))
	}
	return students, meta
}

func studentFromRecord(record map[string]any) Student {
	return Student{
		PersonID:         optionalString(record["person_id"]),
		StudentFID:       optionalString(record["student_fid"]),
		Firstname:        optionalString(record["firstname"]),
		Surname:          optionalString(record["surname"]),
		Fathersname:      optionalString(record["fathersname"]),
		EmailUET:         optionalString(record["email_uet"]),
		Email:            optionalString(record["email"]),
		Faculty:          optionalString(record["faculty"]),
		Department:       optionalString(record["department"]),
		Program:          optionalString(record["program"]),
		ProgramSpecialty: optionalString(record["program_specialty"]),
		StudyLevel:       optionalString(record["study_level"]),
		Status:           optionalString(record["status"]),
		StatusType:       optionalString(record["status_type"]),
		DocumentID:       optionalString(record["document_id"]),
	}
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

func optionalInt(v any) int {
	if v == nil {
		return 0
	}
	switch val := v.(type) {
	case float64:
		return int(val)
	case int:
		return val
	case int64:
		return int(val)
	default:
		return 0
	}
}
