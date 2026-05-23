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

type UniversitySyncResult struct {
	StudyLevels   []models.StudyLevel
	Faculties     []models.Faculty
	StudyPrograms []models.StudyProgram
	StudyProfiles []models.StudyProfile
}

type UniversityOrgUnitType struct {
	ProgramOldId string `json:"program_old_id"`
	Program      string `json:"program"`
	Profile      string `json:"profile"`
	Faculty      string `json:"faculty"`
	StudyLevel   string `json:"study_level"`
}

func (cc *Controller) GetUniversityUnit(c fiber.Ctx) error {
	reqCtx := c.Context()
	r := cc.app.Render()

	orgUnits, err := fetchUniversityOrgUnits(reqCtx, cc.app.Postgres(), 3)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	result, err := cc.syncUniversityOrgUnits(reqCtx, orgUnits)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	return cc.app.Api(c, cc.app.Render().WithData(fiber.Map{
		"study_levels":   result.StudyLevels,
		"study_programs": result.StudyPrograms,
		"study_profiles": result.StudyProfiles,
		"faculties":      result.Faculties,
	}))
}

func fetchUniversityOrgUnits(ctx context.Context, db *gorm.DB, resourceID int64) ([]UniversityOrgUnitType, error) {
	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", resourceID).
		First(ctx)
	if err != nil {
		return nil, err
	}

	res, err := httprequest.Execute[map[string]any](httprequest.New(&httprequest.HttpRequestDriver{
		Url:    resource.Config["url"].(string),
		Method: resource.Config["method"].(string),
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"Authorization": "Bearer " + resource.Config["authorization"].(string),
		},
		Params: map[string]string{
			"action": "getOrgUnits",
		},
	}))
	if err != nil {
		return nil, err
	}

	return parseUniversityOrgUnit(res.Body)
}

