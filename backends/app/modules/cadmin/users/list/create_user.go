package list

import (
	"errors"
	"strings"

	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"github.com/google/uuid"
)

type createUserPayload struct {
	generalUpdatePayload
	Password        string   `json:"password"`
	PasswordConfirm string   `json:"password_confirm"`
	Roles           []string `json:"roles"`
	IsConfirmed     bool     `json:"is_confirmed"`
}

func (cc *Controller) GetUserCreateTemplate(c fiber.Ctx) error {
	r := cc.app.Render()

	availableRoles, err := cc.loadAvailableRoleNames(c.Context())
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"user":            emptyUserDetailResponse(),
		"available_roles": availableRoles,
	}))
}

func emptyUserDetailResponse() fiber.Map {
	return fiber.Map{
		"id":            "",
		"first_name":    "",
		"last_name":     "",
		"email":         "",
		"username":      "",
		"ldap_username": "",
		"image":         "",
		"status":        string(models.New),
		"is_confirmed":  false,
		"roles":         []string{},
	}
}

func (cc *Controller) CreateUser(c fiber.Ctx) error {
	db := cc.app.Postgres()
	r := cc.app.Render()

	var payload createUserPayload
	if err := c.Bind().JSON(&payload); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	updates, err := payload.toUpdates()
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	email := updates["email"].(string)
	var emailCount int64
	if err := db.Model(&models.User{}).Where("email = ?", email).Count(&emailCount).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}
	if emailCount > 0 {
		return cc.app.Api(c, r.WithError(errors.New("email already in use")), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
	}

	username := updates["username"].(string)
	if username != "" {
		var usernameCount int64
		if err := db.Model(&models.User{}).Where("username = ?", username).Count(&usernameCount).Error; err != nil {
			return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		if usernameCount > 0 {
			return cc.app.Api(c, r.WithError(errors.New("username already in use")), r.WithStatus(fiber.StatusConflict), r.WithCode("CONFLICT"))
		}
	}

	user := models.User{
		ID:           uuid.New().String(),
		FirstName:    updates["first_name"].(string),
		LastName:     updates["last_name"].(string),
		Email:        email,
		Username:     username,
		LdapUsername: updates["ldap_username"].(string),
		Image:        updates["image"].(string),
		Status:       updates["status"].(models.UserStatus),
		IsConfirmed:  payload.IsConfirmed,
		Roles:        models.JSONBArray{},
	}

	password := strings.TrimSpace(payload.Password)
	confirm := strings.TrimSpace(payload.PasswordConfirm)
	if password != "" || confirm != "" {
		if password == "" || confirm == "" {
			return cc.app.Api(c,
				r.WithError(errors.New("password and confirmation are required")),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		if password != confirm {
			return cc.app.Api(c,
				r.WithError(errors.New("passwords do not match")),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		if len(password) < 8 {
			return cc.app.Api(c,
				r.WithError(errors.New("password must be at least 8 characters")),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		hashed, err := hashPassword(cc.app, password)
		if err != nil {
			return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
		}
		user.Password = hashed
	}

	if len(payload.Roles) > 0 {
		roles, err := parseRolesList(payload.Roles)
		if err != nil {
			return cc.app.Api(c,
				r.WithError(err),
				r.WithStatus(fiber.StatusBadRequest),
				r.WithCode("BAD_REQUEST"),
			)
		}
		user.Roles = roles
	}

	if err := db.Create(&user).Error; err != nil {
		return cc.app.Api(c, r.WithError(err), r.WithStatus(fiber.StatusInternalServerError), r.WithCode("INTERNAL_SERVER_ERROR"))
	}

	return cc.app.Api(c, r.WithData(fiber.Map{
		"success": true,
		"message": "User created successfully",
		"user":    userToDetailResponse(user),
	}))
}
