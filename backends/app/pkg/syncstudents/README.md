# syncstudents package

`syncstudents` imports student data from Athena into local tables and keeps student enrollments in sync.

## What this package does

- Loads students from Athena using either:
  - `document_id`, or
  - a list of Athena `SP IDs` (`students`) with optional `document_id`.
- Normalizes and validates incoming data (especially `document_id`).
- Groups Athena rows by `document_id` so one local student can contain multiple enrollment rows.
- Upserts `students` records by `document_id`.
- Upserts related `student_study_programs` for each enrollment row.
- Creates missing reference rows on demand:
  - `faculties`
  - `study_programs`
  - `study_levels`
  - `study_profiles` (optional)
  - `student_statuses`
  - `academic_years`
- Synchronizes `students.academic_email` from the latest linked enrollment/athena data.
- Returns a detailed result with created/updated IDs and per-step errors.

## Key behavior and rules

- `document_id` must be alphanumeric and at least 7 characters.
- Athena requests are chunked in batches of `50` SP IDs.
- Import work runs concurrently with `8` workers.
- Duplicate Athena rows (same SP ID) are deduplicated.
- If SP IDs are provided, the package expands by discovered `document_id` to import all rows for that person.
- Student-study-program rows not present in the incoming set are removed for that student (sync behavior).
- The operation may return `success: false` with partial progress and structured errors.

## Dependencies / prerequisites

This package expects:

- `*config.AppClients` (via `syncstudents.New(app)`)
- Database access through `app.Postgres()`
- A valid Athena resource row in `resources` table with `id = 3`
  - `config.url`
  - `config.method` (`GET` or `POST`)
  - `config.authorization` (Bearer token)

## Public API

### Constructor

- `New(app *config.AppClients) *Controller`

### Import entrypoint

- `ImportStudents(ctx context.Context, req ImportStudentsRequest) (ImportStudentsResult, error)`

Request:

- `students []string`: Athena SP IDs
- `document_id string`: optional when `students` is provided, required when `students` is empty

Result highlights:

- `success`, `message`
- `created`, `updated`
- `student_ids`, `created_ids`, `updated_ids`
- `students []models.Student`
- `errors []ImportLogError`

## Example 1: Import by document ID only

```go
package example

import (
	"context"

	"github.com/uetedu/app/config"
	"github.com/uetedu/app/pkg/syncstudents"
)

func ImportByDocumentID(ctx context.Context, app *config.AppClients, documentID string) (syncstudents.ImportStudentsResult, error) {
	return syncstudents.New(app).ImportStudents(ctx, syncstudents.ImportStudentsRequest{
		DocumentID: documentID,
	})
}
```

Use this when you only know the student's document ID.

## Example 2: Import by Athena SP IDs

```go
package example

import (
	"context"

	"github.com/uetedu/app/config"
	"github.com/uetedu/app/pkg/syncstudents"
)

func ImportBySPIDs(ctx context.Context, app *config.AppClients, spIDs []string) (syncstudents.ImportStudentsResult, error) {
	return syncstudents.New(app).ImportStudents(ctx, syncstudents.ImportStudentsRequest{
		Students: spIDs,
	})
}
```

Use this when you have one or more SP IDs and want to sync all related rows.

## Example 3: Fiber endpoint integration

```go
package handlers

import (
	"github.com/gofiber/fiber/v3"
	"github.com/uetedu/app/pkg/syncstudents"
)

type ImportStudentsPayload struct {
	Students   []string `json:"students"`
	DocumentID string   `json:"document_id"`
}

func (cc *Controller) ImportStudentsAPI(ctx fiber.Ctx) error {
	var req ImportStudentsPayload
	if err := ctx.Bind().JSON(&req); err != nil {
		return cc.app.Api(ctx, cc.app.Render().WithError(err))
	}

	result, err := syncstudents.New(cc.app).ImportStudents(ctx.Context(), syncstudents.ImportStudentsRequest{
		Students:   req.Students,
		DocumentID: req.DocumentID,
	})
	if err != nil {
		return cc.app.Api(ctx, cc.app.Render().WithError(err))
	}
	return cc.app.Api(ctx, cc.app.Render().WithData(result))
}
```

## Error handling recommendations

- Always check both:
  - function `error` (transport/system failure), and
  - `result.Success` plus `result.Errors` (business/import-level failures).
- Log each `ImportLogError.Identifier` to quickly locate failing import step.
- Treat imports as idempotent sync operations; reruns are expected and safe.

## Notes for implementers

- If imports fail with HTML/invalid JSON from Athena, request size may be too large upstream; SP ID chunking is already applied in this package.
- Program names are normalized (e.g. suffixes in parentheses are stripped), which helps avoid duplicate reference rows.
- Study profile is optional; empty profile names are allowed and stored as `NULL`.
