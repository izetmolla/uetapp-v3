package syncstudents

import (
	"context"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"sync"

	"github.com/flowtrove/packages/models"
	"github.com/gosimple/slug"
	"golang.org/x/sync/singleflight"
	"gorm.io/gorm"
)

type importRefCache struct {
	mu              sync.Mutex
	sf              singleflight.Group
	faculties       map[string]models.Faculty
	studyPrograms   map[string]models.StudyProgram
	studyLevels     map[string]models.StudyLevel
	studyProfiles   map[string]models.StudyProfile
	studentStatuses map[string]models.StudentStatus
	academicYears   map[string]models.AcademicYear
}

func newImportRefCache() *importRefCache {
	return &importRefCache{
		faculties:       make(map[string]models.Faculty),
		studyPrograms:   make(map[string]models.StudyProgram),
		studyLevels:     make(map[string]models.StudyLevel),
		studyProfiles:   make(map[string]models.StudyProfile),
		studentStatuses: make(map[string]models.StudentStatus),
		academicYears:   make(map[string]models.AcademicYear),
	}
}

func isUniqueConstraintError(err error) bool {
	if err == nil {
		return false
	}
	msg := strings.ToLower(err.Error())
	return strings.Contains(msg, "duplicate") ||
		strings.Contains(msg, "unique constraint") ||
		strings.Contains(msg, "unique index") ||
		strings.Contains(msg, "23505")
}

func (cc *Controller) findFacultyByName(ctx context.Context, name string) (models.Faculty, error) {
	name = normalizeImportName(name)
	if name == "" {
		return models.Faculty{}, errors.New("faculty name must not be empty")
	}
	db := cc.app.Postgres().WithContext(ctx)
	var faculty models.Faculty
	err := db.Where("name = ?", name).First(&faculty).Error
	if err == nil {
		return faculty, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.Faculty{}, err
	}
	faculty = models.Faculty{Name: name, Slug: slug.Make(name)}
	if err := db.Create(&faculty).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := db.Where("name = ?", name).First(&faculty).Error; err != nil {
				return models.Faculty{}, err
			}
			return faculty, nil
		}
		return models.Faculty{}, err
	}
	return faculty, nil
}

func (cc *Controller) findStudyProgramByName(ctx context.Context, name string) (models.StudyProgram, error) {
	name = normalizeImportName(name)
	if name == "" {
		return models.StudyProgram{}, errors.New("study program name must not be empty")
	}
	db := cc.app.Postgres().WithContext(ctx)
	var studyProgram models.StudyProgram
	err := db.Where("name = ?", name).First(&studyProgram).Error
	if err == nil {
		return studyProgram, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.StudyProgram{}, err
	}
	studyProgram = models.StudyProgram{Name: name, Slug: slug.Make(name)}
	if err := db.Create(&studyProgram).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := db.Where("name = ?", name).First(&studyProgram).Error; err != nil {
				return models.StudyProgram{}, err
			}
			return studyProgram, nil
		}
		return models.StudyProgram{}, err
	}
	return studyProgram, nil
}

func (cc *Controller) findStudyLevelByName(ctx context.Context, name string) (models.StudyLevel, error) {
	name = normalizeImportName(name)
	if name == "" {
		return models.StudyLevel{}, errors.New("study level name must not be empty")
	}
	db := cc.app.Postgres().WithContext(ctx)
	var studyLevel models.StudyLevel
	err := db.Where("name = ?", name).First(&studyLevel).Error
	if err == nil {
		return studyLevel, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.StudyLevel{}, err
	}
	studyLevel = models.StudyLevel{Name: name, Slug: slug.Make(name)}
	if err := db.Create(&studyLevel).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := db.Where("name = ?", name).First(&studyLevel).Error; err != nil {
				return models.StudyLevel{}, err
			}
			return studyLevel, nil
		}
		return models.StudyLevel{}, err
	}
	return studyLevel, nil
}

func (cc *Controller) findStudyProfileByName(ctx context.Context, name string) (models.StudyProfile, error) {
	name = normalizeImportName(name)
	if name == "" {
		return models.StudyProfile{}, nil
	}
	db := cc.app.Postgres().WithContext(ctx)
	var studyProfile models.StudyProfile
	err := db.Where("name = ?", name).First(&studyProfile).Error
	if err == nil {
		return studyProfile, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.StudyProfile{}, err
	}
	studyProfile = models.StudyProfile{Name: name, Slug: slug.Make(name)}
	if err := db.Create(&studyProfile).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := db.Where("name = ?", name).First(&studyProfile).Error; err != nil {
				return models.StudyProfile{}, err
			}
			return studyProfile, nil
		}
		return models.StudyProfile{}, err
	}
	return studyProfile, nil
}

