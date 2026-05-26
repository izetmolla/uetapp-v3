package syncstudents

import (
	"context"
	"fmt"

	"github.com/flowtrove/packages/models"
	"github.com/uetedu/app/config"
)

type Controller struct {
	app *config.AppClients
}

func New(app *config.AppClients) *Controller {
	return &Controller{app: app}
}

type ImportStudentsResult struct {
	Success  bool             `json:"success"`
	Message  string           `json:"message"`
	Errors   []ImportLogError `json:"errors"`
	Students []models.Student `json:"students"`
}

func (cc *Controller) ImportStudents(ctx context.Context, req ImportStudentsRequest) (ImportStudentsResult, error) {
	studentsModel := []models.Student{}
	students, err := cc.loadStudentsFromAthena(ctx, req.Students)
	if err != nil {
		return ImportStudentsResult{}, err
	}

	refCache := newImportRefCache()

	// Use a worker pool to perform concurrent DB insert/update without overwhelming DB
	const maxWorkers = 8
	type result struct {
		Errors []ImportLogError
	}

	studentCh := make(chan *AthenaUser)
	resultCh := make(chan result)

	// Start workers
	for range maxWorkers {
		go func() {
			for student := range studentCh {
				studentModel, importErrors := cc.insertOrUpdateStudents(ctx, student, req.FolderID, refCache)
				if studentModel.ID > 0 {
					studentsModel = append(studentsModel, studentModel)
				}
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
		return ImportStudentsResult{
			Success:  false,
			Message:  fmt.Sprintf("%d import step(s) failed", len(importErrors)),
			Errors:   importErrors,
			Students: studentsModel,
		}, nil
	}

	return ImportStudentsResult{
		Success:  true,
		Message:  "Students imported successfully",
		Students: studentsModel,
		Errors:   []ImportLogError{},
	}, nil
}
