package importstudents

import (
	"context"
	"encoding/json"
	"errors"

	"github.com/flowtrove/packages/drivers/httprequest"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

type ImportStudentsRequest struct {
	Students []string `json:"students"`
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
		Student AthenaUser
		Err     error
	}

	studentCh := make(chan *AthenaUser)
	resultCh := make(chan result)
	ctx := c.Context()

	// Start workers
	for range maxWorkers {
		go func() {
			for student := range studentCh {
				_, err := cc.insertOrUpdateStudents(ctx, student)
				resultCh <- result{Student: *student, Err: err}
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

	// Collect results, optionally aggregate errors if needed
	var insertErrs []error
	for range students {
		res := <-resultCh
		if res.Err != nil {
			insertErrs = append(insertErrs, res.Err)
		}
	}

	if len(insertErrs) > 0 {
		return cc.app.Api(c, r.WithError(errors.Join(insertErrs...)))
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"message":  "Students imported successfully",
		"success":  true,
		"students": students,
	}))
}

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

func (cc *Controller) insertOrUpdateStudents(reqCtx context.Context, student *AthenaUser) (models.Student, error) {
	var err error
	db := cc.app.Postgres()
	if student.DocumentID == "" || len(student.DocumentID) < 3 {
		return models.Student{}, errors.New("document ID is required")
	}
	studentModel, err := gorm.G[models.Student](db).
		Select("id").
		Where("id_number = ?", student.DocumentID).
		First(reqCtx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.createUser(reqCtx, *student)
		} else {
			return models.Student{}, err
		}
	}
	if studentModel.ID > 0 {
		return studentModel, cc.updateUser(reqCtx, studentModel.ID, *student)
	}
	return studentModel, nil
}

func (cc *Controller) createUser(reqCtx context.Context, student AthenaUser) (models.Student, error) {
	db := cc.app.Postgres()
	user := &models.Student{
		Firstname: student.Firstname,
		Lastname:  student.Surname,
		Email:     student.Email,
		IdNumber:  student.DocumentID,
	}
	err := gorm.G[models.Student](db).Create(reqCtx, user)
	if err != nil {
		return models.Student{}, err
	}
	return *user, nil
}

func (cc *Controller) updateUser(reqCtx context.Context, id int64, student AthenaUser) error {
	db := cc.app.Postgres()
	user := models.Student{
		Firstname: student.Firstname,
		Lastname:  student.Surname,
		Email:     student.Email,
		IdNumber:  student.DocumentID,
	}
	_, err := gorm.G[models.Student](db).Where("id = ?", id).Updates(reqCtx, user)
	if err != nil {
		return err
	}

	return nil
}
