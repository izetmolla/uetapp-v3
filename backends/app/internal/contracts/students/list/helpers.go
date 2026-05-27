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
		"id":          s.ID,
		"firstname":   s.Firstname,
		"lastname":    s.Lastname,
		"email":       s.Email,
		"document_id": s.DocumentId,
		"phone":       s.Phone,
		"mobile":      s.Mobile,
		"birthdate":   s.Birthdate,
		"gender":      s.Gender,
		"nationality": s.Nationality,
		"status":      normalizeStudentStatus(s.Status),
		"user_id":     userID,
		"created_at":  s.CreatedAt,
		"updated_at":  s.UpdatedAt,
	}
}

func emptyStudentDetailResponse() fiber.Map {
	return fiber.Map{
		"id":          0,
		"firstname":   "",
		"lastname":    "",
		"email":       "",
		"document_id": "",
		"status":      "active",
		"user_id":     "",
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
	Firstname   string `json:"firstname"`
	Lastname    string `json:"lastname"`
	Email       string `json:"email"`
	DocumentId  string `json:"document_id"`
	Phone       string `json:"phone"`
	Mobile      string `json:"mobile"`
	Birthdate   string `json:"birthdate"`
	Gender      string `json:"gender"`
	Nationality string `json:"nationality"`
	Status      string `json:"status"`
	UserID      string `json:"user_id"`
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
		Firstname:   firstname,
		Lastname:    lastname,
		Email:       email,
		DocumentId:  strings.TrimSpace(p.DocumentId),
		Phone:       strings.TrimSpace(p.Phone),
		Mobile:      strings.TrimSpace(p.Mobile),
		Birthdate:   strings.TrimSpace(p.Birthdate),
		Gender:      strings.TrimSpace(p.Gender),
		Nationality: strings.TrimSpace(p.Nationality),
		Status:      status,
		UserID:      userID,
	}, nil
}

func (p studentPayload) toUpdates() (map[string]any, error) {
	student, err := p.toModel()
	if err != nil {
		return nil, err
	}
	return map[string]any{
		"firstname":   student.Firstname,
		"lastname":    student.Lastname,
		"email":       student.Email,
		"document_id": student.DocumentId,
		"phone":       student.Phone,
		"mobile":      student.Mobile,
		"birthdate":   student.Birthdate,
		"gender":      student.Gender,
		"nationality": student.Nationality,
		"status":      student.Status,
		"user_id":     student.UserID,
	}, nil
}
