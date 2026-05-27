package syncstudents

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"regexp"
	"strconv"
	"strings"
	"sync"

	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gosimple/slug"
	"github.com/uetedu/app/config"
	"golang.org/x/sync/singleflight"
	"gorm.io/gorm"
)

// documentIDRegex: alphanumeric only, minimum 7 characters (no spaces or symbols).
var documentIDRegex = regexp.MustCompile(`^[a-zA-Z0-9]{7,}$`)

// --- controller ---

type Controller struct {
	app *config.AppClients
}

func New(app *config.AppClients) *Controller {
	return &Controller{app: app}
}

// --- API types ---

type ImportStudentsRequest struct {
	Students   []string `json:"students"`
	DocumentID string   `json:"document_id"`
}

type ImportStudentsResult struct {
	Success  bool             `json:"success"`
	Message  string           `json:"message"`
	Errors   []ImportLogError `json:"errors"`
	Students []models.Student `json:"students"`
}

type ImportLogError struct {
	Identifier string `json:"identifier"`
	SPID       string `json:"sp_id,omitempty"`
	DocumentID string `json:"document_id,omitempty"`
	Message    string `json:"message"`
}

// AthenaUser mirrors a row from the athena_users source.
type AthenaUser struct {
	StudentFID       string `json:"student_fid"`
	SPID             string `json:"sp_id"`
	PersonID         string `json:"person_id"`
	Status           string `json:"status"`
	StatusType       string `json:"status_type"`
	Surname          string `json:"surname"`
	Firstname        string `json:"firstname"`
	Fathersname      string `json:"fathersname"`
	Phone            string `json:"phone"`
	Mobile           string `json:"mobile"`
	Email            string `json:"email"`
	EmailUET         string `json:"email_uet"`
	DocumentID       string `json:"document_id"`
	DocumentType     string `json:"document_type"`
	Department       string `json:"department"`
	ProgramID        string `json:"program_id"`
	Program          string `json:"program"`
	ProgramSpecialty string `json:"program_specialty"`
	RegDate          string `json:"reg_date"`
	RegYear          string `json:"reg_year"`
	Faculty          string `json:"faculty"`
	StudyLevel       string `json:"study_level"`
	Nationality      string `json:"nationality"`
	NatCode          string `json:"nat_code"`
	City             string `json:"city"`
	Address          string `json:"address"`
	Lastsyncdate     string `json:"lastsyncdate"`
}

// --- import orchestration ---

const importWorkerCount = 8

func (cc *Controller) ImportStudents(ctx context.Context, req ImportStudentsRequest) (ImportStudentsResult, error) {
	users, err := cc.loadStudentsFromAthena(ctx, req.DocumentID, req.Students)
	if err != nil {
		return ImportStudentsResult{}, err
	}
	if len(users) == 0 {
		return ImportStudentsResult{
			Success:  true,
			Message:  "Students imported successfully",
			Students: []models.Student{},
			Errors:   []ImportLogError{},
		}, nil
	}

	batches := groupAthenaUsersByDocumentID(users)

	refCache := newImportRefCache()
	studentCh := make(chan athenaStudentImport)
	resultCh := make(chan importWorkerResult, len(batches))

	for range importWorkerCount {
		go func() {
			for batch := range studentCh {
				model, errs := cc.insertOrUpdateStudents(ctx, batch, refCache)
				resultCh <- importWorkerResult{student: model, errors: errs}
			}
		}()
	}

	go func() {
		for i := range batches {
			studentCh <- batches[i]
		}
		close(studentCh)
	}()

	var students []models.Student
	var importErrors []ImportLogError
	for range batches {
		res := <-resultCh
		if res.student.ID > 0 {
			students = append(students, res.student)
		}
		if len(res.errors) > 0 {
			importErrors = append(importErrors, res.errors...)
		}
	}

	if len(importErrors) > 0 {
		return ImportStudentsResult{
			Success:  false,
			Message:  fmt.Sprintf("%d import step(s) failed", len(importErrors)),
			Errors:   importErrors,
			Students: students,
		}, nil
	}

	return ImportStudentsResult{
		Success:  true,
		Message:  "Students imported successfully",
		Students: students,
		Errors:   []ImportLogError{},
	}, nil
}

type importWorkerResult struct {
	student models.Student
	errors  []ImportLogError
}

// --- import logging ---

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

func (l *importLog) all() []ImportLogError {
	if l.errors == nil {
		return []ImportLogError{}
	}
	return l.errors
}

// --- Athena fetch & parse ---

func parseAthenaUsers(body map[string]any) ([]AthenaUser, error) {
	return parseBodyRecords(body, athenaUserFromRecord)
}

