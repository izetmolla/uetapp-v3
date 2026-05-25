package studylevels

import "github.com/gofiber/fiber/v3"

type CreateStudentScanLevelGroupRequest struct {
	AcademicYear string `json:"academic_year"`
	FacultySlug  string `json:"faculty_slug"`
	LevelSlug    string `json:"level_slug"`
}

func (c *Controller) CreateStudentScanLevelGroupApi(ctx fiber.Ctx) error {
	r := c.app.Render()
	// ctxPtr := ctx.Context()

	var req CreateStudentScanLevelGroupRequest
	if err := ctx.Bind().JSON(&req); err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"success": true,
		"message": "Student scan level group created successfully",
		"data":    req,
	}))
}
