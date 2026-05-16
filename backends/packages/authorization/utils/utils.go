package utils

import (
	"encoding/json"
	"net/url"
	"reflect"
	"strings"
)

func IsExcludedPath(excluded []string, path string) bool {
	for _, excludedPath := range excluded {
		if strings.HasPrefix(path, excludedPath) {
			return true
		}
	}
	return false
}

func FormatRoles(roles json.RawMessage) []string {
	if roles == nil {
		return []string{}
	}
	var rolesArray []string
	if err := json.Unmarshal(roles, &rolesArray); err != nil {
		return []string{}
	}
	return rolesArray
}

// stripPasswordFromUserModel clears Password on arbitrary user structs registered via WithUserModel.
// A type assertion to authorization/models.User would panic when the app uses another models package.
func StripPasswordFromUserModel(user any) {
	if user == nil {
		return
	}
	v := reflect.ValueOf(user)
	if v.Kind() != reflect.Pointer || v.IsNil() {
		return
	}
	v = v.Elem()
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

// GetDomainWithoutWWW extracts domain and removes "www."
func GetDomainWithoutWWW(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return "localhost"
	}

	host := parsed.Hostname() // safe: removes port if exists

	// remove "www." prefix if present
	host = strings.TrimPrefix(host, "www.")

	return host
}
