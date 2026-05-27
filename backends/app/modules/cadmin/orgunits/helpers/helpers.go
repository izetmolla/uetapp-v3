package helpers

import (
	"errors"
	"regexp"
	"strconv"
	"strings"

	"gorm.io/gorm"
)

type DeleteByIDsRequest struct {
	IDs []string `json:"ids"`
}

var slugSanitizer = regexp.MustCompile(`[^a-z0-9]+`)

func Slugify(value string) string {
	value = strings.ToLower(strings.TrimSpace(value))
	if value == "" {
		return ""
	}
	return strings.Trim(slugSanitizer.ReplaceAllString(value, "-"), "-")
}

func ParseIDParam(raw string) (int64, error) {
	id, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid id")
	}
	return id, nil
}

func ParseDeleteIDs(ids []string) ([]int64, error) {
	if len(ids) == 0 {
		return nil, errors.New("at least one id is required")
	}
	parsed := make([]int64, 0, len(ids))
	for _, rawID := range ids {
		id, err := ParseIDParam(rawID)
		if err != nil {
			return nil, errors.New("invalid id in request")
		}
		parsed = append(parsed, id)
	}
	return parsed, nil
}

func EnsureUniqueSlug(db *gorm.DB, model any, slug string, excludeID int64) error {
	var count int64
	query := db.Model(model).Where("slug = ?", slug)
	if excludeID > 0 {
		query = query.Where("id <> ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("slug already exists")
	}
	return nil
}

func EnsureUniqueYear(db *gorm.DB, model any, year string, excludeID int64) error {
	var count int64
	query := db.Model(model).Where("year = ?", year)
	if excludeID > 0 {
		query = query.Where("id <> ?", excludeID)
	}
	if err := query.Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return errors.New("academic year already exists")
	}
	return nil
}

func ResolveSlug(slug, name string) (string, error) {
	slug = Slugify(slug)
	if slug == "" {
		slug = Slugify(name)
	}
	if slug == "" {
		return "", errors.New("slug is required")
	}
	return slug, nil
}
