package render

import (
	"fmt"
	"strings"

	"github.com/gofiber/fiber/v3"
)

func resolveBaseURL(c fiber.Ctx) string {
	proto := firstHeaderValue(c.Get(fiber.HeaderXForwardedProto))
	forwardedHost := firstHeaderValue(c.Get(fiber.HeaderXForwardedHost))
	host := forwardedHost

	if host == "" {
		host = strings.TrimSpace(c.Get(fiber.HeaderHost))
	}

	if proto == "" {
		proto = strings.TrimSpace(c.Protocol())
	}
	if proto == "" && forwardedHost != "" {
		// Ingress/proxies sometimes omit x-forwarded-proto but still expose x-forwarded-host.
		// Prefer HTTPS to avoid browsers blocking mixed-content static assets.
		proto = "https"
	}
	if proto == "" {
		proto = "http"
	}

	if host != "" {
		return fmt.Sprintf("%s://%s", proto, host)
	}

	return c.BaseURL()
}

func firstHeaderValue(value string) string {
	if value == "" {
		return ""
	}
	parts := strings.Split(value, ",")
	if len(parts) == 0 {
		return ""
	}
	return strings.TrimSpace(parts[0])
}
