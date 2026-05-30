# Datatable implementation examples

## Minimal module layout

```
modules/myfeature/list/
  list.go      # GetListAPI, GetListView, getColumns
  columns.go   # optional: column builders
  routes.go    # register routes
```

## Columns + API (users-style)

```go
func (cc *Controller) GetUsersColumns(c fiber.Ctx) error {
    columns, err := cc.getUsersColumns(c.Context())
    if err != nil {
        return cc.app.Api(c, cc.app.Render().WithError(err))
    }
    return cc.app.Api(c, cc.app.Render().WithData(datatable.GetColumns(columns)))
}

func (cc *Controller) getUsersColumns(ctx context.Context) ([]datatable.Column, error) {
    return []datatable.Column{
        { ID: "id", AccessorKey: "id", Hidden: true },
        {
            ID: "full_name", AccessorKey: "full_name",
            SQLColumn: "CONCAT(first_name, ' ', last_name)",
            Header: "Full Name",
            EnableSorting: true, EnableColumnFilter: true,
            Meta: &datatable.ColumnMeta{
                Label: "Full Name", Variant: datatable.VariantText,
                Placeholder: "Search full name...",
            },
        },
        {
            ID: "email", AccessorKey: "email",
            Header: "Email",
            EnableSorting: true, EnableColumnFilter: true,
            Meta: &datatable.ColumnMeta{ Label: "Email", Variant: datatable.VariantText },
        },
    }, nil
}
```

## List with FindRaw + FormatContent

```go
func (cc *Controller) GetUsersListAPI(c fiber.Ctx) error {
    db := cc.app.Postgres()
    columns, err := cc.getUsersColumns(c.Context())
    if err != nil { /* 500 */ }

    q, err := tablequery.Extract(c, columns)
    if err != nil { /* 400 */ }

    users, pagination, err := postgresql.FindRaw[map[string]any](
        db, q, columns, models.User{}.TableName(),
    ).Run()
    if err != nil { /* 500 */ }

    datatable.FormatContent(&users, columns)
    return c.JSON(fiber.Map{
        "data":       users,
        "pagination": datatable.RenderPagination(pagination),
    })
}
```

## Computed column + filter by id

Display faculty name, filter by faculty id:

```go
{
    ID: "faculty_name", AccessorKey: "faculty_name",
    SQLColumn:          sqlLatestFacultyName,
    FilterSQLColumn:    sqlLatestFacultyID,
    Header:             "Faculty",
    EnableSorting:      true,
    EnableColumnFilter: true,
    Meta: &datatable.ColumnMeta{
        Variant: datatable.VariantSelect,
        Options: facultyOptions,
        FilterBy: "study_level",
    },
},
```

## Subquery scalar (students list pattern)

```go
func sqlLatestScalar(selectExpr, joins string) string {
    return `(SELECT ` + selectExpr + ` FROM student_study_programs ssp` + joins + `
    WHERE ssp.student_id = students.id AND ssp.deleted_at IS NULL
    ORDER BY ssp.created_at DESC LIMIT 1)`
}

// Column:
SQLColumn: sqlLatestScalar("f.name", " INNER JOIN faculties f ON f.id = ssp.faculty_id"),
```

## GORM Find (simple model)

```go
q, _ := tablequery.Extract(c, columns)
items, pagination, err := postgresql.Find[models.Resource](
    db.Model(&models.Resource{}), q, columns,
)
```

## Manual WHERE (custom query)

```go
q, _ := tablequery.Extract(c, columns)
where, args := datatable.ConditionsFromFilters(q.Filters, q.JoinOperator, columns)
db := db.Model(&models.User{})
if where != "" {
    db = db.Where(where, args...)
}
for _, s := range q.Sorts {
    col := datatable.ColumnNameByID(columns)[s.ID]
    dir := "ASC"
    if s.Desc { dir = "DESC" }
    db = db.Order(col + " " + dir)
}
```

## JSON roles column

```go
{
    ID: "roles", AccessorKey: "roles",
    SQLColumn: "roles", // jsonb
    IsJSON: true,
    EnableColumnFilter: true,
    Meta: &datatable.ColumnMeta{
        Variant: datatable.VariantMultiSelect,
        Options: roleOptions,
    },
},
```

`inArray` / `notInArray` use JSONB EXISTS; call `FormatContent` so rows return parsed arrays.

## Advanced-only hidden column

```go
{
    ID: "first_name", AccessorKey: "first_name",
    Hidden: true,
    EnableOnlyAdvancedFilters: true,
    Meta: &datatable.ColumnMeta{ Variant: datatable.VariantText, Label: "First Name" },
},
```

## Proxy external API (forward filters)

```go
q, _ := datatable.ExtractQuery(c.OriginalURL(), columns)
jsonFilters, _ := json.Marshal(q.Filters)
jsonSorting, _ := json.Marshal(q.Sorts)
// pass q.Page, q.PageSize, string(jsonFilters), string(jsonSorting) to upstream
```

## Testing query parsing

```go
q, err := datatable.ExtractQuery(
    "/api/users?page=2&pageSize=25&sorting="+url.QueryEscape(`[{"id":"email","desc":true}]`),
    columns,
)
```

Run package tests after parser changes: `cd backends/packages/datatable && go test ./...`
