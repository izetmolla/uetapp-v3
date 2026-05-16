package render

import (
	"errors"

	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (r *Render) prepareThemeString(opts *RenderOptions) string {
	theme, err := r.getTheme(opts.ctx, r.serviceName)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return "Theme not found"
		}
		return staticErrorText(err)
	}
	return theme
}

func (r *Render) prepareViewData(c fiber.Ctx, options *RenderOptions) map[string]any {
	res := map[string]any{}
	return res
}
