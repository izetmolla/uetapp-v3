package single

import (
	"context"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (c *Controller) GetStudentDetailAPI(ctx fiber.Ctx) error {
	id := ctx.Query("id")
	r := c.app.Render()
	data, err := c.getStudentData(ctx.Context(), id)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(data))
}

func (c *Controller) GetStudentDetailView(ctx fiber.Ctx) error {
	r := c.app.Render()
	id := ctx.Params("id")
	data, err := c.getStudentData(ctx.Context(), id)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	return c.app.Api(ctx, r.WithData(data))
}

func (c *Controller) getStudentData(ctx context.Context, id string) (map[string]any, error) {
	res := make(map[string]any)
	db := c.app.Postgres()
	student, err := gorm.G[models.Student](db).Where("id = ?", id).
		Preload("Programs", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "student_id", "study_program_id", "faculty_id", "study_level_id")
			return nil
		}).
		Preload("Programs.StudyProgram", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug")
			return nil
		}).
		Preload("Programs.Faculty", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug")
			return nil
		}).
		Preload("Programs.StudyLevel", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug")
			return nil
		}).
		Preload("Programs.RegYear", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "year")
			return nil
		}).
		Preload("Programs.StudyProfile", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug")
			return nil
		}).
		Preload("Programs.Status", func(pb gorm.PreloadBuilder) error {
			pb.Select("id", "name", "slug")
			return nil
		}).
		First(ctx)
	if err != nil {
		return nil, err
	}

	programs := make([]map[string]any, len(student.Programs))
	for i, program := range student.Programs {
		programs[i] = map[string]any{
			"id":                program.ID,
			"study_program_id":  program.StudyProgramID,
			"faculty_id":        program.FacultyID,
			"study_level_id":    program.StudyLevelID,
			"study_profile_id":  program.StudyProfileID,
			"student_status_id": program.StudentStatusID,
		}
		programs[i]["study_program"] = map[string]any{
			"id":   program.StudyProgram.ID,
			"name": program.StudyProgram.Name,
			"slug": program.StudyProgram.Slug,
		}
		programs[i]["faculty"] = map[string]any{
			"id":   program.Faculty.ID,
			"name": program.Faculty.Name,
			"slug": program.Faculty.Slug,
		}
		programs[i]["study_level"] = map[string]any{
			"id":   program.StudyLevel.ID,
			"name": program.StudyLevel.Name,
			"slug": program.StudyLevel.Slug,
		}
		programs[i]["reg_year"] = map[string]any{
			"id":   program.RegYear.ID,
			"year": program.RegYear.Year,
		}
		programs[i]["study_profile"] = map[string]any{
			"id":   program.StudyProfile.ID,
			"name": program.StudyProfile.Name,
			"slug": program.StudyProfile.Slug,
		}
		programs[i]["student_status"] = map[string]any{
			"id":   program.Status.ID,
			"name": program.Status.Name,
			"slug": program.Status.Slug,
		}
	}
	res["student"] = map[string]any{
		"id":             student.ID,
		"firstname":      student.Firstname,
		"lastname":       student.Lastname,
		"fathersname":    student.Fathersname,
		"email":          student.Email,
		"id_number":      student.IdNumber,
		"pasport_number": student.PasportNumber,
		"birthdate":      student.Birthdate,
		"status":         student.Status,
		"programs":       programs,
	}
	return res, nil
}
