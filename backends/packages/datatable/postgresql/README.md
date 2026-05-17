## Datatable PostgreSQL helpers

This package contains helpers for applying a `datatable.TableQuery` to PostgreSQL via Gorm.

### `Find`

```go
func Find[T any](db *gorm.DB, q datatable.TableQuery, columns []datatable.Column) ([]T, datatable.Pagination, error)
```

- **`db`**: a Gorm query (`DB().Model(&User{})`, etc.)
- **`q`**: the `TableQuery` returned by `datatable.ExtractQuery`.
- **`columns`**: the same column definitions you expose to the frontend.

`Find` will:

- Map `q.Sorts` into `ORDER BY` clauses.
- Map `q.Filters` into `WHERE` clauses using PostgreSQL-friendly operators.
- Apply pagination (`LIMIT` / `OFFSET`) from `q.Page` and `q.PageSize`.
- Execute the query and return the list of items, `datatable.Pagination`, and an error.

### Supported filter operators

The following operators (coming from the frontend) are recognised in `Filter.Operator`:

- **`"" / "eq"`**: `column = value`
- **`"ne"`**: `column <> value`
- **`"iLike"`**: `column ILIKE '%value%'`
- **`"notILike"`**: `column NOT ILIKE '%value%'`
- **`"inArray"` / `"in"`**: `column IN (values...)`
- **`"notInArray"` / `"notIn"`**: `column NOT IN (values...)`
- **`"isEmpty"`**: `column IS NULL OR column = ''`
- **`"isNotEmpty"`**: `column IS NOT NULL AND column <> ''`

For **simple mode** (`columnFilters[...]`) where no operator is sent:

- One value → treated as `eq`.
- Multiple values → treated as `inArray`.

### `FindRaw` (raw SQL with optional joins)

For raw SQL queries where you need to add custom `JOIN` clauses, use `FindRaw` and chain `AddJoin`:

```go
func FindRaw[T any](db *gorm.DB, q datatable.TableQuery, columns []datatable.Column, table string) *RawQueryBuilder[T]
func (b *RawQueryBuilder[T]) AddJoin(join string) *RawQueryBuilder[T]
func (b *RawQueryBuilder[T]) Run() ([]T, datatable.Pagination, error)
```

**How to use:**

1. Call `FindRaw[T](db, q, columns, tableName)` – this returns a builder, it does not run the query yet.
2. Optionally chain `.AddJoin("...")` one or more times to add join clauses (e.g. `"LEFT JOIN departments ON users.department_id = departments.id"`).
3. Call `.Run()` to build the SQL, execute it, and get `(items, pagination, error)`.

Empty join strings are ignored. The final SQL is: `SELECT ... FROM table join1 join2 ...`.

**Example:**

```go
columns, _ := getUsersColumns()
q, _ := datatable.ExtractQuery(c.OriginalURL(), columns)
tableName := models.User{}.TableName()

users, pagination, err := postgresql.FindRaw[[]map[string]any](db, q, columns, tableName).
	AddJoin("LEFT JOIN departments ON users.department_id = departments.id").
	AddJoin("LEFT JOIN roles ON users.role_id = roles.id").
	Run()
if err != nil {
	// handle error
}

return c.JSON(fiber.Map{
	"data":       users,
	"pagination": datatable.RenderPagination(pagination),
})
```

Without joins, you still must call `Run()`:

```go
users, pagination, err := postgresql.FindRaw[MyModel](db, q, columns, "users").Run()
```

### Typical usage (`Find`)

```go
columns, _ := getUsersColumns()
q, _ := datatable.ExtractQuery(c.OriginalURL(), columns)

users, pagination, err := postgresql.Find[models.User](db.Model(&models.User{}), q, columns)
if err != nil {
	// handle error
}

return c.JSON(fiber.Map{
	"users":      users,
	"pagination": datatable.RenderPagination(pagination),
})
```

