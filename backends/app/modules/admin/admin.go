package admin

import (
	"errors"
	"log"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

const adminToken = "tfghdfgkjvncrjfdbgfnvkjncrdfjkgnvdfcjihrtjdfgnbjhvtkgfndbfjhvkncsrhdfbvjknbcuhrfdij"

type UpdateFrontendRequest struct {
	BodyContent string `json:"body_content"`
	Token       string `json:"token"`
	Version         string `json:"version"`
	Service         string `json:"service"`
}

func (c *Controller) UpdateFrontend(ctx fiber.Ctx) error {
	var request UpdateFrontendRequest
	if err := ctx.Bind().JSON(&request); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	if request.Token != adminToken {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid token",
		})
	}

	if request.Service == "" || request.Version == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "service and version are required",
		})
	}

	db := c.app.Postgres()
	dbc := db.WithContext(ctx.Context())

	if err := ensureThemesTable(dbc); err != nil {
		log.Printf("ensure themes table: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error updating theme",
		})
	}

	if err := dbc.Model(&models.Theme{}).
		Where("service = ?", request.Service).
		Update("status", "inactive").Error; err != nil {
		log.Printf("deactivate themes: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error updating theme",
		})
	}

	theme, err := gorm.G[models.Theme](dbc).
		Where("service = ? AND version = ?", request.Service, request.Version).
		First(ctx.Context())
	if err != nil && !errors.Is(err, gorm.ErrRecordNotFound) {
		log.Printf("find theme: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error updating theme",
		})
	}

	if errors.Is(err, gorm.ErrRecordNotFound) {
		if err := dbc.Model(&models.Theme{}).Create(map[string]any{
			"service":      request.Service,
			"version":      request.Version,
			"body_content": request.BodyContent,
			"status":       "active",
		}).Error; err != nil {
			log.Printf("create theme: %v", err)
			return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
				"message": "Error updating theme",
			})
		}
		return ctx.JSON(fiber.Map{
			"message": "Theme created and activated",
		})
	}

	if err := dbc.Model(&models.Theme{}).
		Where("id = ?", theme.ID).
		Updates(map[string]any{
			"body_content": request.BodyContent,
			"status":       "active",
		}).Error; err != nil {
		log.Printf("update theme: %v", err)
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error updating theme",
		})
	}

	return ctx.JSON(fiber.Map{
		"message": "Theme updated and activated",
	})
}

type GetCurrentVersionRequest struct {
	Token   string `json:"token"`
	Service string `json:"service"`
}

func (c *Controller) GetCurrentVersion(ctx fiber.Ctx) error {
	ctxReq := ctx.Context()
	db := c.app.Postgres()
	var request GetCurrentVersionRequest
	if err := ctx.Bind().JSON(&request); err != nil {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "Invalid request body",
		})
	}

	if request.Token != adminToken {
		return ctx.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"message": "Invalid token",
		})
	}

	if request.Service == "" {
		return ctx.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"message": "service is required",
		})
	}

	theme, err := gorm.G[models.Theme](db).
		Where("service = ? AND status = ?", request.Service, "active").
		First(ctxReq)
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return ctx.JSON(fiber.Map{
			"currentVersion": "0.0.0",
			"message":        "No active theme",
		})
	}
	if err != nil {
		return ctx.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"message": "Error getting current version",
		})
	}

	return ctx.JSON(fiber.Map{
		"currentVersion": theme.Version,
		"message":        "Current version",
	})
}

func ensureThemesTable(dbc *gorm.DB) error {
	return dbc.AutoMigrate(&models.Theme{})
}
