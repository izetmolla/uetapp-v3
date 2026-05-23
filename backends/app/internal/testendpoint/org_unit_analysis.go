package testendpoint

// import (
// 	"fmt"
// 	"strings"

// 	"github.com/flowtrove/packages/models"
// )

// type OrgUnitAnalysis struct {
// 	TotalRows int `json:"total_rows"`

// 	UniqueFaculties   int `json:"unique_faculties"`
// 	UniquePrograms    int `json:"unique_programs"`
// 	UniqueStudyLevels int `json:"unique_study_levels"`
// 	UniqueProfiles    int `json:"unique_profiles"`

// 	FacultyStudyLevelPairs   int `json:"faculty_study_level_pairs"`
// 	FacultyStudyProgramPairs int `json:"faculty_study_program_pairs"`
// 	ProgramStudyLevelPairs   int `json:"program_study_level_pairs"`
// 	ProgramProfilePairs      int `json:"program_profile_pairs"`
// }

// func normalizeField(value string) string {
// 	return strings.TrimSpace(value)
// }

// func programLevelKey(program, studyLevel string) string {
// 	return program + "\x00" + studyLevel
// }

// func programProfileKey(program, profile string) string {
// 	return program + "\x00" + profile
// }

// func facultyLevelKey(faculty, studyLevel string) string {
// 	return faculty + "\x00" + studyLevel
// }

// func facultyProgramKey(faculty, program string) string {
// 	return faculty + "\x00" + program
// }

// func AnalyzeOrgUnits(orgUnits []UniversityOrgUnitType) OrgUnitAnalysis {
// 	analysis := OrgUnitAnalysis{TotalRows: len(orgUnits)}

// 	faculties := make(map[string]struct{})
// 	programs := make(map[string]struct{})
// 	levels := make(map[string]struct{})
// 	profiles := make(map[string]struct{})
// 	facultyLevelPairs := make(map[string]struct{})
// 	facultyProgramPairs := make(map[string]struct{})
// 	programLevelPairs := make(map[string]struct{})
// 	programProfilePairs := make(map[string]struct{})

// 	for _, row := range orgUnits {
// 		faculty := normalizeField(row.Faculty)
// 		program := normalizeField(row.Program)
// 		studyLevel := normalizeField(row.StudyLevel)
// 		profile := normalizeField(row.Profile)

// 		if faculty != "" {
// 			faculties[faculty] = struct{}{}
// 		}
// 		if program != "" {
// 			programs[program] = struct{}{}
// 		}
// 		if studyLevel != "" {
// 			levels[studyLevel] = struct{}{}
// 		}
// 		if profile != "" {
// 			profiles[profile] = struct{}{}
// 		}
// 		if faculty != "" && studyLevel != "" {
// 			facultyLevelPairs[facultyLevelKey(faculty, studyLevel)] = struct{}{}
// 		}
// 		if faculty != "" && program != "" {
// 			facultyProgramPairs[facultyProgramKey(faculty, program)] = struct{}{}
// 		}
// 		if program != "" && studyLevel != "" {
// 			programLevelPairs[programLevelKey(program, studyLevel)] = struct{}{}
// 		}
// 		if program != "" && profile != "" {
// 			programProfilePairs[programProfileKey(program, profile)] = struct{}{}
// 		}
// 	}

// 	analysis.UniqueFaculties = len(faculties)
// 	analysis.UniquePrograms = len(programs)
// 	analysis.UniqueStudyLevels = len(levels)
// 	analysis.UniqueProfiles = len(profiles)
// 	analysis.FacultyStudyLevelPairs = len(facultyLevelPairs)
// 	analysis.FacultyStudyProgramPairs = len(facultyProgramPairs)
// 	analysis.ProgramStudyLevelPairs = len(programLevelPairs)
// 	analysis.ProgramProfilePairs = len(programProfilePairs)
// 	return analysis
// }

// func countFacultyStudyLevelRelations(faculties []models.Faculty) int {
// 	total := 0
// 	for _, faculty := range faculties {
// 		total += len(faculty.StudyLevels)
// 	}
// 	return total
// }

// func countFacultyStudyProgramRelations(faculties []models.Faculty) int {
// 	total := 0
// 	for _, faculty := range faculties {
// 		total += len(faculty.StudyPrograms)
// 	}
// 	return total
// }

// func countProgramStudyLevelRelations(programs []models.StudyProgram) int {
// 	total := 0
// 	for _, program := range programs {
// 		total += len(program.StudyLevels)
// 	}
// 	return total
// }

