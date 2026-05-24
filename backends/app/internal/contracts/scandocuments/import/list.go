package importstudents

import (
	"context"
	"encoding/json"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/tablequery"
	"gorm.io/gorm"
)

func (cc *Controller) GetStudentsListAPI(c fiber.Ctx) error {
	reqCtx := c.Context()
	db := cc.app.Postgres()
	r := cc.app.Render()

	columns, err := cc.getStudentsColumns(c.Context())
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}
	q, _ := datatable.ExtractQuery(c.OriginalURL(), columns)
	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(reqCtx)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	jsonColumnFilters, _ := json.Marshal(q.Filters)
	jsonSorting, _ := json.Marshal(q.Sorts)

	res, err := httprequest.Execute[map[string]any](httprequest.New(&httprequest.HttpRequestDriver{
		Url:    resource.Config["url"].(string),
		Method: resource.Config["method"].(string),
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"Authorization": "Bearer " + resource.Config["authorization"].(string),
		},
		Params: map[string]any{
			"action":        "getStudents",
			"keyword":       tablequery.GetFilterValue(c, "fullname"),
			"page":          q.Page,
			"perPage":       q.PageSize,
			"sorting":       string(jsonSorting),
			"columnFilters": string(jsonColumnFilters),
		},
	}))
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	body := res.Body
	if body == nil {
		body = map[string]any{}
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"data":       body["data"],
		"pagination": body["pagination"],
	}))
}

func (cc *Controller) GetStudentsColumns(c fiber.Ctx) error {
	r := cc.app.Render()
	columns, err := cc.getStudentsColumns(c.Context())
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}
	return cc.app.Api(c, r.WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getStudentsColumns(reqCtx context.Context) ([]datatable.Column, error) {
	db := cc.app.Postgres()
	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(reqCtx)
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
		Params: map[string]any{
			"action": "getOrgUnits",
		},
	}))
	if err != nil {
		return nil, err
	}

	orgUnits, err := parseUniversityOrgUnit(res.Body)
	if err != nil {
		return nil, err
	}

	studyLevels, err := getStudyLevelsColumns(orgUnits)
	if err != nil {
		return nil, err
	}

	faculties, err := getFacultiesColumns(orgUnits)
	if err != nil {
		return nil, err
	}
	studyPrograms, err := getStudyPrograms(orgUnits)
	if err != nil {
		return nil, err
	}
	studyProfiles, err := getStudyProfiles(orgUnits)
	if err != nil {
		return nil, err
	}
	academicYears, err := cc.getAcademicYears(reqCtx)
	if err != nil {
		return nil, err
	}

	return []datatable.Column{
		{
			ID:          "PERSON_ID",
			AccessorKey: "PERSON_ID",
			Hidden:      true,
		},
		{
			ID: "fullname",
			// SQLColumn:          "CONCAT(firstname, ' ', lastname)",
			AccessorKey:        "fullname",
			Header:             "Full Name",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:       "Full Name",
				Variant:     "text",
				Placeholder: "Search name...",
			},
		},
		{
			ID:                 "reg_year",
			AccessorKey:        "reg_year",
			Header:             "Year",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Year",
				Variant: "multiSelect",
				Options: academicYears,
			},
		},
		{
			ID:                 "status",
			AccessorKey:        "status",
			Header:             "Status",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Status",
				Variant: "multiSelect",
				Options: []datatable.OptionItem{
					{Label: "Admitted (CURRENT)", Value: "Admitted"},
					{Label: "Completed (SUCCESSFUL)", Value: "Completed"},
					{Label: "Declared (GRADUATION)", Value: "Declared"},
					{Label: "Deleted (DELETED)", Value: "Deleted"},
					{Label: "Deleted (Afat ligjor) (DELETED)", Value: "Deleted (Afat ligjor)"},
					{Label: "Discontinued (Pa NIM) (DELETED)", Value: "Discontinued (Pa NIM)"},
					{Label: "Erasmus", Value: "Erasmus"},
					{Label: "Graduated (GRADUATION)", Value: "Graduated"},
					{Label: "In progress (CURRENT)", Value: "In progress"},
					{Label: "Not active (CEASED)", Value: "Not active"},
					{Label: "Paused (CEASED)", Value: "Paused"},
					{Label: "Paused (No NIM) (CEASED)", Value: "Paused (No NIM)"},
					{Label: "Përsëritës (CURRENT)", Value: "Përsëritës"},
					{Label: "Pezulluar (CEASED)", Value: "Pezulluar"},
					{Label: "Preregistration (PREREGISTRATION)", Value: "Preregistration"},
					{Label: "Transfer (COMPLETED)", Value: "Transfer"},
				},
			},
		},
		{
			ID:                 "study_level",
			AccessorKey:        "study_level",
			Header:             "Study Level",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Study Level",
				Variant: "multiSelect",
				Options: studyLevels,
			},
		},
		{
			ID:                 "faculty",
			AccessorKey:        "faculty",
			Header:             "Faculty",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
			Meta: &datatable.ColumnMeta{
				Label:   "Faculty",
				Variant: "multiSelect",
				Options: faculties,
			},
		},
		{
			ID:                 "study_program",
			AccessorKey:        "study_program",
			Header:             "Study Program",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Hidden:             true,
			Meta: &datatable.ColumnMeta{
				Label:   "Study Program",
				Variant: "multiSelect",
				Options: studyPrograms,
			},
		},
		{
			ID:                 "program_specialty",
			AccessorKey:        "program_specialty",
			Header:             "Study Profile",
			EnableSorting:      true,
			EnableColumnFilter: true,
			Meta: &datatable.ColumnMeta{
				Label:   "Study Profile",
				Variant: "multiSelect",
				Options: studyProfiles,
			},
		},
	}, nil
}

