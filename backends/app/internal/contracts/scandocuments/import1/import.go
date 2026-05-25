package importstudents

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/gosimple/slug"
	"gorm.io/gorm"
)

type ImportStudentsRequest struct {
	Students            []string `json:"students"`
	StudentScanFolderID int64    `json:"folder_id"`
}

type ImportLogError struct {
	Identifier string `json:"identifier"`
	SPID       string `json:"sp_id,omitempty"`
	DocumentID string `json:"document_id,omitempty"`
	Message    string `json:"message"`
}

type importLog struct {
	spID       string
	documentID string
	errors     []ImportLogError
}

func newImportLog(student AthenaUser) *importLog {
	return &importLog{
		spID:       student.SPID,
		documentID: student.DocumentID,
	}
}

func (l *importLog) fail(identifier string, err error) {
	if err == nil {
		return
	}
	l.errors = append(l.errors, ImportLogError{
		Identifier: identifier,
		SPID:       l.spID,
		DocumentID: l.documentID,
		Message:    err.Error(),
	})
}

func (l *importLog) hasErrors() bool {
	return len(l.errors) > 0
}

func (l *importLog) all() []ImportLogError {
	if l.errors == nil {
		return []ImportLogError{}
	}
	return l.errors
}

func (cc *Controller) ImportStudents(c fiber.Ctx) error {
	r := cc.app.Render()

	var req ImportStudentsRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c, r.WithError(err))
	}

	students, err := cc.loadStudentsFromAthena(c.Context(), req.Students)
	if err != nil {
		return cc.app.Api(c, r.WithError(err))
	}
	// Use a worker pool to perform concurrent DB insert/update without overwhelming DB
	const maxWorkers = 8
	type result struct {
		Errors []ImportLogError
	}

	studentCh := make(chan *AthenaUser)
	resultCh := make(chan result)
	ctx := c.Context()

	// Start workers
	for range maxWorkers {
		go func() {
			for student := range studentCh {
				_, importErrors := cc.insertOrUpdateStudents(ctx, student, req.StudentScanFolderID)
				resultCh <- result{Errors: importErrors}
			}
		}()
	}

	// Distribute work
	go func() {
		for i := range students {
			student := students[i] // capture pointer to current student
			studentCh <- &student
		}
		close(studentCh)
	}()

	// Collect results from concurrent workers
	var importErrors []ImportLogError
	for range students {
		res := <-resultCh
		if len(res.Errors) > 0 {
			importErrors = append(importErrors, res.Errors...)
		}
	}

	if len(importErrors) > 0 {
		return cc.app.Api(c, r.WithData(fiber.Map{
			"success":  false,
			"message":  fmt.Sprintf("%d import step(s) failed", len(importErrors)),
			"errors":   importErrors,
			"students": students,
		}))
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"message":  "Students imported successfully",
		"success":  true,
		"students": students,
		"errors":   []ImportLogError{},
	}))
}

func (cc *Controller) ensureStudentScanFolderDoc(reqCtx context.Context, folderID, studentID int64, name string, log *importLog) {
	if folderID <= 0 || studentID <= 0 {
		return
	}

	db := cc.app.Postgres().WithContext(reqCtx)
	var count int64
	if err := db.Model(&models.StudentScanFolderDoc{}).
		Where("student_id = ? AND student_scan_folder_id = ?", studentID, folderID).
		Count(&count).Error; err != nil {
		log.fail("student_scan_folder_doc.find", err)
		return
	}
	if count > 0 {
		return
	}

	if err := db.Create(&models.StudentScanFolderDoc{
		StudentScanFolderID: folderID,
		StudentID:           studentID,
		Name:                strings.TrimSpace(name),
	}).Error; err != nil {
		log.fail("student_scan_folder_doc.create", err)
	}
}

func studentScanFolderDocName(student AthenaUser) string {
	return strings.TrimSpace(strings.Join([]string{student.Firstname, student.Surname}, " "))
}

