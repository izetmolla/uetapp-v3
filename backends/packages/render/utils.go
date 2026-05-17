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

func staticErrorText(err error) string {
	return err.Error()
}

// firstPathSegment returns the first non-empty segment of an URL path.
// For "/users/list" it returns "users"; for "/contracts" it returns
// "contracts"; for "/" or "" it returns defaultServiceName.
//
// Query strings and fragments are ignored; matching is allocation-free
// (no strings.Split) so it is safe on the hot render path.
func firstPathSegment(path string, defaultServiceName string) string {
	if i := strings.IndexAny(path, "?#"); i >= 0 {
		path = path[:i]
	}
	path = strings.TrimLeft(path, "/")
	if path == "" {
		return defaultServiceName
	}
	if i := strings.IndexByte(path, '/'); i >= 0 {
		return path[:i]
	}
	return path
}
