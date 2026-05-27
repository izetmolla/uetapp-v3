package importstudents

import (
	"context"
	"fmt"
	"strconv"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

func (cc *Controller) filterOptions(ctx context.Context, option string, optionIds []string) []datatable.OptionItem {
	switch option {
	case "study_level":
		study_levels, _ := cc.getStudyLevels(ctx)
		return study_levels
	case "faculties":
		faculties, _ := cc.getFaculties(ctx, optionIds)
		return faculties
	case "study_program":
		studyPrograms, _ := cc.getStudyPrograms(ctx)
		return studyPrograms
	case "study_profile":
		studyProfiles, _ := cc.getStudyProfiles(ctx)
		return studyProfiles
	}

	return []datatable.OptionItem{}
}

func (cc *Controller) getStudyLevels(ctx context.Context) ([]datatable.OptionItem, error) {
	studyLevels := []datatable.OptionItem{}
	studyLevelsDb, err := gorm.G[models.StudyLevel](cc.app.Postgres()).Find(ctx)
	if err != nil {
		fmt.Println("Error getting study levels: ", err)
	} else {
		for _, studyLevel := range studyLevelsDb {
			studyLevels = append(studyLevels, datatable.OptionItem{
				Label: studyLevel.Name,
				Value: strconv.FormatInt(studyLevel.ID, 10),
			})
		}
	}
	return studyLevels, nil
}

func (cc *Controller) getFaculties(ctx context.Context, studyLevels []string) ([]datatable.OptionItem, error) {
	faculties := []datatable.OptionItem{}
	facultiesDb, err := gorm.G[models.Faculty](cc.app.Postgres()).Find(ctx)
	if err != nil {
		fmt.Println("Error getting faculties: ", err)
	} else {
		for _, faculty := range facultiesDb {
			faculties = append(faculties, datatable.OptionItem{
				Label: faculty.Name,
				Value: strconv.FormatInt(faculty.ID, 10),
			})
		}
	}
	return faculties, nil
}

func (cc *Controller) getStudyPrograms(ctx context.Context) ([]datatable.OptionItem, error) {
	studyPrograms := []datatable.OptionItem{}
	studyProgramsDb, err := gorm.G[models.StudyProgram](cc.app.Postgres()).Find(ctx)
	if err != nil {
		fmt.Println("Error getting study programs: ", err)
	} else {
		for _, studyProgram := range studyProgramsDb {
			studyPrograms = append(studyPrograms, datatable.OptionItem{
				Label: studyProgram.Name,
				Value: strconv.FormatInt(studyProgram.ID, 10),
			})
		}
	}
	return studyPrograms, nil
}

func (cc *Controller) getStudyProfiles(ctx context.Context) ([]datatable.OptionItem, error) {
	studyProfiles := []datatable.OptionItem{}
	studyProfilesDb, err := gorm.G[models.StudyProfile](cc.app.Postgres()).Find(ctx)
	if err != nil {
		fmt.Println("Error getting study profiles: ", err)
	} else {
		for _, studyProfile := range studyProfilesDb {
			studyProfiles = append(studyProfiles, datatable.OptionItem{
				Label: studyProfile.Name,
				Value: strconv.FormatInt(studyProfile.ID, 10),
			})
		}
	}
	return studyProfiles, nil
}

// Other
func (cc *Controller) getStudyProgramOldIds(ctx context.Context, levelIds []string, studyProgramIds []string) []string {
	oldIDs := []string{}
	db := gorm.G[models.StudyProgramLevels](cc.app.Postgres().Debug())

	var (
		studyProgramLevels []models.StudyProgramLevels
		err                error
	)
	switch {
	case len(levelIds) > 0 && len(studyProgramIds) > 0:
		studyProgramLevels, err = db.Where("study_level_id IN ?", levelIds).
			Where("study_program_id IN ?", studyProgramIds).
			Find(ctx)
	case len(levelIds) > 0:
		studyProgramLevels, err = db.Where("study_level_id IN ?", levelIds).Find(ctx)
	case len(studyProgramIds) > 0:
		studyProgramLevels, err = db.Where("study_program_id IN ?", studyProgramIds).Find(ctx)
	default:
		studyProgramLevels, err = db.Find(ctx)
	}

	if err != nil {
		fmt.Println("Error getting study program levels: ", err)
	} else {
		for _, level := range studyProgramLevels {
			if level.OldID != "" {
				oldIDs = append(oldIDs, level.OldID)
			}
		}
	}
	return oldIDs
}
