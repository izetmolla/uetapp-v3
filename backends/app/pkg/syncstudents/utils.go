package syncstudents

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strconv"
	"strings"
)

var importProgramSuffixParen = regexp.MustCompile(`\s*\([^)]*\)$`)

// normalizeImportName trims leading/trailing whitespace from reference labels.
func normalizeImportName(name string) string {
	return strings.TrimSpace(name)
}

// normalizeProgramImportName strips a trailing parenthetical suffix then trims.
func normalizeProgramImportName(name string) string {
	return normalizeImportName(importProgramSuffixParen.ReplaceAllString(name, ""))
}

type UniversityOrgUnitType struct {
	ProgramOldId     string `json:"program_old_id"`
	Program          string `json:"program"`
	Profile          string `json:"profile"`
	Faculty          string `json:"faculty"`
	StudyLevel       string `json:"study_level"`
	ProgramID        string `json:"program_id"`
	ProgramName      string `json:"program_name"`
	ProgramSpecialty string `json:"program_specialty"`
}

// Helpers Functions
func parseUniversityOrgUnit(body map[string]any) ([]UniversityOrgUnitType, error) {
	rows, err := extractHttpBodyRows(body)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}

	out := make([]UniversityOrgUnitType, 0, len(rows))
	for i, row := range rows {
		record, ok := row.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("data[%d] is not an object", i)
		}
		out = append(out, orgUnitFromRecord(record))
	}
	return out, nil
}

// extractOrgUnitRows supports the upstream shapes we have seen:
//   - { "error": "..."}
//   - { "data": [ ... ] }                          (getOrgUnits HTTP body)
//   - { "response": { "data": [ ... ] } }          (wrapped client payloads)
//   - { "response": "[{\"faculty\":...}, ...]" }   (JSON string response)
func extractHttpBodyRows(body map[string]any) ([]any, error) {
	// Support direct array
	if data, ok := body["data"].([]any); ok {
		return data, nil
	}
	// Support direct error
	if errorMsg, ok := body["error"].(string); ok {
		return nil, fmt.Errorf("error: %s", errorMsg)
	}
	// Sometimes, Moodle returns students as a map[int|string]map[string]any instead of []any.
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
	// Look for nested response shapes
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

func orgUnitFromRecord(record map[string]any) UniversityOrgUnitType {
	return UniversityOrgUnitType{
		ProgramOldId:     optionalString(record["program_old_id"]),
		Program:          normalizeProgramImportName(optionalString(record["program"])),
		Profile:          normalizeImportName(optionalString(record["profile"])),
		Faculty:          normalizeImportName(optionalString(record["faculty"])),
		StudyLevel:       normalizeImportName(optionalString(record["study_level"])),
		ProgramID:        optionalString(record["program_id"]),
		ProgramName:      normalizeProgramImportName(optionalString(record["program_name"])),
		ProgramSpecialty: normalizeProgramImportName(optionalString(record["program_specialty"])),
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
