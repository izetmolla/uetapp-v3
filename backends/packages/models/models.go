package models

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"fmt"

	"gorm.io/gorm"
)

// ErrJSONBArrayMarshal is returned (wrapped) when a [JSONBArray] cannot be JSON-encoded for storage.
var ErrJSONBArrayMarshal = errors.New("jsonb array marshal")

func Models() []any {
	models := []any{

		// &Student{},
		// &Employe{},
		// &AcademicYear{},
		// &AcademicYear{},
		// &Department{},
		// &Resource{},
		// &Role{},

		// &StudentScanFolder{},
		// &StudentScanFolderDoc{},
		// &StudentScanFolderDocFile{},

		// &OrgUnit{},
		// &Theme{},
		// &Session{},
		// &User{},

		// &Role{},
		// &User{},
		// &Session{},
		// &Service{},
		// &ServiceNavigation{},
		// &Role{},

		// &Faculty{},
		// &FacultyStudyLevel{},
		&StudyLevel{},
		&Faculty{},
		&FacultyStudyLevel{},
		&StudyProgram{},
		&FacultyStudyProgram{},
		&StudyProfile{},
		&StudyProgramProfile{},
		&StudyProgramLevels{},
		// &StudyProgramLanguage{},
	}

	if len(models) > 0 {
		fmt.Println("Models Migrated: ", len(models))
	}

	return models
}

type Status string

const (
	StatusActive      Status = "active"
	StatusInactive    Status = "inactive"
	StatusDeleted     Status = "deleted"
	StatusArchived    Status = "archived"
	StatusDraft       Status = "draft"
	StatusPublished   Status = "published"
	StatusUnpublished Status = "unpublished"
	StatusPending     Status = "pending"
	StatusFailed      Status = "failed"
	StatusSuccess     Status = "success"
	StatusError       Status = "error"
	StatusWarning     Status = "warning"
	StatusInfo        Status = "info"
)

type EndpointType string

const (
	EndpointTypeHTTP    EndpointType = "http"
	EndpointTypeGraphQL EndpointType = "graphql"
	EndpointTypeWS      EndpointType = "ws"
)

type EndpointCategory string

const (
	EndpointCategoryWeb EndpointCategory = "web"
	EndpointCategoryAPI EndpointCategory = "api"
)

type EndpointOption string

const (
	EndpointOptionPath     EndpointOption = "path"
	EndpointOptionGroup    EndpointOption = "group"
	EndpointOptionUse      EndpointOption = "use"
	EndpointOptionFunction EndpointOption = "function"
)

type EndpointVisibility string

const (
	EndpointVisibilityPublic  EndpointVisibility = "public"
	EndpointVisibilityPrivate EndpointVisibility = "private"
)

type EndpointMethod string

const (
	EndpointMethodGET     EndpointMethod = "GET"
	EndpointMethodPOST    EndpointMethod = "POST"
	EndpointMethodPUT     EndpointMethod = "PUT"
	EndpointMethodPATCH   EndpointMethod = "PATCH"
	EndpointMethodDELETE  EndpointMethod = "DELETE"
	EndpointMethodOPTIONS EndpointMethod = "OPTIONS"
	EndpointMethodHEAD    EndpointMethod = "HEAD"
	EndpointMethodALL     EndpointMethod = "ALL"
)

// JSONBAny is a map of string keys to any values
// It is used to store arbitrary JSON data in a PostgreSQL jsonb column
// It is used to store arbitrary JSON data in a PostgreSQL jsonb column

type JSONBAny map[string]any

func (a JSONBAny) Value() (driver.Value, error) {
	if a == nil {
		return []byte("{}"), nil
	}
	return json.Marshal(a)
}

