package folders

import (
	"context"
	"time"
)

type folderRow struct {
	ID           int64      `gorm:"column:id"`
	Name         string     `gorm:"column:name"`
	Students     int64      `gorm:"column:students"`
	Scanned      int64      `gorm:"column:scanned"`
	LastModified *time.Time `gorm:"column:last_modified"`
}

type FolderListItem struct {
	ID           int64  `json:"id"`
	Name         string `json:"name"`
	Students     int64  `json:"students"`
	Scanned      int64  `json:"scanned"`
	Status       string `json:"status"`
	LastModified string `json:"last_modified"`
}

type FoldersStats struct {
	TotalFolders   int64   `json:"total_folders"`
	TotalStudents  int64   `json:"total_students"`
	ScannedCount   int64   `json:"scanned_count"`
	ScannedPercent int     `json:"scanned_percent"`
	LastUpdated    *string `json:"last_updated"`
}

func (c *Controller) listFoldersWithStats(
	ctx context.Context,
	academicYearID, facultyID, studyLevelGroupID int64,
) ([]FolderListItem, FoldersStats, error) {
	db := c.app.Postgres()

	var rows []folderRow
	err := db.WithContext(ctx).Raw(`
SELECT
	f.id,
	f.name,
	COUNT(d.id) AS students,
	COUNT(d.id) FILTER (WHERE d.completed = true) AS scanned,
	MAX(d.updated_at) AS last_modified
FROM student_scan_folders f
LEFT JOIN student_scan_folder_docs d
	ON d.student_scan_folder_id = f.id AND d.deleted_at IS NULL
WHERE f.deleted_at IS NULL
	AND f.academic_year_id = ?
	AND f.faculty_id = ?
	AND f.study_level_group_id = ?
GROUP BY f.id, f.name
ORDER BY f.name ASC
`, academicYearID, facultyID, studyLevelGroupID).Scan(&rows).Error
	if err != nil {
		return nil, FoldersStats{}, err
	}

	items := make([]FolderListItem, 0, len(rows))
	var totalStudents, scannedCount int64
	var latest *time.Time

	for _, row := range rows {
		status := folderStatus(row.Students, row.Scanned)
		lastMod := ""
		if row.LastModified != nil {
			if latest == nil || row.LastModified.After(*latest) {
				t := *row.LastModified
				latest = &t
			}
			lastMod = row.LastModified.Format(time.RFC3339)
		}
		items = append(items, FolderListItem{
			ID:           row.ID,
			Name:         row.Name,
			Students:     row.Students,
			Scanned:      row.Scanned,
			Status:       status,
			LastModified: lastMod,
		})
		totalStudents += row.Students
		scannedCount += row.Scanned
	}

	scannedPct := 0
	if totalStudents > 0 {
		scannedPct = int((scannedCount * 100) / totalStudents)
	}

	stats := FoldersStats{
		TotalFolders:   int64(len(items)),
		TotalStudents:  totalStudents,
		ScannedCount:   scannedCount,
		ScannedPercent: scannedPct,
	}
	if latest != nil {
		s := latest.Format("2006-01-02")
		stats.LastUpdated = &s
	}

	return items, stats, nil
}

func folderStatus(students, scanned int64) string {
	if students == 0 {
		return "Pending"
	}
	if scanned >= students {
		return "Complete"
	}
	if scanned > 0 {
		return "In Progress"
	}
	return "Pending"
}
