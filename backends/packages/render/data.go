package render

import (
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"log"

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
	baseURL := resolveBaseURL(c)
	data := map[string]any{
		"title":         options.title,
		"base_url":      baseURL,
		"theme_url":     baseURL,
		"current_url":   c.OriginalURL(),
		"globalOptions": map[string]any{},
		// Empty HTML so index.html {{.globalContent}} does not print Go's map default "map[]".
		"globalContent": template.HTML(""),
	}

	var generalData map[string]any
	if r.WithGeneralData != nil {
		var err error
		generalData, err = r.WithGeneralData(c, options.ctx, firstPathSegment(c.Path(), r.serviceName), false)
		if err != nil && !options.withoutAuthentication {
			options.err = err
			log.Printf("Error getting general data for service %s: %v", firstPathSegment(c.Path(), r.serviceName), err)
		}
	}

	if options.err != nil {
		data["title"] = options.title
		if options.title == "" {
			data["title"] = options.err.Error()
		}
		content := map[string]any{
			"originalUrl": c.OriginalURL(),
			"error": map[string]any{
				"message": options.err.Error(),
				"status":  options.errorStatus,
				"code":    options.errorCode,
			},
			"general": generalData,
			"data":    options.data,
			// "template": getEndpointTemplate(options.Endpoint),
		}
		jsonData, _ := json.Marshal(content)
		data["globalOptions"] = template.HTML(fmt.Sprintf(`<script id="__GLOBAL_DATA__" data-app="%s" type="application/json">%s</script>`, r.serviceName, string(jsonData)))

		// errB, err := ssrErrorContentItems(options)
		// if err == nil {
		// 	data["globalContent"] = template.HTML(fmt.Sprintf(`<script id="__GLOBAL_DATA__CONTENT__" data-app="%s" type="application/json">%s</script>`, r.serviceName, string(errB)))
		// }
	} else {
		content := map[string]any{
			"originalUrl": c.OriginalURL(),
			"data":        options.data,
			"general":     generalData,
			// "template":    getEndpointTemplate(options.Endpoint),
		}
		jsonData, _ := json.Marshal(content)
		data["globalOptions"] = template.HTML(fmt.Sprintf(`<script id="__GLOBAL_DATA__" data-app="%s" type="application/json">%s</script>`, r.serviceName, string(jsonData)))
		// __GLOBAL_DATA__.template.content is always the template shell (Template.Content).
		// Page layout is in __GLOBAL_DATA__CONTENT__ when a frontend row is linked or SSR set Frontend.Content (e.g. 404).
		// if options.Endpoint != nil &&
		// 	(options.Endpoint.FrontendID != "" || len(options.Endpoint.Frontend.Content) > 0) {
		// 	feB, err := json.Marshal(options.Endpoint.Frontend.Content)
		// 	if err == nil {
		// 		data["globalContent"] = template.HTML(fmt.Sprintf(
		// 			`<script id="__GLOBAL_DATA__CONTENT__" data-app="%s" type="application/json">%s</script>`,
		// 			app.appName,
		// 			string(feB),
		// 		))
		// 	}
		// }
	}

	return data
}