// Finctions for updating the students and their study programs
func (cc *Controller) loadStudentsFromAthena(reqCtx context.Context, students []string) ([]AthenaUser, error) {
	db := cc.app.Postgres()
	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(reqCtx)
	if err != nil {
		return nil, err
	}
	ids, _ := json.Marshal(students)
	res, err := httprequest.Execute[map[string]any](httprequest.New(&httprequest.HttpRequestDriver{
		Url:    resource.Config["url"].(string),
		Method: resource.Config["method"].(string),
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"Authorization": "Bearer " + resource.Config["authorization"].(string),
		},
		Params: map[string]any{
			"action": "getStudentsBySPids",
			"ids":    string(ids),
		},
	}))
	if err != nil {
		return nil, err
	}
	users, err := parseAthenaUsers(res.Body)
	if err != nil {
		return nil, err
	}

	return users, nil
}

func (cc *Controller) insertOrUpdateStudents(reqCtx context.Context, student *AthenaUser, folderID int64) (models.Student, []ImportLogError) {
	log := newImportLog(*student)
	db := cc.app.Postgres()
	if student.DocumentID == "" || len(student.DocumentID) < 3 {
		log.fail("student.validate", errors.New("document ID is required"))
		return models.Student{}, log.all()
	}
	studentModel, err := gorm.G[models.Student](db).
		Select("id").
		Where("id_number = ?", student.DocumentID).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.createStudent(reqCtx, *student, folderID, log)
		}
		log.fail("student.find", err)
		return models.Student{}, log.all()
	}
	if studentModel.ID > 0 {
		cc.updateStudent(reqCtx, studentModel.ID, *student, folderID, log)
		return studentModel, log.all()
	}
	return studentModel, log.all()
}

func (cc *Controller) createStudent(reqCtx context.Context, student AthenaUser, folderID int64, log *importLog) (models.Student, []ImportLogError) {
	db := cc.app.Postgres()

	studentModel := &models.Student{
		Firstname: student.Firstname,
		Lastname:  student.Surname,
		Email:     student.Email,
		IdNumber:  student.DocumentID,
	}

	if err := gorm.G[models.Student](db).Create(reqCtx, studentModel); err != nil {
		log.fail("student.create", err)
		return models.Student{}, log.all()
	}
	cc.ensureStudentStudyProgram(reqCtx, studentModel.ID, student, log)
	cc.ensureStudentScanFolderDoc(reqCtx, folderID, studentModel.ID, studentScanFolderDocName(student), log)

	return *studentModel, log.all()
}

func (cc *Controller) updateStudent(reqCtx context.Context, id int64, student AthenaUser, folderID int64, log *importLog) {
	db := cc.app.Postgres()

	if _, err := gorm.G[models.Student](db).Where("id = ?", id).Updates(reqCtx, models.Student{
		Firstname: student.Firstname,
		Lastname:  student.Surname,
		Email:     student.Email,
		IdNumber:  student.DocumentID,
	}); err != nil {
		log.fail("student.update", err)
		return
	}

	cc.ensureStudentStudyProgram(reqCtx, id, student, log)
	cc.ensureStudentScanFolderDoc(reqCtx, folderID, id, studentScanFolderDocName(student), log)
}

func studentStudyProgramScope(program models.StudentStudyProgram) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		query := db.Where(
			"student_id = ? AND study_program_id = ? AND status = ? AND faculty_id = ? AND study_level_id = ? AND reg_year_id = ?",
			program.StudentID,
			program.StudyProgramID,
			program.StudentStatusID,
			program.FacultyID,
			program.StudyLevelID,
			program.RegYearId,
		)
		if program.StudyProfileID != nil {
			return query.Where("study_profile_id = ?", *program.StudyProfileID)
		}
		return query.Where("study_profile_id IS NULL")
	}
}

func (cc *Controller) ensureStudentStudyProgram(reqCtx context.Context, studentID int64, student AthenaUser, log *importLog) {
	program, ok := cc.buildStudentStudyProgram(reqCtx, studentID, student, log)
	if !ok {
		return
	}

	db := cc.app.Postgres().WithContext(reqCtx)
	scope := studentStudyProgramScope(program)

	var existing models.StudentStudyProgram
	err := db.Model(&models.StudentStudyProgram{}).Scopes(scope).First(&existing).Error
	if err == nil {
		updates := studentStudyProgramImportChanges(existing, program)
		if len(updates) == 0 {
			return
		}
		if err := db.Model(&models.StudentStudyProgram{}).
			Scopes(scope).
			Updates(updates).Error; err != nil {
			log.fail("student_study_program.update", err)
		}
		return
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.fail("student_study_program.find", err)
		return
	}

	if err := db.Create(&program).Error; err != nil {
		log.fail("student_study_program.create", err)
	}
}

