package postgresql

import (
	"fmt"
	"reflect"
	"strings"

	"github.com/flowtrove/packages/datatable"
	"gorm.io/gorm"
)

// RawQueryBuilder builds a raw SQL query with optional joins.
// Use FindRaw(...) then chain AddJoin(...) and call Run() to execute.
type RawQueryBuilder[T any] struct {
	db      *gorm.DB
	q       datatable.TableQuery
	columns []datatable.Column
	table   string
	where   string
	joins   []string
	limit   string
}

// FindRaw starts a raw query for the given table. Chain AddJoin(...) then call Run().
//
// For raw SQL with multiple columns, use FindRaw[map[string]any](...) so each row
// is returned as a map from column name to value. Example: FindRaw[map[string]any](...).Run()
func FindRaw[T any](db *gorm.DB, q datatable.TableQuery, columns []datatable.Column, table string) *RawQueryBuilder[T] {
	if q.Page < 1 {
		q.Page = 1
	}
	if q.PageSize < 1 {
		q.PageSize = 10
	}

	return &RawQueryBuilder[T]{
		db:      db,
		q:       q,
		columns: columns,
		table:   table,
		joins:   nil,
		limit:   fmt.Sprintf("%s %s", fmt.Sprintf("LIMIT %d", q.PageSize), fmt.Sprintf("OFFSET %d", (q.Page-1)*q.PageSize)),
		where:   datatable.ConditionsFromFiltersWithoutargs(q.Filters, q.JoinOperator, datatable.ColumnNameByID(columns)),
	}
}

// AddJoin appends a join clause (e.g. "LEFT JOIN departments ON users.department_id = departments.id").
// Returns the same builder so you can chain: FindRaw(...).AddJoin("...").AddJoin("...").Run()
func (b *RawQueryBuilder[T]) AddJoin(join string) *RawQueryBuilder[T] {
	if strings.TrimSpace(join) != "" {
		b.joins = append(b.joins, strings.TrimSpace(join))
	}
	return b
}

// Run builds the SQL (with all added joins), runs the query, and returns the list, pagination, and error.
//
// When T is map[string]any, each row is scanned into a map (column name -> value), which works for
// raw SELECTs with any number of columns. Use FindRaw[map[string]any](...).Run() for that case.
func (b *RawQueryBuilder[T]) Run() ([]T, datatable.Pagination, error) {
	var sql strings.Builder
	var totalSql strings.Builder

	fmt.Fprintf(&sql, "SELECT %s FROM %s", createSelect(b.columns), b.table)
	for _, j := range b.joins {
		fmt.Fprintf(&sql, " %s", j)
	}
	if b.where != "" {
		fmt.Fprintf(&sql, " WHERE %s", b.where)
	}
	if orderBy := datatable.OrderByClause(b.q.Sorts, datatable.ColumnNameByID(b.columns)); orderBy != "" {
		fmt.Fprintf(&sql, "%s", orderBy)
	}
	fmt.Fprintf(&sql, " %s\n", b.limit)

	fmt.Fprintf(&totalSql, "SELECT COUNT(*) FROM %s", b.table)
	for _, j := range b.joins {
		fmt.Fprintf(&totalSql, " %s", j)
	}
	if b.where != "" {
		fmt.Fprintf(&totalSql, " WHERE %s", b.where)
	}

	// When T is map[string]any, we scan each row into a map (one pointer per column).
	typ := reflect.TypeFor[T]()
	if typ.Kind() == reflect.Map && typ.Key().Kind() == reflect.String {
		return b.runScanIntoMaps(sql.String(), totalSql.String())
	}
	// Otherwise use Gorm's Scan into a slice of T (works for structs with matching fields).
	var dest []T
	if err := b.db.Raw(sql.String()).Scan(&dest).Error; err != nil {
		return nil, datatable.Pagination{}, err
	}
	return dest, datatable.Pagination{}, nil
}

// runScanIntoMaps runs the raw SQL and scans each row into map[string]any, then returns []T.
func (b *RawQueryBuilder[T]) runScanIntoMaps(sql string, totalSql string) ([]T, datatable.Pagination, error) {
	rows, err := b.db.Raw(sql).Rows()
	if err != nil {
		return nil, datatable.Pagination{}, err
	}
	defer rows.Close()

	cols, err := rows.Columns()
	if err != nil {
		return nil, datatable.Pagination{}, err
	}

	data := make([]T, 0)
	// One pointer per column so Scan can write into them.
	dest := make([]any, len(cols))
	destPtrs := make([]any, len(cols))
	for i := range dest {
		destPtrs[i] = &dest[i]
	}

	for rows.Next() {
		if err := rows.Scan(destPtrs...); err != nil {
			return nil, datatable.Pagination{}, err
		}
		row := make(map[string]any, len(cols))
		for i, c := range cols {
			v := dest[i]
			if b, ok := v.([]byte); ok {
				row[c] = string(b)
			} else {
				row[c] = v
			}
		}
		data = append(data, any(row).(T))
	}

	total, pageCount, err := b.getPageCalculation(totalSql, int64(b.q.PageSize))
	if err != nil {
		return nil, datatable.Pagination{}, err
	}

	return data, datatable.Pagination{
		Total:     total,
		PageCount: pageCount,
	}, nil
}

func createSelect(columns []datatable.Column) string {
	selects := make([]string, 0)
	for _, column := range columns {
		if column.SQLColumn != "" {
			selects = append(selects, fmt.Sprintf("%s as %s", column.SQLColumn, column.ID))
			continue
		}
		selects = append(selects, fmt.Sprintf("%s", column.ID))
	}
	return strings.Join(selects, ", ")
}

func (b *RawQueryBuilder[T]) getPageCalculation(totalSql string, perPage int64) (int64, int64, error) {
	var total int64 = 0
	if err := b.db.
		Raw(totalSql).
		Scan(&total).Error; err != nil {
		return 0, 0, err
	}
	if total == 0 {
		return total, 1, nil
	}
	if total%perPage == 0 {
		return total, total / perPage, nil
	}
	return total, (total / perPage) + 1, nil
}