func getStudyLevelsColumns(orgUnits []UniversityOrgUnitType) ([]datatable.OptionItem, error) {
	studyLevels := []datatable.OptionItem{}
	seenStudyLevels := make(map[string]struct{})
	for _, orgUnit := range orgUnits {
		if _, ok := seenStudyLevels[orgUnit.StudyLevel]; ok {
			continue
		}
		seenStudyLevels[orgUnit.StudyLevel] = struct{}{}
		studyLevels = append(studyLevels, datatable.OptionItem{
			Label: orgUnit.StudyLevel,
			Value: orgUnit.StudyLevel,
		})
	}

	return studyLevels, nil
}

func getFacultiesColumns(orgUnits []UniversityOrgUnitType) ([]datatable.OptionItem, error) {
	faculties := []datatable.OptionItem{}
	seenFaculties := make(map[string]struct{})
	for _, orgUnit := range orgUnits {
		if _, ok := seenFaculties[orgUnit.Faculty]; ok {
			continue
		}
		seenFaculties[orgUnit.Faculty] = struct{}{}
		faculties = append(faculties, datatable.OptionItem{
			Label: orgUnit.Faculty,
			Value: orgUnit.Faculty,
		})
	}

	return faculties, nil
}

func getStudyPrograms(orgUnits []UniversityOrgUnitType) ([]datatable.OptionItem, error) {
	studyPrograms := []datatable.OptionItem{}
	seenStudyPrograms := make(map[string]struct{})
	for _, orgUnit := range orgUnits {
		if orgUnit.ProgramID == "" {
			continue
		}
		if _, ok := seenStudyPrograms[orgUnit.Program]; ok {
			continue
		}
		seenStudyPrograms[orgUnit.Program] = struct{}{}
		studyPrograms = append(studyPrograms, datatable.OptionItem{
			Label: orgUnit.Program,
			Value: orgUnit.ProgramID,
		})
	}

	return studyPrograms, nil
}

func getStudyProfiles(orgUnits []UniversityOrgUnitType) ([]datatable.OptionItem, error) {
	studyProfiles := []datatable.OptionItem{}
	seenStudyProfiles := make(map[string]struct{})
	for _, orgUnit := range orgUnits {
		if _, ok := seenStudyProfiles[orgUnit.ProgramSpecialty]; ok {
			continue
		}
		seenStudyProfiles[orgUnit.Profile] = struct{}{}
		studyProfiles = append(studyProfiles, datatable.OptionItem{
			Label: orgUnit.ProgramSpecialty,
			Value: orgUnit.ProgramSpecialty,
		})
	}

	return studyProfiles, nil
}

func (cc *Controller) getAcademicYears(reqCtx context.Context) ([]datatable.OptionItem, error) {
	db := cc.app.Postgres()
	academicYears, err := gorm.G[models.AcademicYear](db).
		Order("id DESC").
		Find(reqCtx)
	if err != nil {
		return nil, err
	}
	academicYearsOptions := []datatable.OptionItem{}
	for _, academicYear := range academicYears {
		yearValue := academicYear.Year
		if len(yearValue) > 4 {
			yearValue = yearValue[:4]
		}

		academicYearsOptions = append(academicYearsOptions, datatable.OptionItem{
			Label: academicYear.Year,
			Value: yearValue,
		})
	}
	return academicYearsOptions, nil

}