func applyStudentStudyProgramImportFields(program *models.StudentStudyProgram, student AthenaUser) {
	for _, field := range studentStudyProgramImportFields {
		field.apply(program, student)
	}
}

func studentStudyProgramImportChanges(existing, incoming models.StudentStudyProgram) map[string]any {
	updates := make(map[string]any)
	for _, field := range studentStudyProgramImportFields {
		field.addChange(updates, existing, incoming)
	}
	return updates
}

type studentStudyProgramImportField struct {
	column string
	get    func(models.StudentStudyProgram) *string
	set    func(*models.StudentStudyProgram, *string)
	from   func(AthenaUser) *string
}

func (f studentStudyProgramImportField) apply(program *models.StudentStudyProgram, student AthenaUser) {
	f.set(program, f.from(student))
}

func (f studentStudyProgramImportField) addChange(updates map[string]any, existing, incoming models.StudentStudyProgram) {
	next := f.get(incoming)
	if !stringPtrChanged(f.get(existing), next) {
		return
	}
	updates[f.column] = next
}

var studentStudyProgramImportFields = []studentStudyProgramImportField{
	{
		column: "authena_user_id",
		get:    func(p models.StudentStudyProgram) *string { return p.AuthenaUserID },
		set:    func(p *models.StudentStudyProgram, v *string) { p.AuthenaUserID = v },
		from:   func(s AthenaUser) *string { return optionalStringPtr(s.SPID) },
	},
	{
		column: "ums_user_id",
		get:    func(p models.StudentStudyProgram) *string { return p.UMSUserID },
		set:    func(p *models.StudentStudyProgram, v *string) { p.UMSUserID = v },
		from:   func(s AthenaUser) *string { return optionalStringPtr(s.PersonID) },
	},
	{
		column: "academic_email",
		get:    func(p models.StudentStudyProgram) *string { return p.AcademicEmail },
		set:    func(p *models.StudentStudyProgram, v *string) { p.AcademicEmail = v },
		from:   func(s AthenaUser) *string { return optionalStringPtr(s.EmailUET) },
	},
}

func optionalStringPtr(value string) *string {
	if value == "" {
		return nil
	}
	return &value
}

func stringPtrChanged(current, next *string) bool {
	if next == nil {
		return false
	}
	if current == nil {
		return true
	}
	return *current != *next
}

func (cc *Controller) buildStudentStudyProgram(reqCtx context.Context, studentID int64, student AthenaUser, log *importLog) (models.StudentStudyProgram, bool) {
	facultyModel, err := cc.getOrCreateFaculty(reqCtx, student.Faculty)
	if err != nil {
		log.fail("faculty.create", err)
		return models.StudentStudyProgram{}, false
	}
	studyProgramModel, err := cc.getOrCreateStudyProgram(reqCtx, student.Program)
	if err != nil {
		log.fail("study_program.create", err)
		return models.StudentStudyProgram{}, false
	}
	studyLevelModel, err := cc.getOrCreateStudyLevel(reqCtx, student.StudyLevel)
	if err != nil {
		log.fail("study_level.create", err)
		return models.StudentStudyProgram{}, false
	}
	studyProfileModel, err := cc.getOrCreateStudyProfile(reqCtx, student.ProgramSpecialty)
	if err != nil {
		log.fail("study_profile.create", err)
		return models.StudentStudyProgram{}, false
	}
	studentStatusModel, err := cc.getOrCreateStudentStatus(reqCtx, student.Status, student.StatusType)
	if err != nil {
		log.fail("student_status.create", err)
		return models.StudentStudyProgram{}, false
	}
	academicYearModel, err := cc.getOrCreateAcademicYear(reqCtx, student.RegYear)
	if err != nil {
		log.fail("academic_year.create", err)
		return models.StudentStudyProgram{}, false
	}
	var studyProfileModelID *int64
	if studyProfileModel.ID > 0 {
		studyProfileModelID = &studyProfileModel.ID
	}

	program := models.StudentStudyProgram{
		StudentID:       studentID,
		FacultyID:       facultyModel.ID,
		StudyProgramID:  studyProgramModel.ID,
		StudentStatusID: studentStatusModel.ID,
		StudyLevelID:    studyLevelModel.ID,
		StudyProfileID:  studyProfileModelID,
		RegYearId:       academicYearModel.ID,
	}
	applyStudentStudyProgramImportFields(&program, student)

	return program, true
}

