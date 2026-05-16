package render

import (
	"context"
	"errors"
	"fmt"
)

type ThemeModel struct {
	ID          string `json:"id" gorm:"primaryKey;type:uuid;default:gen_random_uuid()"`
	Name        string `json:"name" gorm:"size:255;"`
	BodyContent string `json:"body_content" gorm:"type:text;"`
	Version     string `json:"version" gorm:"size:255;"`
	Status      string `json:"status" gorm:"size:255;"`
	Service     string `json:"service" gorm:"size:255;"`
}

func (r *Render) getTheme(reqCtx context.Context, serviceName string) (string, error) {
	if r == nil || r.db == nil {
		return "", errors.New("db is not set")
	}
	if err := r.checkOrMigrateThemeTable(); err != nil {
		return "", err
	}
	var theme ThemeModel

	if err := r.db.
		WithContext(reqCtx).
		Raw(fmt.Sprintf("SELECT id,body_content FROM %s WHERE service = ? and status = 'active'", r.themes_table_name), serviceName).
		First(&theme).Error; err != nil {
		return "", err
	}
	return theme.BodyContent, nil
}

func (r *Render) checkOrMigrateThemeTable() error {
	if r.db == nil {
		return errors.New("db is not set")
	}
	if r.themes_table_name == "" {
		r.themes_table_name = "themes"
	}

	table := r.themes_table_name
	sql := fmt.Sprintf(`
CREATE TABLE IF NOT EXISTS %s (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	name varchar(255),
	body_content text,
	version varchar(255),
	status varchar(255),
	service varchar(255),
	created_at timestamptz,
	updated_at timestamptz,
	deleted_at timestamptz
);
CREATE INDEX IF NOT EXISTS idx_%s_deleted_at ON %s (deleted_at);
`, table, table, table)

	return r.db.Exec(sql).Error
}
