package list

import (
	"errors"
	"strconv"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

func (cc *Controller) loadEditableStudent(db *gorm.DB, id int64) (models.Student, error) {
	var student models.Student
	if err := db.Where("id = ?", id).First(&student).Error; err != nil {
		return student, err
	}
	return student, nil
}

func (cc *Controller) studentNotFoundResponse(c fiber.Ctx, err error) error {
	r := cc.app.Render()
	if errors.Is(err, gorm.ErrRecordNotFound) {
		return cc.app.Api(c,
			r.WithError(errors.New("student not found")),
			r.WithStatus(fiber.StatusNotFound),
			r.WithCode("NOT_FOUND"),
		)
	}
	return cc.app.Api(c,
		r.WithError(err),
		r.WithStatus(fiber.StatusInternalServerError),
		r.WithCode("INTERNAL_SERVER_ERROR"),
	)
}

func studentToDetailResponse(s models.Student) fiber.Map {
	userID := ""
	if s.UserID != "" {
		userID = s.UserID
	}
	return fiber.Map{
		"id":             s.ID,
		"firstname":      s.Firstname,
		"lastname":       s.Lastname,
		"email":          s.Email,
		"id_number":      s.IdNumber,
		"pasport_number": s.PasportNumber,
		"status":         normalizeStudentStatus(s.Status),
		"user_id":        userID,
		"created_at":     s.CreatedAt,
		"updated_at":     s.UpdatedAt,
	}
}

func emptyStudentDetailResponse() fiber.Map {
	return fiber.Map{
		"id":             0,
		"firstname":      "",
		"lastname":       "",
		"email":          "",
		"id_number":      "",
		"pasport_number": "",
		"status":         "active",
		"user_id":        "",
	}
}

func normalizeStudentStatus(raw string) string {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "inactive", "disabled":
		return "inactive"
	default:
		return "active"
	}
}

func normalizeStudentStatusInput(raw string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(raw)) {
	case "active", "":
		return "active", nil
	case "inactive", "disabled":
		return "inactive", nil
	default:
		return "", errors.New("invalid status")
	}
}

func parseStudentIDParam(raw string) (int64, error) {
	id, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil || id <= 0 {
		return 0, errors.New("invalid student id")
	}
	return id, nil
}

func parseStudentIDs(ids []int64) ([]int64, error) {
	if len(ids) == 0 {
		return nil, errors.New("at least one id is required")
	}
	parsed := make([]int64, 0, len(ids))
	for _, id := range ids {
		if id <= 0 {
			return nil, errors.New("invalid id in request")
		}
		parsed = append(parsed, id)
	}
	return parsed, nil
}

type studentPayload struct {
	Firstname     string `json:"firstname"`
	Lastname      string `json:"lastname"`
	Email         string `json:"email"`
	IdNumber      string `json:"id_number"`
	PasportNumber string `json:"pasport_number"`
	Status        string `json:"status"`
	UserID        string `json:"user_id"`
}

func (p studentPayload) toModel() (*models.Student, error) {
	firstname := strings.TrimSpace(p.Firstname)
	lastname := strings.TrimSpace(p.Lastname)
	email := strings.TrimSpace(p.Email)
	if firstname == "" || lastname == "" {
		return nil, errors.New("firstname and lastname are required")
	}

	status, err := normalizeStudentStatusInput(p.Status)
	if err != nil {
		return nil, err
	}

	userID := strings.TrimSpace(p.UserID)
	if userID != "" {
		if _, err := uuid.Parse(userID); err != nil {
			return nil, errors.New("invalid user_id")
		}
	}

	return &models.Student{
		Firstname:     firstname,
		Lastname:      lastname,
		Email:         email,
		IdNumber:      strings.TrimSpace(p.IdNumber),
		PasportNumber: strings.TrimSpace(p.PasportNumber),
		Status:        status,
		UserID:        userID,
	}, nil
}

func (p studentPayload) toUpdates() (map[string]any, error) {
	student, err := p.toModel()
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"firstname":      student.Firstname,
		"lastname":       student.Lastname,
		"email":          student.Email,
		"id_number":      student.IdNumber,
		"pasport_number": student.PasportNumber,
		"status":         student.Status,
		"user_id":        student.UserID,
	}, nil
}