func (cc *Controller) getOrCreateStudyLevel(reqCtx context.Context, name string) (models.StudyLevel, error) {
	db := cc.app.Postgres()
	if name == "" {
		return models.StudyLevel{}, errors.New("study level name must not be empty")
	}
	studyLevel, err := gorm.G[models.StudyLevel](db).
		Where("name = ?", name).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyLevel = models.StudyLevel{Name: name, Slug: slug.Make(name)}
			if err := db.Create(&studyLevel).Error; err != nil {
				return models.StudyLevel{}, err
			}
			return studyLevel, nil
		} else {
			return models.StudyLevel{}, err
		}
	}
	return studyLevel, nil
}

func (cc *Controller) getOrCreateStudyProgram(reqCtx context.Context, name string) (models.StudyProgram, error) {
	db := cc.app.Postgres()
	if name == "" {
		return models.StudyProgram{}, errors.New("study program name must not be empty")
	}
	studyProgram, err := gorm.G[models.StudyProgram](db).
		Where("name = ?", name).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyProgram = models.StudyProgram{Name: name, Slug: slug.Make(name)}
			if err := db.Create(&studyProgram).Error; err != nil {
				return models.StudyProgram{}, err
			}
			return studyProgram, nil
		} else {
			return models.StudyProgram{}, err
		}
	}
	return studyProgram, nil
}

func (cc *Controller) getOrCreateStudyProfile(reqCtx context.Context, name string) (models.StudyProfile, error) {
	db := cc.app.Postgres()
	if name == "" {
		return models.StudyProfile{}, nil
	}
	studyProfile, err := gorm.G[models.StudyProfile](db).
		Where("name = ?", name).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studyProfile = models.StudyProfile{Name: name, Slug: slug.Make(name)}
			if err := db.Create(&studyProfile).Error; err != nil {
				return models.StudyProfile{}, err
			}
			return studyProfile, nil
		} else {
			return models.StudyProfile{}, err
		}
	}
	return studyProfile, nil
}

func (cc *Controller) getOrCreateFaculty(reqCtx context.Context, name string) (models.Faculty, error) {
	db := cc.app.Postgres()
	if name == "" {
		return models.Faculty{}, errors.New("faculty name must not be empty")
	}
	faculty, err := gorm.G[models.Faculty](db).
		Where("name = ?", name).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			faculty = models.Faculty{Name: name, Slug: slug.Make(name)}
			if err := db.Create(&faculty).Error; err != nil {
				return models.Faculty{}, err
			}
			return faculty, nil
		} else {
			return models.Faculty{}, err
		}
	}
	return faculty, nil
}

func (cc *Controller) getOrCreateStudentStatus(reqCtx context.Context, name, statusType string) (models.StudentStatus, error) {
	db := cc.app.Postgres()
	if name == "" {
		return models.StudentStatus{}, errors.New("student status name must not be empty")
	}
	studentStatus, err := gorm.G[models.StudentStatus](db).
		Where("name = ?", name).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			studentStatus = models.StudentStatus{
				Name: name,
				Slug: slug.Make(name),
				Type: statusType,
			}
			if err := db.Create(&studentStatus).Error; err != nil {
				return models.StudentStatus{}, err
			}
			return studentStatus, nil
		} else {
			return models.StudentStatus{}, err
		}
	}
	return studentStatus, nil
}

func (cc *Controller) getOrCreateAcademicYear(reqCtx context.Context, year string) (models.AcademicYear, error) {
	db := cc.app.Postgres()
	if year == "" {
		return models.AcademicYear{}, errors.New("academic year year must not be empty")
	}
	yearInt, err := strconv.Atoi(year)
	if err != nil {
		return models.AcademicYear{}, err
	}
	academicYear, err := gorm.G[models.AcademicYear](db).
		Where("year = ?", fmt.Sprintf("%d-%d", yearInt, yearInt+1)).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			academicYear = models.AcademicYear{Year: fmt.Sprintf("%d-%d", yearInt, yearInt+1)}
			if err := db.Create(&academicYear).Error; err != nil {
				return models.AcademicYear{}, err
			}
			return academicYear, nil
		} else {
			return models.AcademicYear{}, err
		}
	}
	return academicYear, nil
}