func athenaUserFromRecord(record map[string]any) AthenaUser {
	return AthenaUser{
		StudentFID:       optionalString(record["student_fid"]),
		SPID:             normalizeImportName(optionalString(record["sp_id"])),
		PersonID:         optionalString(record["person_id"]),
		Status:           normalizeImportName(optionalString(record["status"])),
		StatusType:       normalizeImportName(optionalString(record["status_type"])),
		Surname:          optionalString(record["surname"]),
		Firstname:        optionalString(record["firstname"]),
		Fathersname:      optionalString(record["fathersname"]),
		Phone:            optionalString(record["phone"]),
		Mobile:           optionalString(record["mobile"]),
		Email:            optionalString(record["email"]),
		EmailUET:         optionalString(record["email_uet"]),
		DocumentID:       normalizeDocumentID(optionalString(record["document_id"])),
		DocumentType:     optionalString(record["document_type"]),
		Department:       optionalString(record["department"]),
		ProgramID:        optionalString(record["program_id"]),
		Program:          normalizeProgramImportName(optionalString(record["program"])),
		ProgramSpecialty: normalizeProgramImportName(optionalString(record["program_specialty"])),
		RegDate:          optionalString(record["reg_date"]),
		RegYear:          normalizeImportName(optionalString(record["reg_year"])),
		Faculty:          normalizeImportName(optionalString(record["faculty"])),
		StudyLevel:       normalizeImportName(optionalString(record["study_level"])),
		Nationality:      optionalString(record["nationality"]),
		NatCode:          optionalString(record["nat_code"]),
		City:             optionalString(record["city"]),
		Address:          optionalString(record["address"]),
		Lastsyncdate:     optionalString(record["lastsyncdate"]),
	}
}

func (cc *Controller) loadStudentsFromAthena(reqCtx context.Context, documentID string, students []string) ([]AthenaUser, error) {
	if len(students) == 0 {
		return nil, nil
	}

	db := cc.app.Postgres()
	resource, err := gorm.G[models.Resource](db).
		Select("id", "config").
		Where("id = ?", 3).
		First(reqCtx)
	if err != nil {
		return nil, err
	}

	documentID = normalizeDocumentID(documentID)
	all := make([]AthenaUser, 0, len(students))
	for _, batch := range chunkStrings(students, athenaSPIDBatchSize) {
		users, err := cc.fetchAthenaStudentsBySPIDs(reqCtx, resource, documentID, batch)
		if err != nil {
			return nil, err
		}
		all = append(all, users...)
	}
	return all, nil
}

func (cc *Controller) fetchAthenaStudentsBySPIDs(reqCtx context.Context, resource models.Resource, documentID string, spIDs []string) ([]AthenaUser, error) {
	idsJSON, err := json.Marshal(spIDs)
	if err != nil {
		return nil, err
	}

	payload := map[string]any{
		"action":      "getStudentsBySPids",
		"ids":         string(idsJSON),
		"document_id": documentID,
	}

	method := strings.ToUpper(strings.TrimSpace(resource.Config["method"].(string)))
	driver := &httprequest.HttpRequestDriver{
		Url:    resource.Config["url"].(string),
		Method: method,
		Headers: map[string]string{
			"Content-Type":  "application/json",
			"Authorization": "Bearer " + resource.Config["authorization"].(string),
		},
	}
	if method == "POST" {
		driver.Body = payload
	} else {
		driver.Params = payload
	}

	res, err := httprequest.Execute[map[string]any](httprequest.New(driver).WithContext(reqCtx))
	if err != nil {
		return nil, wrapAthenaResponseError(err)
	}
	if res.StatusCode >= 400 {
		return nil, fmt.Errorf("athena HTTP %d: %s", res.StatusCode, athenaErrorFromBody(res.Body))
	}
	if errMsg := athenaErrorFromBody(res.Body); errMsg != "" {
		return nil, fmt.Errorf("athena: %s", errMsg)
	}
	return parseAthenaUsers(res.Body)
}

// --- student upsert ---

func studentModelFromAthena(user AthenaUser) models.Student {
	return models.Student{
		Firstname:   strings.TrimSpace(user.Firstname),
		Lastname:    strings.TrimSpace(user.Surname),
		Fathersname: strings.TrimSpace(user.Fathersname),
		Email:       strings.TrimSpace(user.Email),
		DocumentId:  normalizeDocumentID(user.DocumentID),
		Phone:       user.Phone,
		Birthdate:   user.RegDate,
		Nationality: user.Nationality,
		Mobile:      user.Mobile,
	}
}

