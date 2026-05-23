package testendpoint

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"

	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

type UniversityOrgUnitType struct {
	ProgramOldId string `json:"program_old_id"`
	Program      string `json:"program"`
	Profile      string `json:"profile"`
	Faculty      string `json:"faculty"`
	StudyLevel   string `json:"study_level"`
}

func (cc *Controller) GetUniversityUnit(c fiber.Ctx) error {
	reqCtx := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()
	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(reqCtx)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	res, err := httprequest.Execute[map[string]any](httprequest.New(&httprequest.HttpRequestDriver{
		Url:    resource.Config["url"].(string),
		Method: resource.Config["method"].(string),
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"Authorization": "Bearer " + resource.Config["authorization"].(string),
		},
		// Body: map[string]any{
		// 	"action": "getStudent",
		// },
		Params: map[string]string{
			"action": "getOrgUnits",
		},
	}))
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	orgUnits, err := parseUniversityOrgUnit(res.Body)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	studyLevels, err := cc.getStudyLevels(reqCtx, orgUnits)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}
	faculties, err := cc.getFaculties(reqCtx, orgUnits)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(fiber.Map{
		// "org_units": orgUnits,
		"study_levels": studyLevels,
		"faculties":    faculties,
	}))
}

func (cc *Controller) getStudyLevels(reqCtx context.Context, orgUnits []UniversityOrgUnitType) ([]models.StudyLevel, error) {
	seen := make(map[string]struct{})
	studyLevels := make([]models.StudyLevel, 0)
	for _, orgUnit := range orgUnits {
		name := orgUnit.StudyLevel
		if _, exists := seen[name]; exists {
			continue
		}
		seen[name] = struct{}{}
		studyLevel, err := cc.getOrCreateStudyLevel(reqCtx, name)
		if err != nil {
			return []models.StudyLevel{}, err
		}
		studyLevels = append(studyLevels, studyLevel)

	}
	return studyLevels, nil
}

func (cc *Controller) getFaculties(ctx context.Context, orgUnits []UniversityOrgUnitType) ([]models.Faculty, error) {
	seen := make(map[string]struct{})
	faculties := make([]models.Faculty, 0)
	for _, orgUnit := range orgUnits {
		name := orgUnit.Faculty
		if _, exists := seen[name]; exists {
			continue
		}
		seen[name] = struct{}{}
		faculty, err := cc.getOrCreateFaculty(ctx, name)
		if err != nil {
			return []models.Faculty{}, err
		}
		faculties = append(faculties, faculty)

	}
	return faculties, nil
}

// Database Functions
func (cc *Controller) getOrCreateStudyLevel(ctx context.Context, name string) (models.StudyLevel, error) {
	db := cc.app.Postgres()
	studyLevel, err := gorm.G[models.StudyLevel](db).
		Where(&models.StudyLevel{Name: name}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyLevel = models.StudyLevel{Name: name, Slug: slug.Make(name)}
			if err := db.Create(&studyLevel).Error; err != nil {
				return models.StudyLevel{}, err
			}
		} else {
			return models.StudyLevel{}, err
		}
	}

	return studyLevel, nil
}

func (cc *Controller) getOrCreateFaculty(ctx context.Context, name string) (models.Faculty, error) {
	db := cc.app.Postgres()
	faculty, err := gorm.G[models.Faculty](db).
		Where(&models.Faculty{Name: name}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			faculty = models.Faculty{Name: name, Slug: slug.Make(name)}
			if err := db.Create(&faculty).Error; err != nil {
				return models.Faculty{}, err
			}
		} else {
			return models.Faculty{}, err
		}
	}
	return faculty, nil
}

// Helpers Functions
func parseUniversityOrgUnit(body map[string]any) ([]UniversityOrgUnitType, error) {
	rows, err := extractOrgUnitRows(body)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return []UniversityOrgUnitType{}, nil
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
//   - { "data": [ ... ] }                          (getOrgUnits HTTP body)
//   - { "response": { "data": [ ... ] } }          (wrapped client payloads)
//   - { "response": "[{\"faculty\":...}, ...]" }   (JSON string response)
func extractOrgUnitRows(body map[string]any) ([]any, error) {
	if data, ok := body["data"].([]any); ok {
		return data, nil
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
			return extractOrgUnitRows(parsed)
		default:
			return nil, fmt.Errorf("decoded response string is not an array or object")
		}
	default:
		return nil, fmt.Errorf("response has unexpected type %T", response)
	}
}

func orgUnitFromRecord(record map[string]any) UniversityOrgUnitType {
	return UniversityOrgUnitType{
		ProgramOldId: optionalString(record["program_old_id"]),
		Program:      optionalString(record["program"]),
		Profile:      optionalString(record["profile"]),
		Faculty:      optionalString(record["faculty"]),
		StudyLevel:   optionalString(record["study_level"]),
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
