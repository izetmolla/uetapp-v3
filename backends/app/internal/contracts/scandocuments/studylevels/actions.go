package studylevels

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type CreateStudentScanLevelGroupRequest struct {
	Id          string   `json:"id"`
	Name        string   `json:"name"`
	Year        string   `json:"year"`
	Faculty     string   `json:"faculty"`
	StudyLevels []string `json:"study_levels"`
}

func parseStudyLevelIDs(raw []string) ([]int64, error) {
	if len(raw) == 0 {
		return nil, errors.New("at least one study level is required")
	}
	seen := make(map[int64]struct{}, len(raw))
	ids := make([]int64, 0, len(raw))
	for _, s := range raw {
		id, err := strconv.ParseInt(strings.TrimSpace(s), 10, 64)
		if err != nil || id <= 0 {
			return nil, fmt.Errorf("invalid study level id: %q", s)
		}
		if _, ok := seen[id]; ok {
			continue
		}
		seen[id] = struct{}{}
		ids = append(ids, id)
	}
	return ids, nil
}

func replaceGroupLevels(ctx context.Context, tx *gorm.DB, groupID int64, levelIDs []int64) error {
	var found int64
	if err := tx.WithContext(ctx).Model(&models.StudyLevel{}).Where("id IN ?", levelIDs).Count(&found).Error; err != nil {
		return err
	}
	if found != int64(len(levelIDs)) {
		return gorm.ErrRecordNotFound
	}

	if err := tx.WithContext(ctx).
		Where("student_scan_level_group_id = ?", groupID).
		Delete(&models.StudentScanLevelGroupLevels{}).Error; err != nil {
		return err
	}
	for _, levelID := range levelIDs {
		if err := tx.WithContext(ctx).Create(&models.StudentScanLevelGroupLevels{
			StudentScanLevelGroupID: groupID,
			StudyLevelID:            levelID,
		}).Error; err != nil {
			return err
		}
	}
	return nil
}

func (c *Controller) CreateStudentScanLevelGroupApi(ctx fiber.Ctx) error {
	r := c.app.Render()
	gctx := ctx.Context()
	db := c.app.Postgres()

	var req CreateStudentScanLevelGroupRequest
	if err := ctx.Bind().JSON(&req); err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	name := strings.TrimSpace(req.Name)
	if name == "" {
		return c.app.Api(ctx, r.WithError(errors.New("name is required")), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	levelIDs, err := parseStudyLevelIDs(req.StudyLevels)
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusBadRequest), r.WithCode("BAD_REQUEST"))
	}

	year, err := c.getAcademicYear(gctx, strings.TrimSpace(req.Year))
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
	}
	faculty, err := c.getFacultyBySlug(gctx, strings.TrimSpace(req.Faculty))
	if err != nil {
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
	}

	groupID, _ := strconv.ParseInt(strings.TrimSpace(req.Id), 10, 64)
	isUpdate := groupID > 0
	message := "Student scan level group created successfully"
	if isUpdate {
		message = "Student scan level group updated successfully"
	}

	var group models.StudentScanLevelGroup
	err = db.WithContext(gctx).Transaction(func(tx *gorm.DB) error {
		if isUpdate {
			if err := tx.Where("id = ? AND academic_year_id = ? AND faculty_id = ?", groupID, year.ID, faculty.ID).
				First(&group).Error; err != nil {
				return err
			}
			if err := tx.Model(&group).Update("name", name).Error; err != nil {
				return err
			}
		} else {
			group = models.StudentScanLevelGroup{
				Name:           name,
				AcademicYearID: year.ID,
				FacultyID:      faculty.ID,
			}
			if err := tx.Create(&group).Error; err != nil {
				return err
			}
		}
		return replaceGroupLevels(gctx, tx, group.ID, levelIDs)
	})
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return c.app.Api(ctx, r.WithError(errors.New("study level not found")), r.WithStatus(fiber.StatusNotFound), r.WithCode("NOT_FOUND"))
		}
		return c.app.Api(ctx, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return c.app.Api(ctx, r.WithData(fiber.Map{
		"success": true,
		"message": message,
		"data": fiber.Map{
			"id":           group.ID,
			"name":         name,
			"study_levels": req.StudyLevels,
		},
	}))
}