func (cc *Controller) findStudentStatusByName(ctx context.Context, name, statusType string) (models.StudentStatus, error) {
	name = normalizeImportName(name)
	if name == "" {
		return models.StudentStatus{}, errors.New("student status name must not be empty")
	}
	db := cc.app.Postgres().WithContext(ctx)
	var studentStatus models.StudentStatus
	err := db.Where("name = ?", name).First(&studentStatus).Error
	if err == nil {
		return studentStatus, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.StudentStatus{}, err
	}
	studentStatus = models.StudentStatus{
		Name: name,
		Slug: slug.Make(name),
		Type: normalizeImportName(statusType),
	}
	if err := db.Create(&studentStatus).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := db.Where("name = ?", name).First(&studentStatus).Error; err != nil {
				return models.StudentStatus{}, err
			}
			return studentStatus, nil
		}
		return models.StudentStatus{}, err
	}
	return studentStatus, nil
}

func (cc *Controller) findAcademicYearByRegYear(ctx context.Context, year string) (models.AcademicYear, error) {
	year = normalizeImportName(year)
	if year == "" {
		return models.AcademicYear{}, errors.New("academic year year must not be empty")
	}
	yearInt, err := strconv.Atoi(year)
	if err != nil {
		return models.AcademicYear{}, err
	}
	yearLabel := fmt.Sprintf("%d-%d", yearInt, yearInt+1)

	db := cc.app.Postgres().WithContext(ctx)
	var academicYear models.AcademicYear
	err = db.Where("year = ?", yearLabel).First(&academicYear).Error
	if err == nil {
		return academicYear, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return models.AcademicYear{}, err
	}
	academicYear = models.AcademicYear{Year: yearLabel}
	if err := db.Create(&academicYear).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := db.Where("year = ?", yearLabel).First(&academicYear).Error; err != nil {
				return models.AcademicYear{}, err
			}
			return academicYear, nil
		}
		return models.AcademicYear{}, err
	}
	return academicYear, nil
}

func cachedImportRef[T any](
	c *importRefCache,
	sfKey string,
	cache map[string]T,
	key string,
	load func() (T, error),
) (T, error) {
	var zero T
	c.mu.Lock()
	if cached, ok := cache[key]; ok {
		c.mu.Unlock()
		return cached, nil
	}
	c.mu.Unlock()

	v, err, _ := c.sf.Do(sfKey, func() (any, error) {
		c.mu.Lock()
		if cached, ok := cache[key]; ok {
			c.mu.Unlock()
			return cached, nil
		}
		c.mu.Unlock()

		item, err := load()
		if err != nil {
			return zero, err
		}
		c.mu.Lock()
		cache[key] = item
		c.mu.Unlock()
		return item, nil
	})
	if err != nil {
		return zero, err
	}
	return v.(T), nil
}

func (c *importRefCache) faculty(ctx context.Context, cc *Controller, name string) (models.Faculty, error) {
	key := normalizeImportName(name)
	return cachedImportRef(c, "faculty:"+key, c.faculties, key, func() (models.Faculty, error) {
		return cc.findFacultyByName(ctx, key)
	})
}

func (c *importRefCache) studyProgram(ctx context.Context, cc *Controller, name string) (models.StudyProgram, error) {
	key := normalizeImportName(name)
	return cachedImportRef(c, "study_program:"+key, c.studyPrograms, key, func() (models.StudyProgram, error) {
		return cc.findStudyProgramByName(ctx, key)
	})
}

func (c *importRefCache) studyLevel(ctx context.Context, cc *Controller, name string) (models.StudyLevel, error) {
	key := normalizeImportName(name)
	return cachedImportRef(c, "study_level:"+key, c.studyLevels, key, func() (models.StudyLevel, error) {
		return cc.findStudyLevelByName(ctx, key)
	})
}

func (c *importRefCache) studyProfile(ctx context.Context, cc *Controller, name string) (models.StudyProfile, error) {
	key := normalizeImportName(name)
	if key == "" {
		return models.StudyProfile{}, nil
	}
	return cachedImportRef(c, "study_profile:"+key, c.studyProfiles, key, func() (models.StudyProfile, error) {
		return cc.findStudyProfileByName(ctx, key)
	})
}

func (c *importRefCache) studentStatus(ctx context.Context, cc *Controller, name, statusType string) (models.StudentStatus, error) {
	key := normalizeImportName(name)
	statusType = normalizeImportName(statusType)
	return cachedImportRef(c, "student_status:"+key, c.studentStatuses, key, func() (models.StudentStatus, error) {
		return cc.findStudentStatusByName(ctx, key, statusType)
	})
}

func (c *importRefCache) academicYear(ctx context.Context, cc *Controller, year string) (models.AcademicYear, error) {
	key := normalizeImportName(year)
	return cachedImportRef(c, "academic_year:"+key, c.academicYears, key, func() (models.AcademicYear, error) {
		return cc.findAcademicYearByRegYear(ctx, key)
	})
}
