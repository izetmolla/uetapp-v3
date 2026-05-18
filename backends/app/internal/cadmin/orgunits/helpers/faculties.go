package helpers

import (
	"strconv"

	"github.com/flowtrove/packages/datatable"
	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

// FacultyFilterOptions loads faculties for department list filters (multi-select).
func FacultyFilterOptions(db *gorm.DB) ([]datatable.OptionItem, error) {
	var faculties []models.Faculty
	if err := db.Model(&models.Faculty{}).
		Select("id", "name").
		Order("name ASC").
		Find(&faculties).Error; err != nil {
		return nil, err
	}

	options := make([]datatable.OptionItem, 0, len(faculties))
	for _, faculty := range faculties {
		options = append(options, datatable.OptionItem{
			Label: faculty.Name,
			Value: strconv.FormatInt(faculty.ID, 10),
		})
	}
	return options, nil
}

// FacultyFilterMeta returns multi-select column meta for filtering by faculty id.
func FacultyFilterMeta(options []datatable.OptionItem) *datatable.ColumnMeta {
	return &datatable.ColumnMeta{
		Label:       "Faculty",
		Variant:     datatable.VariantMultiSelect,
		Placeholder: "Select faculty...",
		Options:     options,
	}
}

// DepartmentListJoin joins faculties for department list queries.
const DepartmentListJoin = "LEFT JOIN faculties ON departments.faculty_id = faculties.id"
