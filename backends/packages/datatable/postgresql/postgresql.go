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

	// Apply filters.
	for _, f := range q.Filters {
		colName, ok := columnNameByID[f.ID]
		if !ok {
			continue
		}
		query = applyFilter(query, colName, f)
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
func applyFilter(db *gorm.DB, column string, f datatable.Filter) *gorm.DB {
	op := strings.ToLower(f.Operator)

	// Normalise "simple" mode (no explicit operator).
	if op == "" {
		switch {
		case len(f.Values) == 0 && f.Value != "":
			op = "eq"
		case len(f.Values) == 1:
			op = "eq"
		case len(f.Values) > 1:
			op = "inarray"
		}
	}

	switch op {
	case "eq", "==", "=":
		return db.Where(fmt.Sprintf("%s = ?", column), f.Value)

	case "ne", "neq", "!=":
		return db.Where(fmt.Sprintf("%s <> ?", column), f.Value)

	case "ilike":
		// Case-insensitive partial match.
		return db.Where(fmt.Sprintf("%s ILIKE ?", column), "%"+f.Value+"%")

	case "notilike":
		return db.Where(fmt.Sprintf("%s NOT ILIKE ?", column), "%"+f.Value+"%")

	case "inarray", "in":
		// Prefer Values slice; fall back to single Value.
		if len(f.Values) > 0 {
			return db.Where(fmt.Sprintf("%s IN ?", column), f.Values)
		}
		return db.Where(fmt.Sprintf("%s IN (?)", column), []string{f.Value})

	case "notinarray", "notin":
		if len(f.Values) > 0 {
			return db.Where(fmt.Sprintf("%s NOT IN ?", column), f.Values)
		}
		return db.Where(fmt.Sprintf("%s NOT IN (?)", column), []string{f.Value})

	case "isempty":
		return db.Where(fmt.Sprintf("(%s IS NULL OR %s = '')", column, column))

	case "isnotempty":
		return db.Where(fmt.Sprintf("(%s IS NOT NULL AND %s <> '')", column, column))
	}

	// Fallback: if we have multiple values, use IN; otherwise equality.
	if len(f.Values) > 1 {
		return db.Where(fmt.Sprintf("%s IN ?", column), f.Values)
	}

	if f.Value != "" {
		return db.Where(fmt.Sprintf("%s = ?", column), f.Value)
	}

	return db
}
