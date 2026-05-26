package globalsearch

import (
	"context"
	"fmt"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

// SearchStudentItem is the JSON shape returned to the frontend global search API.
type SearchStudentItem struct {
	ID        string `json:"id"`
	FullName  string `json:"full_name"`
	URL       string `json:"url"`
	IsCreated bool   `json:"is_created"`
	Student
}

// SearchEmployeeItem is the JSON shape returned to the frontend global search API.
type SearchEmployeeItem struct {
	ID         string `json:"id"`
	FullName   string `json:"full_name"`
	Email      string `json:"email"`
	Department string `json:"department"`
}

func (cc *Controller) formatStudentsForSearch(ctx context.Context, students []Student) ([]SearchStudentItem, error) {
	out := make([]SearchStudentItem, 0, len(students))
	for _, s := range students {

		item := SearchStudentItem{
			ID:       studentSearchID(s),
			FullName: studentFullName(s),
			Student:  s,
			URL:      fmt.Sprintf("/contracts/students/%s", s.SPID),
		}
		if s.DocumentID != "" {
			student, err := cc.getOrCreateStudent(ctx, s)
			if err != nil {
				return nil, err
			}
			item.URL = fmt.Sprintf("/contracts/students/%d", student.ID)
			item.IsCreated = true
		}
		item.Email = studentEmail(s)
		out = append(out, item)
	}
	return out, nil
}

func studentSearchID(s Student) string {
	if s.SPID != "" {
		return s.DocumentID
	}
	return s.SPID
}

func studentFullName(s Student) string {
	parts := make([]string, 0, 3)
	for _, p := range []string{s.Firstname, s.Fathersname, s.Surname} {
		if strings.TrimSpace(p) != "" {
			parts = append(parts, strings.TrimSpace(p))
		}
	}
	return strings.Join(parts, " ")
}

func studentEmail(s Student) string {
	if s.EmailUET != "" {
		return s.EmailUET
	}
	return s.Email
}

// Student is a trimmed view of an external student record for global search (not every API field).
type Student struct {
	StudentFID       string `json:"student_fid"`
	SPID             string `json:"sp_id"`
	PersonID         string `json:"person_id"`
	Status           string `json:"status"`
	StatusType       string `json:"status_type"`
	Surname          string `json:"surname"`
	Firstname        string `json:"firstname"`
	Fathersname      string `json:"fathersname"`
	Phone            string `json:"phone"`
	Mobile           string `json:"mobile"`
	Email            string `json:"email"`
	EmailUET         string `json:"email_uet"`
	DocumentID       string `json:"document_id"`
	DocumentType     string `json:"document_type"`
	Department       string `json:"department"`
	ProgramID        string `json:"program_id"`
	Program          string `json:"program"`
	ProgramSpecialty string `json:"program_specialty"`
	RegDate          string `json:"reg_date"`
	RegYear          string `json:"reg_year"`
	Faculty          string `json:"faculty"`
	StudyLevel       string `json:"study_level"`
	Nationality      string `json:"nationality"`
	NatCode          string `json:"nat_code"`
	City             string `json:"city"`
	Address          string `json:"address"`
	Lastsyncdate     string `json:"lastsyncdate"`
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
		StudentFID:       optionalString(record["student_fid"]),
		SPID:             optionalString(record["sp_id"]),
		PersonID:         optionalString(record["person_id"]),
		Status:           optionalString(record["status"]),
		StatusType:       optionalString(record["status_type"]),
		Surname:          optionalString(record["surname"]),
		Firstname:        optionalString(record["firstname"]),
		Fathersname:      optionalString(record["fathersname"]),
		Phone:            optionalString(record["phone"]),
		Mobile:           optionalString(record["mobile"]),
		Email:            optionalString(record["email"]),
		EmailUET:         optionalString(record["email_uet"]),
		DocumentID:       optionalString(record["document_id"]),
		DocumentType:     optionalString(record["document_type"]),
		Department:       optionalString(record["department"]),
		ProgramID:        optionalString(record["program_id"]),
		Program:          optionalString(record["program"]),
		ProgramSpecialty: optionalString(record["program_specialty"]),
		RegDate:          optionalString(record["reg_date"]),
		RegYear:          optionalString(record["reg_year"]),
		Faculty:          optionalString(record["faculty"]),
		StudyLevel:       optionalString(record["study_level"]),
		Nationality:      optionalString(record["nationality"]),
		NatCode:          optionalString(record["nat_code"]),
		City:             optionalString(record["city"]),
		Address:          optionalString(record["address"]),
		Lastsyncdate:     optionalString(record["lastsyncdate"]),
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

func studentDocumentIds(students []Student) []string {
	ids := make([]string, 0, len(students))
	for _, s := range students {
		ids = append(ids, s.DocumentID)
	}
	return ids
}
func (cc *Controller) getStudentsFromDB(ctx context.Context, documentIds []string) ([]models.Student, error) {
	db := cc.app.Postgres()
	return gorm.G[models.Student](db).Where("document_id IN (?)", documentIds).
		Select("id", "document_id").
		Find(ctx)
}
