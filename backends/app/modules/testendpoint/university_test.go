package testendpoint

// import (
// 	"context"
// 	"encoding/json"
// 	"fmt"
// 	"os"
// 	"path/filepath"
// 	"testing"

// 	"github.com/flowtrove/packages/models"
// 	"github.com/glebarez/sqlite"
// 	"github.com/uetedu/app/config"
// 	"gorm.io/gorm"
// )

// func chdirAppRoot(t *testing.T) {
// 	t.Helper()
// 	wd, err := os.Getwd()
// 	if err != nil {
// 		t.Fatal(err)
// 	}
// 	appRoot := filepath.Join(wd, "..", "..")
// 	if err := os.Chdir(appRoot); err != nil {
// 		t.Fatal(err)
// 	}
// 	t.Cleanup(func() {
// 		_ = os.Chdir(wd)
// 	})
// }

// func setupUniversityTestDB(t *testing.T) *gorm.DB {
// 	t.Helper()
// 	dsn := fmt.Sprintf("file:%s?mode=memory&cache=shared", t.Name())
// 	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
// 	if err != nil {
// 		t.Fatalf("open sqlite: %v", err)
// 	}
// 	if err := config.AutoMigratePostgress(db, models.Models()...); err != nil {
// 		t.Fatalf("migrate: %v", err)
// 	}
// 	return db
// }

// func loadOrgUnitsFixture(t *testing.T) []UniversityOrgUnitType {
// 	t.Helper()
// 	raw, err := os.ReadFile(filepath.Join("internal", "testendpoint", "testdata", "org_units_fixture.json"))
// 	if err != nil {
// 		t.Fatalf("read fixture: %v", err)
// 	}
// 	var rows []UniversityOrgUnitType
// 	if err := json.Unmarshal(raw, &rows); err != nil {
// 		t.Fatalf("decode fixture: %v", err)
// 	}
// 	return rows
// }

// func TestAnalyzeOrgUnitsFixture(t *testing.T) {
// 	chdirAppRoot(t)
// 	orgUnits := loadOrgUnitsFixture(t)
// 	analysis := AnalyzeOrgUnits(orgUnits)

// 	t.Logf("fixture analysis: rows=%d faculties=%d programs=%d levels=%d profiles=%d",
// 		analysis.TotalRows,
// 		analysis.UniqueFaculties,
// 		analysis.UniquePrograms,
// 		analysis.UniqueStudyLevels,
// 		analysis.UniqueProfiles,
// 	)
// 	t.Logf("fixture relations: faculty-level=%d faculty-program=%d program-level=%d program-profile=%d",
// 		analysis.FacultyStudyLevelPairs,
// 		analysis.FacultyStudyProgramPairs,
// 		analysis.ProgramStudyLevelPairs,
// 		analysis.ProgramProfilePairs,
// 	)

// 	if analysis.TotalRows == 0 {
// 		t.Fatal("fixture is empty")
// 	}
// }

// func TestSyncUniversityOrgUnitsFixtureRelations(t *testing.T) {
// 	chdirAppRoot(t)
// 	orgUnits := loadOrgUnitsFixture(t)
// 	db := setupUniversityTestDB(t)
// 	cc := NewController(config.NewTestAppClients(db))

// 	result, err := cc.syncUniversityOrgUnits(context.Background(), orgUnits)
// 	if err != nil {
// 		t.Fatalf("sync: %v", err)
// 	}
// 	if err := validateSyncResult(orgUnits, result); err != nil {
// 		t.Fatalf("relation validation: %v", err)
// 	}

// 	result2, err := cc.syncUniversityOrgUnits(context.Background(), orgUnits)
// 	if err != nil {
// 		t.Fatalf("second sync: %v", err)
// 	}
// 	if err := validateSyncResult(orgUnits, result2); err != nil {
// 		t.Fatalf("second sync validation: %v", err)
// 	}

// 	expected := AnalyzeOrgUnits(orgUnits)

// 	var facultyStudyLevels int64
// 	if err := db.Model(&models.FacultyStudyLevel{}).Count(&facultyStudyLevels).Error; err != nil {
// 		t.Fatal(err)
// 	}
// 	if facultyStudyLevels != int64(expected.FacultyStudyLevelPairs) {
// 		t.Fatalf("db faculty_study_levels: got %d want %d", facultyStudyLevels, expected.FacultyStudyLevelPairs)
// 	}

// 	var facultyStudyPrograms int64
// 	if err := db.Model(&models.FacultyStudyProgram{}).Count(&facultyStudyPrograms).Error; err != nil {
// 		t.Fatal(err)
// 	}
// 	if facultyStudyPrograms != int64(expected.FacultyStudyProgramPairs) {
// 		t.Fatalf("db faculty_study_programs: got %d want %d", facultyStudyPrograms, expected.FacultyStudyProgramPairs)
// 	}

// 	var programLevels int64
// 	if err := db.Model(&models.StudyProgramLevels{}).Count(&programLevels).Error; err != nil {
// 		t.Fatal(err)
// 	}
// 	if programLevels != int64(expected.ProgramStudyLevelPairs) {
// 		t.Fatalf("db study_program_levels: got %d want %d", programLevels, expected.ProgramStudyLevelPairs)
// 	}

// 	var programProfiles int64
// 	if err := db.Model(&models.StudyProgramProfile{}).Count(&programProfiles).Error; err != nil {
// 		t.Fatal(err)
// 	}
// 	if programProfiles != int64(expected.ProgramProfilePairs) {
// 		t.Fatalf("db study_program_profiles: got %d want %d", programProfiles, expected.ProgramProfilePairs)
// 	}
// }

// func TestParseUniversityOrgUnitResponseShapes(t *testing.T) {
// 	body := map[string]any{
// 		"data": []any{
// 			map[string]any{
// 				"program_old_id": "1",
// 				"program":        "Test Program",
// 				"profile":        "",
// 				"faculty":        "Test Faculty",
// 				"study_level":    "Bachelor",
// 			},
// 		},
// 	}
// 	orgUnits, err := parseUniversityOrgUnit(body)
// 	if err != nil {
// 		t.Fatalf("parse: %v", err)
// 	}
// 	if len(orgUnits) != 1 {
// 		t.Fatalf("got %d rows", len(orgUnits))
// 	}
// 	if orgUnits[0].Program != "Test Program" || orgUnits[0].ProgramOldId != "1" {
// 		t.Fatalf("unexpected row: %+v", orgUnits[0])
// 	}
// }
