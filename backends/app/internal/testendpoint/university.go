package testendpoint

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

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
	faculties, err := cc.getFaculties(reqCtx, orgUnits, studyLevels)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}
	studyPrograms, err := cc.getStudyPrograms(reqCtx, orgUnits)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(fiber.Map{
		// "org_units": orgUnits,
		"study_levels":  studyLevels,
		"study_programs": studyPrograms,
		"faculties":     faculties,
	}))
}

func (cc *Controller) getStudyLevels(reqCtx context.Context, orgUnits []UniversityOrgUnitType) ([]models.StudyLevel, error) {
	seen := make(map[int64]struct{})
	studyLevels := make([]models.StudyLevel, 0)
	for _, orgUnit := range orgUnits {
		name := strings.TrimSpace(orgUnit.StudyLevel)
		if name == "" {
			continue
		}
		studyLevel, err := cc.getOrCreateStudyLevel(reqCtx, name)
		if err != nil {
			return []models.StudyLevel{}, err
		}
		if _, exists := seen[studyLevel.ID]; exists {
			continue
		}
		seen[studyLevel.ID] = struct{}{}
		studyLevels = append(studyLevels, studyLevel)
	}
	return studyLevels, nil
}

func (cc *Controller) getFaculties(ctx context.Context, orgUnits []UniversityOrgUnitType, studyLevels []models.StudyLevel) ([]models.Faculty, error) {
	studyLevelByName := make(map[string]models.StudyLevel, len(studyLevels))
	for _, level := range studyLevels {
		studyLevelByName[strings.TrimSpace(level.Name)] = level
	}

	facultyByID := make(map[int64]models.Faculty)
	facultyOrder := make([]int64, 0)
	seenLevelPairs := make(map[string]struct{})
	seenProgramPairs := make(map[string]struct{})

	for _, orgUnit := range orgUnits {
		facultyName := strings.TrimSpace(orgUnit.Faculty)
		if facultyName == "" {
			continue
		}

		faculty, err := cc.getOrCreateFaculty(ctx, facultyName)
		if err != nil {
			return []models.Faculty{}, err
		}

		if _, exists := facultyByID[faculty.ID]; !exists {
			faculty.StudyLevels = []models.FacultyStudyLevel{}
			faculty.StudyPrograms = []models.FacultyStudyProgram{}
			facultyByID[faculty.ID] = faculty
			facultyOrder = append(facultyOrder, faculty.ID)
		}

		entry := facultyByID[faculty.ID]

		studyLevelName := strings.TrimSpace(orgUnit.StudyLevel)
		if studyLevelName != "" {
			studyLevel, ok := studyLevelByName[studyLevelName]
			if !ok {
				studyLevel, err = cc.getOrCreateStudyLevel(ctx, studyLevelName)
				if err != nil {
					return []models.Faculty{}, err
				}
				studyLevelByName[studyLevelName] = studyLevel
			}

			levelPairKey := fmt.Sprintf("level:%d:%d", faculty.ID, studyLevel.ID)
			if _, exists := seenLevelPairs[levelPairKey]; !exists {
				seenLevelPairs[levelPairKey] = struct{}{}

				facultyStudyLevel, err := cc.getOrCreateFacultyStudyLevel(ctx, faculty.ID, studyLevel.ID)
				if err != nil {
					return []models.Faculty{}, err
				}
				facultyStudyLevel.StudyLevel = studyLevel
				entry.StudyLevels = append(entry.StudyLevels, facultyStudyLevel)
			}
		}

		programName := strings.TrimSpace(orgUnit.Program)
		if programName != "" {
			studyProgram, err := cc.getOrCreateStudyProgram(ctx, programName)
			if err != nil {
				return []models.Faculty{}, err
			}

			programPairKey := fmt.Sprintf("program:%d:%d", faculty.ID, studyProgram.ID)
			if _, exists := seenProgramPairs[programPairKey]; !exists {
				seenProgramPairs[programPairKey] = struct{}{}

				facultyStudyProgram, err := cc.getOrCreateFacultyStudyProgram(ctx, faculty.ID, studyProgram.ID)
				if err != nil {
					return []models.Faculty{}, err
				}
				facultyStudyProgram.StudyProgram = studyProgram
				entry.StudyPrograms = append(entry.StudyPrograms, facultyStudyProgram)
			}
		}

		facultyByID[faculty.ID] = entry
	}

	faculties := make([]models.Faculty, 0, len(facultyOrder))
	for _, id := range facultyOrder {
		faculties = append(faculties, facultyByID[id])
	}
	return faculties, nil
}
func (cc *Controller) getStudyPrograms(ctx context.Context, orgUnits []UniversityOrgUnitType) ([]models.StudyProgram, error) {
	programByID := make(map[int64]models.StudyProgram)
	programOrder := make([]int64, 0)
	seenPairs := make(map[string]struct{})

	for _, orgUnit := range orgUnits {
		facultyName := strings.TrimSpace(orgUnit.Faculty)
		programName := strings.TrimSpace(orgUnit.Program)
		if facultyName == "" || programName == "" {
			continue
		}

		faculty, err := cc.getOrCreateFaculty(ctx, facultyName)
		if err != nil {
			return []models.StudyProgram{}, err
		}

		studyProgram, err := cc.getOrCreateStudyProgram(ctx, programName)
		if err != nil {
			return []models.StudyProgram{}, err
		}

		pairKey := fmt.Sprintf("program:%d:%d", faculty.ID, studyProgram.ID)
		if _, exists := seenPairs[pairKey]; exists {
			continue
		}
		seenPairs[pairKey] = struct{}{}

		facultyStudyProgram, err := cc.getOrCreateFacultyStudyProgram(ctx, faculty.ID, studyProgram.ID)
		if err != nil {
			return []models.StudyProgram{}, err
		}
		facultyStudyProgram.Faculty = faculty

		if _, exists := programByID[studyProgram.ID]; !exists {
			studyProgram.Faculties = []models.FacultyStudyProgram{}
			programByID[studyProgram.ID] = studyProgram
			programOrder = append(programOrder, studyProgram.ID)
		}

		entry := programByID[studyProgram.ID]
		entry.Faculties = append(entry.Faculties, facultyStudyProgram)
		programByID[studyProgram.ID] = entry
	}

	studyPrograms := make([]models.StudyProgram, 0, len(programOrder))
	for _, id := range programOrder {
		studyPrograms = append(studyPrograms, programByID[id])
	}
	return studyPrograms, nil
}

