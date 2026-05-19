package roles

import (
	"github.com/gofiber/fiber/v3"
)

type RoleStatItem struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Value       int64  `json:"value"`
	Description string `json:"description"`
}

type roleStatsCounts struct {
	Total    int64 `gorm:"column:total"`
	Active   int64 `gorm:"column:active_roles"`
	Disabled int64 `gorm:"column:disabled_roles"`
	InUse    int64 `gorm:"column:in_use"`
}

func (cc *Controller) GetRolesStatsAPI(c fiber.Ctx) error {
	db := cc.app.Postgres()

	var counts roleStatsCounts
	err := db.Raw(`
SELECT
	COUNT(*) AS total,
	COUNT(*) FILTER (WHERE status = 'active' OR status = '' OR status IS NULL) AS active_roles,
	COUNT(*) FILTER (WHERE status = 'inactive') AS disabled_roles,
	(
		SELECT COUNT(DISTINCT r.id)
		FROM roles r
		WHERE r.deleted_at IS NULL
		  AND (r.status = 'active' OR r.status = '' OR r.status IS NULL)
		  AND EXISTS (
			SELECT 1 FROM users u
			WHERE u.deleted_at IS NULL
			  AND u.roles @> jsonb_build_array(r.name)
		  )
	) AS in_use
FROM roles
WHERE deleted_at IS NULL
`).Scan(&counts).Error
	if err != nil {
		return cc.app.Api(c,
			cc.app.Render().WithError(err),
			cc.app.Render().WithStatus(fiber.StatusInternalServerError),
			cc.app.Render().WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	stats := []RoleStatItem{
		{
			ID:          "active",
			Name:        "Active Roles",
			Value:       counts.Active,
			Description: "Roles available for assignment to users.",
		},
		{
			ID:          "disabled",
			Name:        "Disabled Roles",
			Value:       counts.Disabled,
			Description: "Roles that are disabled and hidden from new assignments.",
		},
		{
			ID:          "in_use",
			Name:        "Roles In Use",
			Value:       counts.InUse,
			Description: "Active roles currently assigned to at least one user.",
		},
		{
			ID:          "total",
			Name:        "Total Roles",
			Value:       counts.Total,
			Description: "All role definitions in the catalog.",
		},
	}

	return c.JSON(fiber.Map{"stats": stats})
}
