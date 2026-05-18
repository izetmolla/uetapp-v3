package utils

import (
	"net/url"
	"reflect"
	"strings"
)

// IsExcludedPath reports whether `path` starts with any prefix in
// `excluded`. Prefix matching is intentional so callers can opt entire
// route trees out of authentication (e.g. "/api/public").
func IsExcludedPath(excluded []string, path string) bool {
	for _, prefix := range excluded {
		if prefix == "" {
			continue
		}
		if strings.HasPrefix(path, prefix) {
			return true
		}
	}
	return false
}

// StripPasswordFromUserModel clears the "Password" field on an arbitrary
// user struct registered via WithUserModel.
//
// The reflection dance is required because we cannot type-assert to
// authorization/models.User: applications are free to provide their own
// User type, and a hard-coded assertion would panic at runtime for them.
func StripPasswordFromUserModel(user any) {
	if user == nil {
		return
	}
	v := reflect.ValueOf(user)
	if v.Kind() != reflect.Pointer || v.IsNil() {
		return
	}
	v = v.Elem()
	if v.Kind() != reflect.Struct {
		return
	}
	f := v.FieldByName("Password")
	if !f.IsValid() || !f.CanSet() {
		return
	}
	switch f.Kind() {
	case reflect.String:
		f.SetString("")
	case reflect.Pointer:
		f.Set(reflect.Zero(f.Type()))
	}
}

// GetDomainWithoutWWW extracts the host from `rawURL`, drops any port
// and strips a leading "www." prefix. Returns "localhost" when parsing
// fails so callers always have a usable value.
func GetDomainWithoutWWW(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil || parsed.Hostname() == "" {
		return "localhost"
	}
	return strings.TrimPrefix(parsed.Hostname(), "www.")
}
