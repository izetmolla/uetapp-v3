package syncstudents

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"strings"

	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

type ImportStudentsRequest struct {
	Students []string `json:"students"`
	FolderID int64    `json:"folder_id" default:"0"`
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

// AthenaUser mirrors a row from the athena_users source (import list / API payloads).
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

// Helpers Functions
func parseAthenaUsers(body map[string]any) ([]AthenaUser, error) {
	rows, err := extractHttpBodyRows(body)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}

	out := make([]AthenaUser, 0, len(rows))
	for i, row := range rows {
		record, ok := row.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("data[%d] is not an object", i)
		}
		out = append(out, athenaUserFromRecord(record))
	}
	return out, nil
}

func athenaUserFromRecord(record map[string]any) AthenaUser {
	return AthenaUser{
		StudentFID:       optionalString(record["student_fid"]),
		SPID:             optionalString(record["sp_id"]),
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
		DocumentID:       optionalString(record["document_id"]),
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

func (cc *Controller) insertOrUpdateStudents(reqCtx context.Context, student *AthenaUser, folderID int64, refCache *importRefCache) (models.Student, []ImportLogError) {
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
			return cc.createStudent(reqCtx, *student, folderID, refCache, log)
		}
		log.fail("student.find", err)
		return models.Student{}, log.all()
	}
	if studentModel.ID > 0 {
		cc.updateStudent(reqCtx, studentModel.ID, *student, folderID, refCache, log)
		return studentModel, log.all()
	}
	return studentModel, log.all()
}

func (cc *Controller) createStudent(reqCtx context.Context, student AthenaUser, folderID int64, refCache *importRefCache, log *importLog) (models.Student, []ImportLogError) {
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
	cc.ensureStudentStudyProgram(reqCtx, studentModel.ID, student, refCache, log)
	if folderID > 0 {
		cc.ensureStudentScanFolderDoc(reqCtx, folderID, studentModel.ID, studentScanFolderDocName(student), log)
	}

	return *studentModel, log.all()
}

func (cc *Controller) updateStudent(reqCtx context.Context, id int64, student AthenaUser, folderID int64, refCache *importRefCache, log *importLog) {
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

	cc.ensureStudentStudyProgram(reqCtx, id, student, refCache, log)
	if folderID > 0 {
		cc.ensureStudentScanFolderDoc(reqCtx, folderID, id, studentScanFolderDocName(student), log)
	}
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

func (cc *Controller) buildStudentStudyProgram(reqCtx context.Context, studentID int64, student AthenaUser, refCache *importRefCache, log *importLog) (models.StudentStudyProgram, bool) {
	facultyModel, err := refCache.faculty(reqCtx, cc, student.Faculty)
	if err != nil {
		log.fail("faculty.create", err)
		return models.StudentStudyProgram{}, false
	}
	studyProgramModel, err := refCache.studyProgram(reqCtx, cc, student.Program)
	if err != nil {
		log.fail("study_program.create", err)
		return models.StudentStudyProgram{}, false
	}
	studyLevelModel, err := refCache.studyLevel(reqCtx, cc, student.StudyLevel)
	if err != nil {
		log.fail("study_level.create", err)
		return models.StudentStudyProgram{}, false
	}
	studyProfileModel, err := refCache.studyProfile(reqCtx, cc, student.ProgramSpecialty)
	if err != nil {
		log.fail("study_profile.create", err)
		return models.StudentStudyProgram{}, false
	}
	studentStatusModel, err := refCache.studentStatus(reqCtx, cc, student.Status, student.StatusType)
	if err != nil {
		log.fail("student_status.create", err)
		return models.StudentStudyProgram{}, false
	}
	academicYearModel, err := refCache.academicYear(reqCtx, cc, student.RegYear)
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
