package list

import (
	"github.com/gofiber/fiber/v3"
)

type StudentStatItem struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Value       int64  `json:"value"`
	Description string `json:"description"`
}

type studentStatsCounts struct {
	Total    int64 `gorm:"column:total"`
	Active   int64 `gorm:"column:active_students"`
	Inactive int64 `gorm:"column:inactive_students"`
}

func (cc *Controller) GetStudentsStatsAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()

	var counts studentStatsCounts
	err := db.Raw(`
SELECT
	COUNT(*) AS total,
	COUNT(*) FILTER (WHERE status = 'active' OR status = '' OR status IS NULL) AS active_students,
	COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_students
FROM students
WHERE deleted_at IS NULL
`).Scan(&counts).Error
	if err != nil {
		return cc.app.Api(c,
			cc.app.Render().WithError(err),
			cc.app.Render().WithStatus(fiber.StatusInternalServerError),
			cc.app.Render().WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	stats := []StudentStatItem{
		{
			ID:          "active",
			Name:        "Active Students",
			Value:       counts.Active,
			Description: "Students currently marked as active.",
		},
		{
			ID:          "inactive",
			Name:        "Inactive Students",
			Value:       counts.Inactive,
			Description: "Students marked inactive and disabled from use.",
		},
		{
			ID:          "total",
			Name:        "Total Students",
			Value:       counts.Total,
			Description: "All student records in the system.",
		},
	}

	return c.JSON(fiber.Map{"stats": stats})
}
