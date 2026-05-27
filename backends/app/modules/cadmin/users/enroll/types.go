package enroll

// PreviewRow is one CSV row matched against the users table.
type PreviewRow struct {
	Row         int            `json:"row"`
	Action      string         `json:"action"` // insert, update, error
	Description string         `json:"description"`
	CSV         csvUserRow     `json:"csv"`
	Existing    *ExistingUser  `json:"existing,omitempty"`
	Errors         []string          `json:"errors,omitempty"`
	InvalidFields  []string          `json:"invalid_fields,omitempty"`
}

// ExistingUser is the current database record when action is update.
type ExistingUser struct {
	ID        string `json:"id"`
	FirstName string `json:"first_name"`
	LastName  string `json:"last_name"`
	Email     string `json:"email"`
	Username  string `json:"username"`
	Image     string `json:"image"`
	Status    string `json:"status"`
	Roles     string `json:"roles"`
}

// ColumnInfo describes one CSV header relative to the users table.
type ColumnInfo struct {
	Key    string `json:"key"`
	Status string `json:"status"` // matched, unknown, missing
	Label  string `json:"label"`
}

// ColumnReport groups CSV columns by whether they map to the users table.
type ColumnReport struct {
	Matched []ColumnInfo `json:"matched"`
	Unknown []ColumnInfo `json:"unknown"`
	Missing []ColumnInfo `json:"missing"`
}

// PreviewResponse is returned after CSV upload.
type PreviewResponse struct {
	Rows        []PreviewRow `json:"rows"`
	Stats       PreviewStats `json:"stats"`
	Columns     ColumnReport `json:"columns"`
	FileColumns []string     `json:"file_columns"`
	Errors      []string     `json:"errors,omitempty"`
}

type PreviewStats struct {
	Total   int `json:"total"`
	Insert  int `json:"insert"`
	Update  int `json:"update"`
	Invalid int `json:"invalid"`
}

// ApplyRequest commits preview rows (insert/update only).
type ApplyRequest struct {
	Rows        []ApplyRow `json:"rows"`
	SkipErrors  bool       `json:"skip_errors"`
	FileColumns []string   `json:"file_columns"`
}

type ApplyRow struct {
	Row    int        `json:"row"`
	Action string     `json:"action"`
	CSV    csvUserRow `json:"csv"`
}

// ApplyFailedRow is a row that was not imported (preview or apply failure).
type ApplyFailedRow struct {
	Row     int        `json:"row"`
	Action  string     `json:"action"`
	Message string     `json:"message"`
	CSV     csvUserRow `json:"csv"`
	Errors  []string   `json:"errors,omitempty"`
}

// ApplyResponse summarizes apply results.
type ApplyResponse struct {
	Inserted   int              `json:"inserted"`
	Updated    int              `json:"updated"`
	Failed     int              `json:"failed"`
	Skipped    int              `json:"skipped"`
	Errors     []string         `json:"errors,omitempty"`
	FailedRows []ApplyFailedRow `json:"failed_rows,omitempty"`
}