// athenaStudentImport is one student (by document_id) with all Athena enrollment rows.
type athenaStudentImport struct {
	DocumentID string
	Records    []AthenaUser
}

func (cc *Controller) insertOrUpdateStudents(reqCtx context.Context, batch athenaStudentImport, refCache *importRefCache) (models.Student, []ImportLogError) {
	if len(batch.Records) == 0 {
		return models.Student{}, nil
	}
	primary := mergeAthenaUserRecords(batch.Records)
	log := newImportLog(primary)
	if !isValidDocumentID(batch.DocumentID) {
		log.fail("student.validate", errors.New("document ID must be at least 7 alphanumeric characters"))
		return models.Student{}, log.all()
	}

	v, err, _ := refCache.studentSF.Do(batch.DocumentID, func() (any, error) {
		return cc.upsertStudentByDocumentID(reqCtx, batch.Records, refCache)
	})
	if err != nil {
		log.fail("student.upsert", err)
		return models.Student{}, log.all()
	}
	res := v.(studentUpsertResult)
	if len(res.errors) > 0 {
		log.errors = append(log.errors, res.errors...)
	}
	return res.student, log.all()
}

type studentUpsertResult struct {
	student models.Student
	errors  []ImportLogError
}

func (cc *Controller) upsertStudentByDocumentID(reqCtx context.Context, records []AthenaUser, refCache *importRefCache) (studentUpsertResult, error) {
	primary := mergeAthenaUserRecords(records)
	log := newImportLog(primary)
	db := cc.app.Postgres().WithContext(reqCtx)

	var existing models.Student
	err := findStudentByDocumentID(db, primary.DocumentID, &existing)
	if err == nil {
		cc.updateStudent(reqCtx, existing.ID, primary, records, refCache, log)
		return studentUpsertResult{student: existing, errors: log.all()}, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		log.fail("student.find", err)
		return studentUpsertResult{}, err
	}

	studentModel := studentModelFromAthena(primary)
	if err := db.Create(&studentModel).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := findStudentByDocumentID(db, primary.DocumentID, &existing); err != nil {
				log.fail("student.find", err)
				return studentUpsertResult{}, err
			}
			cc.updateStudent(reqCtx, existing.ID, primary, records, refCache, log)
			return studentUpsertResult{student: existing, errors: log.all()}, nil
		}
		log.fail("student.create", err)
		return studentUpsertResult{student: models.Student{}, errors: log.all()}, nil
	}

	cc.ensureAllStudentStudyPrograms(reqCtx, studentModel.ID, records, refCache, log)
	return studentUpsertResult{student: studentModel, errors: log.all()}, nil
}

func groupAthenaUsersByDocumentID(users []AthenaUser) []athenaStudentImport {
	groups := make(map[string][]AthenaUser)
	order := make([]string, 0)
	emptyKey := ""

	for _, user := range users {
		user.DocumentID = normalizeDocumentID(user.DocumentID)
		key := user.DocumentID
		if key == "" {
			key = emptyKey
		}
		if _, ok := groups[key]; !ok {
			order = append(order, key)
		}
		groups[key] = append(groups[key], user)
	}

	out := make([]athenaStudentImport, 0, len(order))
	for _, key := range order {
		out = append(out, athenaStudentImport{
			DocumentID: key,
			Records:    groups[key],
		})
	}
	return out
}

// mergeAthenaUserRecords builds one student profile from all Athena rows for the same document_id.
func mergeAthenaUserRecords(records []AthenaUser) AthenaUser {
	if len(records) == 0 {
		return AthenaUser{}
	}
	merged := records[len(records)-1]
	for _, r := range records {
		if merged.DocumentID == "" {
			merged.DocumentID = r.DocumentID
		}
		if merged.Firstname == "" {
			merged.Firstname = r.Firstname
		}
		if merged.Surname == "" {
			merged.Surname = r.Surname
		}
		if merged.Fathersname == "" {
			merged.Fathersname = r.Fathersname
		}
		if merged.Email == "" {
			merged.Email = r.Email
		}
		if merged.Phone == "" {
			merged.Phone = r.Phone
		}
		if merged.Mobile == "" {
			merged.Mobile = r.Mobile
		}
		if merged.Nationality == "" {
			merged.Nationality = r.Nationality
		}
		if merged.RegDate == "" {
			merged.RegDate = r.RegDate
		}
	}
	merged.DocumentID = normalizeDocumentID(merged.DocumentID)
	return merged
}