func (cc *Controller) syncUniversityOrgUnits(ctx context.Context, orgUnits []UniversityOrgUnitType) (UniversitySyncResult, error) {
	studyLevels, err := cc.getStudyLevels(ctx, orgUnits)
	if err != nil {
		return UniversitySyncResult{}, err
	}
	faculties, err := cc.getFaculties(ctx, orgUnits, studyLevels)
	if err != nil {
		return UniversitySyncResult{}, err
	}
	studyPrograms, err := cc.getStudyPrograms(ctx, orgUnits, studyLevels)
	if err != nil {
		return UniversitySyncResult{}, err
	}
	studyProfiles, err := cc.getStudyProfiles(ctx, orgUnits)
	if err != nil {
		return UniversitySyncResult{}, err
	}
	return UniversitySyncResult{
		StudyLevels:   studyLevels,
		Faculties:     faculties,
		StudyPrograms: studyPrograms,
		StudyProfiles: studyProfiles,
	}, nil
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

func (cc *Controller) getStudyProfiles(ctx context.Context, orgUnits []UniversityOrgUnitType) ([]models.StudyProfile, error) {
	seen := make(map[int64]struct{})
	studyProfiles := make([]models.StudyProfile, 0)
	for _, orgUnit := range orgUnits {
		name := strings.TrimSpace(orgUnit.Profile)
		if name == "" {
			continue
		}
		studyProfile, err := cc.getOrCreateStudyProfile(ctx, name)
		if err != nil {
			return []models.StudyProfile{}, err
		}
		if _, exists := seen[studyProfile.ID]; exists {
			continue
		}
		seen[studyProfile.ID] = struct{}{}
		studyProfiles = append(studyProfiles, studyProfile)
	}
	return studyProfiles, nil
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
func (cc *Controller) getStudyPrograms(ctx context.Context, orgUnits []UniversityOrgUnitType, studyLevels []models.StudyLevel) ([]models.StudyProgram, error) {
	studyLevelByName := make(map[string]models.StudyLevel, len(studyLevels))
	for _, level := range studyLevels {
		studyLevelByName[strings.TrimSpace(level.Name)] = level
	}

	programByID := make(map[int64]models.StudyProgram)
	programOrder := make([]int64, 0)
	seenFacultyProgramPairs := make(map[string]struct{})
	seenProgramLevelPairs := make(map[string]struct{})
	seenProgramProfilePairs := make(map[string]struct{})

	for _, orgUnit := range orgUnits {
		programName := strings.TrimSpace(orgUnit.Program)
		studyLevelName := strings.TrimSpace(orgUnit.StudyLevel)
		profileName := strings.TrimSpace(orgUnit.Profile)

		if programName != "" && profileName != "" {
			studyProgram, err := cc.getOrCreateStudyProgram(ctx, programName)
			if err != nil {
				return []models.StudyProgram{}, err
			}

			studyProfile, err := cc.getOrCreateStudyProfile(ctx, profileName)
			if err != nil {
				return []models.StudyProgram{}, err
			}

			profilePairKey := fmt.Sprintf("program-profile:%d:%d", studyProgram.ID, studyProfile.ID)
			if _, exists := seenProgramProfilePairs[profilePairKey]; !exists {
				seenProgramProfilePairs[profilePairKey] = struct{}{}

				studyProgramProfile, err := cc.getOrCreateStudyProgramProfile(ctx, studyProgram.ID, studyProfile.ID)
				if err != nil {
					return []models.StudyProgram{}, err
				}
				studyProgramProfile.StudyProfile = studyProfile

				if _, exists := programByID[studyProgram.ID]; !exists {
					studyProgram.Faculties = []models.FacultyStudyProgram{}
					studyProgram.StudyLevels = []models.StudyProgramLevels{}
					studyProgram.Profiles = []models.StudyProgramProfile{}
					programByID[studyProgram.ID] = studyProgram
					programOrder = append(programOrder, studyProgram.ID)
				}

				entry := programByID[studyProgram.ID]
				entry.Profiles = append(entry.Profiles, studyProgramProfile)
				programByID[studyProgram.ID] = entry
			}
		}

		if programName != "" && studyLevelName != "" {
			studyProgram, err := cc.getOrCreateStudyProgram(ctx, programName)
			if err != nil {
				return []models.StudyProgram{}, err
			}

			studyLevel, ok := studyLevelByName[studyLevelName]
			if !ok {
				studyLevel, err = cc.getOrCreateStudyLevel(ctx, studyLevelName)
				if err != nil {
					return []models.StudyProgram{}, err
				}
				studyLevelByName[studyLevelName] = studyLevel
			}

			levelPairKey := fmt.Sprintf("program-level:%d:%d", studyProgram.ID, studyLevel.ID)
			if _, exists := seenProgramLevelPairs[levelPairKey]; !exists {
				seenProgramLevelPairs[levelPairKey] = struct{}{}

				studyProgramLevel, err := cc.getOrCreateStudyProgramLevel(
					ctx,
					studyProgram.ID,
					studyLevel.ID,
					orgUnit.ProgramOldId,
				)
				if err != nil {
					return []models.StudyProgram{}, err
				}
				studyProgramLevel.StudyLevel = studyLevel

				if _, exists := programByID[studyProgram.ID]; !exists {
					studyProgram.Faculties = []models.FacultyStudyProgram{}
					studyProgram.StudyLevels = []models.StudyProgramLevels{}
					studyProgram.Profiles = []models.StudyProgramProfile{}
					programByID[studyProgram.ID] = studyProgram
					programOrder = append(programOrder, studyProgram.ID)
				}

				entry := programByID[studyProgram.ID]
				entry.StudyLevels = append(entry.StudyLevels, studyProgramLevel)
				programByID[studyProgram.ID] = entry
			}
		}

		facultyName := strings.TrimSpace(orgUnit.Faculty)
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
		if _, exists := seenFacultyProgramPairs[pairKey]; exists {
			continue
		}
		seenFacultyProgramPairs[pairKey] = struct{}{}

		facultyStudyProgram, err := cc.getOrCreateFacultyStudyProgram(ctx, faculty.ID, studyProgram.ID)
		if err != nil {
			return []models.StudyProgram{}, err
		}
		facultyStudyProgram.Faculty = faculty

		if _, exists := programByID[studyProgram.ID]; !exists {
			studyProgram.Faculties = []models.FacultyStudyProgram{}
			studyProgram.StudyLevels = []models.StudyProgramLevels{}
			studyProgram.Profiles = []models.StudyProgramProfile{}
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

func (cc *Controller) getOrCreateStudyProgramLevel(ctx context.Context, studyProgramID int64, studyLevelID int64, oldID string) (models.StudyProgramLevels, error) {
	oldID = strings.TrimSpace(oldID)
	db := cc.app.Postgres()
	studyProgramLevel, err := gorm.G[models.StudyProgramLevels](db).
		Where(&models.StudyProgramLevels{StudyProgramID: studyProgramID, StudyLevelID: studyLevelID}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyProgramLevel = models.StudyProgramLevels{
				StudyProgramID: studyProgramID,
				StudyLevelID:   studyLevelID,
				OldID:          oldID,
			}
			if err := db.Create(&studyProgramLevel).Error; err != nil {
				return models.StudyProgramLevels{}, err
			}
		} else {
			return models.StudyProgramLevels{}, err
		}
	} else if oldID != "" && strings.TrimSpace(studyProgramLevel.OldID) == "" {
		studyProgramLevel.OldID = oldID
		if err := db.WithContext(ctx).
			Model(&models.StudyProgramLevels{}).
			Where("study_program_id = ? AND study_level_id = ?", studyProgramID, studyLevelID).
			Update("old_id", oldID).Error; err != nil {
			return models.StudyProgramLevels{}, err
		}
	}
	return studyProgramLevel, nil
}

func (cc *Controller) getOrCreateStudyProfile(ctx context.Context, name string) (models.StudyProfile, error) {
	name = strings.TrimSpace(name)
	if name == "" {
		return models.StudyProfile{}, fmt.Errorf("study profile name is empty")
	}
	db := cc.app.Postgres()
	studyProfile, err := gorm.G[models.StudyProfile](db).
		Where(&models.StudyProfile{Name: name}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyProfile = models.StudyProfile{Name: name}
			if err := db.Create(&studyProfile).Error; err != nil {
				return models.StudyProfile{}, err
			}
		} else {
			return models.StudyProfile{}, err
		}
	}
	return studyProfile, nil
}

func (cc *Controller) getOrCreateStudyProgramProfile(ctx context.Context, studyProgramID int64, studyProfileID int64) (models.StudyProgramProfile, error) {
	db := cc.app.Postgres()
	studyProgramProfile, err := gorm.G[models.StudyProgramProfile](db).
		Where(&models.StudyProgramProfile{StudyProgramID: studyProgramID, StudyProfileID: studyProfileID}).
		First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyProgramProfile = models.StudyProgramProfile{
				StudyProgramID: studyProgramID,
				StudyProfileID: studyProfileID,
			}
			if err := db.Create(&studyProgramProfile).Error; err != nil {
				return models.StudyProgramProfile{}, err
			}
		} else {
			return models.StudyProgramProfile{}, err
		}
	}
	return studyProgramProfile, nil
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
