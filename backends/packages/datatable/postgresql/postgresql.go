package postgresql

import (
	"fmt"
	"strings"

	"github.com/flowtrove/packages/datatable"
	"gorm.io/gorm"
)

// Find applies a datatable.TableQuery (pagination, sorting, filtering)
// to a GORM query and returns the list of items together with pagination.
//
// The columns slice must be the same one used to configure the
// datatable on the backend (GetUsersColumns, etc).
//
// Example:
//
//	columns, _ := getUsersColumns()
//	q, _ := datatable.ExtractQuery(c.OriginalURL(), columns)
//
//	users, pagination, err := postgresql.Find[models.User](cc.drivers.DB().Model(&models.User{}), q, columns)
//
//	return c.JSON(fiber.Map{
//	    "users":      users,
//	    "pagination": datatable.RenderPagination(pagination),
//	})
func Find[T any](db *gorm.DB, q datatable.TableQuery, columns []datatable.Column) ([]T, datatable.Pagination, error) {
	columnNameByID := datatable.ColumnNameByID(columns)

	query := db

	// Apply filters (supports nested groups).
	if where, args := datatable.ConditionsFromFilters(q.Filters, q.JoinOperator, columns); where != "" {
		query = query.Where(where, args...)
	}

	// Apply sorting (respecting order).
	for _, s := range q.Sorts {
		colName, ok := columnNameByID[s.ID]
		if !ok || colName == "" {
			continue
		}

		dir := "ASC"
		if s.Desc {
			dir = "DESC"
		}

		query = query.Order(fmt.Sprintf("%s %s", colName, dir))
	}

	// Compute total count before pagination.
	var total int64
	if err := query.Count(&total).Error; err != nil {
		return nil, datatable.Pagination{}, err
	}

	// Apply pagination (1-based page).
	page := q.Page
	if page < 1 {
		page = 1
	}
	limit := q.PageSize
	if limit <= 0 {
		limit = 10
	}

	offset := (page - 1) * limit
	if offset < 0 {
		offset = 0
	}

	query = query.Limit(limit).Offset(offset)

	// Execute query.
	var items []T
	if err := query.Find(&items).Error; err != nil {
		return nil, datatable.Pagination{}, err
	}

	// Build pagination response.
	totalInt := int64(total)
	totalPages := 0
	if limit > 0 {
		totalPages = int((totalInt + int64(limit) - 1) / int64(limit))
	}

	pagination := datatable.Pagination{
		Page:       page,
		Limit:      limit,
		Total:      totalInt,
		TotalPages: totalPages,
		PageCount:  int64(len(items)),
	}

	return items, pagination, nil
}

// applyFilter adds a WHERE clause for a single datatable.Filter
// using PostgreSQL-friendly operators.
//
// Supported operators (case-insensitive):
//   - "" / "eq"        : column = value
//   - "ne"             : column <> value
//   - "iLike"          : column ILIKE '%value%'
//   - "notILike"       : column NOT ILIKE '%value%'
//   - "inArray"        : column IN (values...)
//   - "notInArray"     : column NOT IN (values...)
//   - "isEmpty"        : column IS NULL OR column = ”
//   - "isNotEmpty"     : column IS NOT NULL AND column <> ”
//
// For simple mode (columnFilters) where Operator is empty:
//   - if len(Values) == 1  -> treat as eq
//   - if len(Values) > 1   -> treat as IN
func applyFilter(db *gorm.DB, column string, f datatable.Filter, col datatable.Column) *gorm.DB {
	op := datatable.NormalizeFilterOperator(f)
	if op == "" {
		return db
	}

	values := datatable.FilterValues(f)

	switch op {
	case "eq", "==", "=":
		return db.Where(fmt.Sprintf("%s = ?", column), f.Value)

	case "ne", "neq", "!=":
		return db.Where(fmt.Sprintf("%s <> ?", column), f.Value)

	case "ilike":
		return db.Where(fmt.Sprintf("%s ILIKE ?", column), "%"+f.Value+"%")

	case "notilike":
		return db.Where(fmt.Sprintf("%s NOT ILIKE ?", column), "%"+f.Value+"%")

	case "inarray", "in":
		if col.ID == "roles" || col.AccessorKey == "roles" {
			return applyJSONBRoleGrantsFilter(db, column, values, false)
		}
		if len(values) > 0 {
			return db.Where(fmt.Sprintf("%s IN ?", column), values)
		}
		return db.Where(fmt.Sprintf("%s IN (?)", column), []string{f.Value})

	case "notinarray", "notin":
		if col.ID == "roles" || col.AccessorKey == "roles" {
			return applyJSONBRoleGrantsFilter(db, column, values, true)
		}
		if len(values) > 0 {
			return db.Where(fmt.Sprintf("%s NOT IN ?", column), values)
		}
		return db.Where(fmt.Sprintf("%s NOT IN (?)", column), []string{f.Value})

	case "isempty":
		if col.IsJSON && col.Meta != nil && strings.EqualFold(col.Meta.Variant, datatable.VariantMultiSelect) {
			return db.Where(fmt.Sprintf("(COALESCE(%s::jsonb, '[]'::jsonb) = '[]'::jsonb OR %s IS NULL)", column, column))
		}
		return db.Where(datatable.EmptyCheckSQL(column, col))

	case "isnotempty":
		if col.IsJSON && col.Meta != nil && strings.EqualFold(col.Meta.Variant, datatable.VariantMultiSelect) {
			return db.Where(fmt.Sprintf("jsonb_array_length(COALESCE(%s::jsonb, '[]'::jsonb)) > 0", column))
		}
		return db.Where(datatable.NotEmptyCheckSQL(column, col))

	case "lt", "<":
		return db.Where(fmt.Sprintf("%s < ?", column), f.Value)
	case "lte", "<=":
		return db.Where(fmt.Sprintf("%s <= ?", column), f.Value)
	case "gt", ">":
		return db.Where(fmt.Sprintf("%s > ?", column), f.Value)
	case "gte", ">=":
		return db.Where(fmt.Sprintf("%s >= ?", column), f.Value)
	case "isbetween":
		if len(values) >= 2 {
			return db.Where(fmt.Sprintf("%s BETWEEN ? AND ?", column), values[0], values[1])
		}
	}

	if len(values) > 1 {
		return db.Where(fmt.Sprintf("%s IN ?", column), values)
	}

	if f.Value != "" {
		return db.Where(fmt.Sprintf("%s = ?", column), f.Value)
	}

	return db
}

func applyJSONBRoleGrantsFilter(db *gorm.DB, column string, values []string, negate bool) *gorm.DB {
	if len(values) == 0 {
		return db
	}
	clauses := make([]string, 0, len(values))
	args := make([]any, 0, len(values)*2)
	for _, role := range values {
		role = strings.TrimSpace(role)
		if role == "" {
			continue
		}
		clauses = append(clauses, fmt.Sprintf(
			"EXISTS (SELECT 1 FROM jsonb_array_elements_text(COALESCE(%s::jsonb, '[]'::jsonb)) AS elem WHERE elem = ? OR elem LIKE ?)",
			column,
		))
		args = append(args, role, role+":%")
	}
	if len(clauses) == 0 {
		return db
	}
	expr := "(" + strings.Join(clauses, " OR ") + ")"
	if negate {
		expr = "NOT " + expr
	}
	return db.Where(expr, args...)
}