func (cc *Controller) updateStudent(reqCtx context.Context, id int64, primary AthenaUser, records []AthenaUser, refCache *importRefCache, log *importLog) {
	updates := studentModelFromAthena(primary)
	if _, err := gorm.G[models.Student](cc.app.Postgres()).Where("id = ?", id).Updates(reqCtx, updates); err != nil {
		log.fail("student.update", err)
		return
	}
	cc.ensureAllStudentStudyPrograms(reqCtx, id, records, refCache, log)
}

func (cc *Controller) ensureAllStudentStudyPrograms(reqCtx context.Context, studentID int64, records []AthenaUser, refCache *importRefCache, log *importLog) {
	for _, row := range records {
		cc.ensureStudentStudyProgram(reqCtx, studentID, row, refCache, log)
	}
}

// --- study program ---

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

func (cc *Controller) ensureStudentStudyProgram(reqCtx context.Context, studentID int64, student AthenaUser, refCache *importRefCache, log *importLog) {
	program, ok := cc.buildStudentStudyProgram(reqCtx, studentID, student, refCache, log)
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
		if err := db.Model(&models.StudentStudyProgram{}).Scopes(scope).Updates(updates).Error; err != nil {
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

func studentStudyProgramImportChanges(existing, incoming models.StudentStudyProgram) map[string]any {
	updates := make(map[string]any)
	for _, field := range studentStudyProgramImportFields {
		field.addChange(updates, existing, incoming)
	}
	return updates
}

func (cc *Controller) buildStudentStudyProgram(reqCtx context.Context, studentID int64, student AthenaUser, refCache *importRefCache, log *importLog) (models.StudentStudyProgram, bool) {
	refs, ok := refCache.resolve(reqCtx, cc, student, log)
	if !ok {
		return models.StudentStudyProgram{}, false
	}

	program := models.StudentStudyProgram{
		StudentID:       studentID,
		FacultyID:       refs.facultyID,
		StudyProgramID:  refs.studyProgramID,
		StudentStatusID: refs.studentStatusID,
		StudyLevelID:    refs.studyLevelID,
		StudyProfileID:  refs.studyProfileID,
		RegYearId:       refs.regYearID,
	}
	for _, field := range studentStudyProgramImportFields {
		field.apply(&program, student)
	}
	return program, true
}

// --- reference cache & find-or-create ---

type importRefCache struct {
	mu              sync.Mutex
	sf              singleflight.Group
	studentSF       singleflight.Group
	faculties       map[string]models.Faculty
	studyPrograms   map[string]models.StudyProgram
	studyLevels     map[string]models.StudyLevel
	studyProfiles   map[string]models.StudyProfile
	studentStatuses map[string]models.StudentStatus
	academicYears   map[string]models.AcademicYear
}

type resolvedImportRefs struct {
	facultyID       int64
	studyProgramID  int64
	studyLevelID    int64
	studyProfileID  *int64
	studentStatusID int64
	regYearID       int64
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

func (c *importRefCache) resolve(ctx context.Context, cc *Controller, student AthenaUser, log *importLog) (resolvedImportRefs, bool) {
	faculty, err := c.faculty(ctx, cc, student.Faculty)
	if err != nil {
		log.fail("faculty.create", err)
		return resolvedImportRefs{}, false
	}
	studyProgram, err := c.studyProgram(ctx, cc, student.Program)
	if err != nil {
		log.fail("study_program.create", err)
		return resolvedImportRefs{}, false
	}
	studyLevel, err := c.studyLevel(ctx, cc, student.StudyLevel)
	if err != nil {
		log.fail("study_level.create", err)
		return resolvedImportRefs{}, false
	}
	studyProfile, err := c.studyProfile(ctx, cc, student.ProgramSpecialty)
	if err != nil {
		log.fail("study_profile.create", err)
		return resolvedImportRefs{}, false
	}
	studentStatus, err := c.studentStatus(ctx, cc, student.Status, student.StatusType)
	if err != nil {
		log.fail("student_status.create", err)
		return resolvedImportRefs{}, false
	}
	academicYear, err := c.academicYear(ctx, cc, student.RegYear)
	if err != nil {
		log.fail("academic_year.create", err)
		return resolvedImportRefs{}, false
	}

	var studyProfileID *int64
	if studyProfile.ID > 0 {
		studyProfileID = &studyProfile.ID
	}
	return resolvedImportRefs{
		facultyID:       faculty.ID,
		studyProgramID:  studyProgram.ID,
		studyLevelID:    studyLevel.ID,
		studyProfileID:  studyProfileID,
		studentStatusID: studentStatus.ID,
		regYearID:       academicYear.ID,
	}, true
}

type findOrCreateOpts[T any] struct {
	AllowEmpty bool
	EmptyError error
	Find       func(db *gorm.DB, key string, dest *T) error
	New        func(key string) T
}

func findOrCreateByKey[T any](ctx context.Context, db *gorm.DB, key string, opts findOrCreateOpts[T]) (T, error) {
	var zero T
	key = normalizeImportName(key)
	if key == "" {
		if opts.AllowEmpty {
			return zero, nil
		}
		return zero, opts.EmptyError
	}

	db = db.WithContext(ctx)
	var existing T
	err := opts.Find(db, key, &existing)
	if err == nil {
		return existing, nil
	}
	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return zero, err
	}

	entity := opts.New(key)
	if err := db.Create(&entity).Error; err != nil {
		if isUniqueConstraintError(err) {
			if err := opts.Find(db, key, &existing); err != nil {
				return zero, err
			}
			return existing, nil
		}
		return zero, err
	}
	return entity, nil
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

func (cc *Controller) findFacultyByName(ctx context.Context, name string) (models.Faculty, error) {
	return findOrCreateByKey(ctx, cc.app.Postgres(), name, findOrCreateOpts[models.Faculty]{
		EmptyError: errors.New("faculty name must not be empty"),
		Find: func(db *gorm.DB, name string, dest *models.Faculty) error {
			return findEntityByImportName(db, name, dest)
		},
		New: func(name string) models.Faculty {
			return models.Faculty{Name: name, Slug: slug.Make(name)}
		},
	})
}

func (cc *Controller) findStudyProgramByName(ctx context.Context, name string) (models.StudyProgram, error) {
	name = normalizeProgramImportName(name)
	return findOrCreateByKey(ctx, cc.app.Postgres(), name, findOrCreateOpts[models.StudyProgram]{
		EmptyError: errors.New("study program name must not be empty"),
		Find: func(db *gorm.DB, name string, dest *models.StudyProgram) error {
			return findEntityByImportName(db, name, dest)
		},
		New: func(name string) models.StudyProgram {
			return models.StudyProgram{Name: name, Slug: slug.Make(name)}
		},
	})
}

func (cc *Controller) findStudyLevelByName(ctx context.Context, name string) (models.StudyLevel, error) {
	return findOrCreateByKey(ctx, cc.app.Postgres(), name, findOrCreateOpts[models.StudyLevel]{
		EmptyError: errors.New("study level name must not be empty"),
		Find: func(db *gorm.DB, name string, dest *models.StudyLevel) error {
			return db.Where("name = ?", name).First(dest).Error
		},
		New: func(name string) models.StudyLevel {
			return models.StudyLevel{Name: name, Slug: slug.Make(name)}
		},
	})
}

func (cc *Controller) findStudyProfileByName(ctx context.Context, name string) (models.StudyProfile, error) {
	name = normalizeProgramImportName(name)
	return findOrCreateByKey(ctx, cc.app.Postgres(), name, findOrCreateOpts[models.StudyProfile]{
		AllowEmpty: true,
		Find: func(db *gorm.DB, name string, dest *models.StudyProfile) error {
			return findEntityByImportName(db, name, dest)
		},
		New: func(name string) models.StudyProfile {
			return models.StudyProfile{Name: name, Slug: slug.Make(name)}
		},
	})
}

func (cc *Controller) findStudentStatusByName(ctx context.Context, name, statusType string) (models.StudentStatus, error) {
	statusType = normalizeImportName(statusType)
	return findOrCreateByKey(ctx, cc.app.Postgres(), name, findOrCreateOpts[models.StudentStatus]{
		EmptyError: errors.New("student status name must not be empty"),
		Find: func(db *gorm.DB, name string, dest *models.StudentStatus) error {
			return findEntityByImportName(db, name, dest)
		},
		New: func(name string) models.StudentStatus {
			return models.StudentStatus{Name: name, Slug: slug.Make(name), Type: statusType}
		},
	})
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
	if err := db.Where("year = ?", yearLabel).First(&academicYear).Error; err == nil {
		return academicYear, nil
	} else if !errors.Is(err, gorm.ErrRecordNotFound) {
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

func (c *importRefCache) faculty(ctx context.Context, cc *Controller, name string) (models.Faculty, error) {
	key := normalizeImportName(name)
	return cachedImportRef(c, "faculty:"+key, c.faculties, key, func() (models.Faculty, error) {
		return cc.findFacultyByName(ctx, key)
	})
}

func (c *importRefCache) studyProgram(ctx context.Context, cc *Controller, name string) (models.StudyProgram, error) {
	key := normalizeProgramImportName(name)
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
	key := normalizeProgramImportName(name)
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
