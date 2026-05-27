package list

import (
	"github.com/gofiber/fiber/v3"
)

type UserStatItem struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Value       int64  `json:"value"`
	Description string `json:"description"`
}

type userStatsCounts struct {
	Total    int64 `gorm:"column:total"`
	New      int64 `gorm:"column:new_users"`
	Active   int64 `gorm:"column:active_users"`
	Inactive int64 `gorm:"column:inactive_users"`
}

func (cc *Controller) GetUsersStatsAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()

	var counts userStatsCounts
	err := db.Raw(`
SELECT
	COUNT(*) AS total,
	COUNT(*) FILTER (WHERE status = 'new') AS new_users,
	COUNT(*) FILTER (WHERE status = 'active') AS active_users,
	COUNT(*) FILTER (WHERE status = 'inactive') AS inactive_users
FROM users
WHERE deleted_at IS NULL
`).Scan(&counts).Error
	if err != nil {
		return cc.app.Api(c,
			cc.app.Render().WithError(err),
			cc.app.Render().WithStatus(fiber.StatusInternalServerError),
			cc.app.Render().WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	stats := []UserStatItem{
		{
			ID:          "new",
			Name:        "New Users",
			Value:       counts.New,
			Description: "Accounts with status \"new\" awaiting activation or review.",
		},
		{
			ID:          "active",
			Name:        "Active Users",
			Value:       counts.Active,
			Description: "Users currently marked as active in the system.",
		},
		{
			ID:          "inactive",
			Name:        "Inactive Users",
			Value:       counts.Inactive,
			Description: "Users marked inactive and not currently using the platform.",
		},
		{
			ID:          "total",
			Name:        "Total Users",
			Value:       counts.Total,
			Description: "All registered users excluding deleted accounts.",
		},
	}

	return c.JSON(fiber.Map{"stats": stats})
}