func (cc *Controller) getOrCreateStudyLevel(ctx context.Context, name string) (models.StudyLevel, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return models.StudyLevel{}, fmt.Errorf("study level name is empty")
	}
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
	name = strings.TrimSpace(name)
	if name == "" {
		return models.Faculty{}, fmt.Errorf("faculty name is empty")
	}
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

func (cc *Controller) getOrCreateFacultyStudyLevel(ctx context.Context, facultyID int64, studyLevelID int64) (models.FacultyStudyLevel, error) {
	db := cc.app.Postgres()
	facultyStudyLevel, err := gorm.G[models.FacultyStudyLevel](db).
		Where(&models.FacultyStudyLevel{FacultyID: facultyID, StudyLevelID: studyLevelID}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			facultyStudyLevel = models.FacultyStudyLevel{FacultyID: facultyID, StudyLevelID: studyLevelID}
			if err := db.Create(&facultyStudyLevel).Error; err != nil {
				return models.FacultyStudyLevel{}, err
			}
		} else {
			return models.FacultyStudyLevel{}, err
		}
	}
	return facultyStudyLevel, nil
}

func (cc *Controller) getOrCreateFacultyStudyProgram(ctx context.Context, facultyID int64, studyProgramID int64) (models.FacultyStudyProgram, error) {
	db := cc.app.Postgres()
	facultyStudyProgram, err := gorm.G[models.FacultyStudyProgram](db).
		Where(&models.FacultyStudyProgram{FacultyID: facultyID, StudyProgramID: studyProgramID}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			facultyStudyProgram = models.FacultyStudyProgram{FacultyID: facultyID, StudyProgramID: studyProgramID}
			if err := db.Create(&facultyStudyProgram).Error; err != nil {
				return models.FacultyStudyProgram{}, err
			}
		} else {
			return models.FacultyStudyProgram{}, err
		}
	}
	return facultyStudyProgram, nil
}

func (cc *Controller) getOrCreateStudyProgram(ctx context.Context, name string) (models.StudyProgram, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return models.StudyProgram{}, fmt.Errorf("study program name is empty")
	}
	db := cc.app.Postgres()
	studyProgram, err := gorm.G[models.StudyProgram](db).
		Where(&models.StudyProgram{Name: name}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyProgram = models.StudyProgram{Name: name, Slug: slug.Make(name)}
			if err := db.Create(&studyProgram).Error; err != nil {
				return models.StudyProgram{}, err
			}
		} else {
			return models.StudyProgram{}, err
		}
	}
	return studyProgram, nil
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
