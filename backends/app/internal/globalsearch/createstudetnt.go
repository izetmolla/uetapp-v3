package globalsearch

import (
	"context"
	"errors"

	"github.com/flowtrove/packages/models"
	"gorm.io/gorm"
)

func (cc *Controller) getOrCreateStudent(ctx context.Context, std Student) (models.Student, error) {
	db := cc.app.Postgres()
	student, err := gorm.G[models.Student](db).Where(&models.Student{DocumentId: std.DocumentID}).First(ctx)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return cc.createStudent(ctx, std)
		}
		return models.Student{}, err
	}
	return student, nil
}

func (cc *Controller) createStudent(ctx context.Context, student Student) (models.Student, error) {
	db := cc.app.Postgres()
	studentModel := &models.Student{
		Firstname:   student.Firstname,
		Lastname:    student.Surname,
		Email:       student.Email,
		DocumentId:  student.DocumentID,
		Phone:       student.Phone,
		Nationality: student.Nationality,
		Mobile:      student.Mobile,
	}
	if err := gorm.G[models.Student](db).Create(ctx, studentModel); err != nil {
		return models.Student{}, err
	}

	return *studentModel, nil
}