func (a *JSONBAny) Scan(value any) error {
	if value == nil {
		*a = JSONBAny{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("failed to scan JSONBAny: unsupported type %T", value)
	}
	if len(bytes) == 0 || string(bytes) == "null" {
		*a = JSONBAny{}
		return nil
	}
	var out map[string]interface{}
	if err := json.Unmarshal(bytes, &out); err != nil {
		return err
	}
	*a = JSONBAny(out)
	return nil
}
func (a JSONBAny) ToString() string {
	json, err := json.Marshal(a)
	if err != nil {
		fmt.Println("Error marshalling JSONBAny to string: ", err)
		return "{}"
	}
	return string(json)
}

// JSONBArray is a positional JSONB list used by [EntityRecord.Data]. Values
// are addressed by their [EntityAttribute.Position] index, so field names never
// repeat in storage.
type JSONBArray []any

func (a JSONBArray) Value() (any, error) {
	if a == nil {
		return []byte("[]"), nil
	}
	return json.Marshal(a)
}

func (a *JSONBArray) Scan(value any) error {
	if value == nil {
		*a = nil
		return nil
	}
	var raw []byte
	switch v := value.(type) {
	case []byte:
		raw = v
	case string:
		raw = []byte(v)
	default:
		return fmt.Errorf("invalid JSONBArray type %T", value)
	}
	if len(raw) == 0 {
		*a = JSONBArray{}
		return nil
	}
	return json.Unmarshal(raw, a)
}

func (a JSONBArray) ToString() string {
	json, err := json.Marshal(a)
	if err != nil {
		fmt.Println("Error marshalling JSONBArray to string: ", err)
		return "[]"
	}
	return string(json)
}

// JSONBArrayBytes returns JSON bytes for storing v in a PostgreSQL jsonb column.
// Use with GORM Update/Updates so the database gets the same encoding as encoding/json.
func JSONBArrayBytes(v JSONBArray) ([]byte, error) {
	return json.Marshal(v)
}

// UpdateJSONBArrayColumn runs db.Update(column, payload) after JSON-marshaling v.
// db must already be scoped (e.g. WithContext, Model, Where). Marshal failures wrap [ErrJSONBArrayMarshal]; GORM errors are returned unchanged.
func UpdateJSONBArrayColumn(db *gorm.DB, column string, v JSONBArray) error {
	payload, err := json.Marshal(v)
	if err != nil {
		return fmt.Errorf("%w for column %q: %v", ErrJSONBArrayMarshal, column, err)
	}
	return db.Update(column, payload).Error
}

// JSONBStringArray is a list of strings
// It is used to store a list of strings in a PostgreSQL jsonb column
type JSONBStringArray []string

func (a JSONBStringArray) Value() (driver.Value, error) {
	if a == nil {
		return []byte("[]"), nil
	}
	b, err := json.Marshal(a)
	if err != nil {
		return nil, err
	}
	return b, nil
}

func (a *JSONBStringArray) Scan(value any) error {
	if value == nil {
		*a = JSONBStringArray{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("failed to scan JSONBStringArray: unsupported type %T", value)
	}
	if len(bytes) == 0 || string(bytes) == "null" {
		*a = JSONBStringArray{}
		return nil
	}
	var out []string
	if err := json.Unmarshal(bytes, &out); err != nil {
		return err
	}
	*a = JSONBStringArray(out)
	return nil
}

func (a JSONBStringArray) ToString() string {
	json, err := json.Marshal(a)
	if err != nil {
		fmt.Println("Error marshalling JSONBStringArray to string: ", err)
		return "[]"
	}
	return string(json)
}

// JSONBStringMatrix is a matrix of strings
// It is used to store a matrix of strings in a PostgreSQL jsonb column
type JSONBStringMatrix [][]string

func (a JSONBStringMatrix) Value() (driver.Value, error) {
	if a == nil {
		return []byte("[]"), nil
	}
	b, err := json.Marshal(a)
	if err != nil {
		return nil, err
	}
	return b, nil
}

func (a *JSONBStringMatrix) Scan(value any) error {
	if value == nil {
		*a = JSONBStringMatrix{}
		return nil
	}
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return fmt.Errorf("failed to scan JSONBStringMatrix: unsupported type %T", value)
	}
	if len(bytes) == 0 || string(bytes) == "null" {
		*a = JSONBStringMatrix{}
		return nil
	}

	// Preferred format: [["column","operator","value"], ...]
	var matrix [][]string
	if err := json.Unmarshal(bytes, &matrix); err == nil {
		*a = JSONBStringMatrix(matrix)
		return nil
	}

	// Backward compatibility: ["raw condition 1", "raw condition 2"]
	var flat []string
	if err := json.Unmarshal(bytes, &flat); err == nil {
		out := make([][]string, 0, len(flat))
		for _, item := range flat {
			out = append(out, []string{item})
		}
		*a = JSONBStringMatrix(out)
		return nil
	}

	return fmt.Errorf("failed to scan JSONBStringMatrix: invalid json format")
}

func (a JSONBStringMatrix) ToString() string {
	json, err := json.Marshal(a)
	if err != nil {
		fmt.Println("Error marshalling JSONBStringMatrix to string: ", err)
		return "[]"
	}
	return string(json)
}