// func countProgramProfileRelations(programs []models.StudyProgram) int {
// 	total := 0
// 	for _, program := range programs {
// 		total += len(program.Profiles)
// 	}
// 	return total
// }

// func validateSyncResult(orgUnits []UniversityOrgUnitType, result UniversitySyncResult) error {
// 	expected := AnalyzeOrgUnits(orgUnits)

// 	if len(result.StudyLevels) != expected.UniqueStudyLevels {
// 		return fmt.Errorf("study levels: got %d want %d", len(result.StudyLevels), expected.UniqueStudyLevels)
// 	}
// 	if len(result.StudyPrograms) != expected.UniquePrograms {
// 		return fmt.Errorf("study programs: got %d want %d", len(result.StudyPrograms), expected.UniquePrograms)
// 	}
// 	if len(result.StudyProfiles) != expected.UniqueProfiles {
// 		return fmt.Errorf("study profiles: got %d want %d", len(result.StudyProfiles), expected.UniqueProfiles)
// 	}
// 	if len(result.Faculties) != expected.UniqueFaculties {
// 		return fmt.Errorf("faculties: got %d want %d", len(result.Faculties), expected.UniqueFaculties)
// 	}

// 	if got := countFacultyStudyLevelRelations(result.Faculties); got != expected.FacultyStudyLevelPairs {
// 		return fmt.Errorf("faculty↔study level relations: got %d want %d", got, expected.FacultyStudyLevelPairs)
// 	}
// 	if got := countFacultyStudyProgramRelations(result.Faculties); got != expected.FacultyStudyProgramPairs {
// 		return fmt.Errorf("faculty↔study program relations: got %d want %d", got, expected.FacultyStudyProgramPairs)
// 	}
// 	if got := countProgramStudyLevelRelations(result.StudyPrograms); got != expected.ProgramStudyLevelPairs {
// 		return fmt.Errorf("program↔study level relations: got %d want %d", got, expected.ProgramStudyLevelPairs)
// 	}
// 	if got := countProgramProfileRelations(result.StudyPrograms); got != expected.ProgramProfilePairs {
// 		return fmt.Errorf("program↔profile relations: got %d want %d", got, expected.ProgramProfilePairs)
// 	}

// 	programByName := make(map[string]models.StudyProgram, len(result.StudyPrograms))
// 	for _, program := range result.StudyPrograms {
// 		programByName[normalizeField(program.Name)] = program
// 	}

// 	for key, allowedOldIDs := range expectedProgramLevelOldIDs(orgUnits) {
// 		parts := strings.Split(key, "\x00")
// 		if len(parts) != 2 {
// 			continue
// 		}
// 		program, ok := programByName[parts[0]]
// 		if !ok {
// 			return fmt.Errorf("program %q missing for old_id check", parts[0])
// 		}
// 		found := false
// 		for _, levelRel := range program.StudyLevels {
// 			if normalizeField(levelRel.StudyLevel.Name) != parts[1] {
// 				continue
// 			}
// 			found = true
// 			gotOldID := normalizeField(levelRel.OldID)
// 			if len(allowedOldIDs) == 1 {
// 				for wantOldID := range allowedOldIDs {
// 					if gotOldID != wantOldID {
// 						return fmt.Errorf("program %q level %q old_id: got %q want %q", parts[0], parts[1], gotOldID, wantOldID)
// 					}
// 				}
// 			} else if gotOldID != "" {
// 				if _, ok := allowedOldIDs[gotOldID]; !ok {
// 					return fmt.Errorf("program %q level %q old_id: got %q not in upstream values", parts[0], parts[1], gotOldID)
// 				}
// 			}
// 		}
// 		if !found {
// 			return fmt.Errorf("program %q level %q relation missing", parts[0], parts[1])
// 		}
// 	}

// 	return nil
// }

// func expectedProgramLevelOldIDs(orgUnits []UniversityOrgUnitType) map[string]map[string]struct{} {
// 	out := make(map[string]map[string]struct{})
// 	for _, row := range orgUnits {
// 		program := normalizeField(row.Program)
// 		studyLevel := normalizeField(row.StudyLevel)
// 		oldID := normalizeField(row.ProgramOldId)
// 		if program == "" || studyLevel == "" || oldID == "" {
// 			continue
// 		}
// 		key := programLevelKey(program, studyLevel)
// 		if out[key] == nil {
// 			out[key] = make(map[string]struct{})
// 		}
// 		out[key][oldID] = struct{}{}
// 	}
// 	return out
// }
