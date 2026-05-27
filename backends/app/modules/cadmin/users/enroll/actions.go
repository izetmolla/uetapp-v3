package enroll

import (
	"errors"
	"fmt"
	"strings"

	"github.com/flowtrove/packages/authorization/utils"
	"github.com/flowtrove/packages/models"
	"github.com/gofiber/fiber/v3"
	"gorm.io/gorm"
)

func (cc *Controller) ApplyCSVChanges(c fiber.Ctx) error {
	r := cc.app.Render()

	var req ApplyRequest
	if err := c.Bind().JSON(&req); err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}
	if len(req.Rows) == 0 {
		return cc.app.Api(c,
			r.WithError(errors.New("no rows to apply")),
			r.WithStatus(fiber.StatusBadRequest),
			r.WithCode("BAD_REQUEST"),
		)
	}

	db := cc.app.Postgres()
	idx, err := loadUserIndex(db)
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	pm, err := passwordManagerFromApp(cc.app.Auth())
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	skipErrors := req.SkipErrors
	res := ApplyResponse{
		FailedRows: make([]ApplyFailedRow, 0),
	}

	err = db.Transaction(func(tx *gorm.DB) error {
		for _, item := range req.Rows {
			action := strings.ToLower(strings.TrimSpace(item.Action))

			if action == "error" {
				res.recordFailure(item, "skipped", "row has preview errors and was not imported", nil)
				continue
			}

			if action != "insert" && action != "update" {
				if skipErrors {
					res.recordFailure(item, action, fmt.Sprintf("unsupported action %q", item.Action), nil)
					continue
				}
				return fmt.Errorf("row %d: unsupported action %q", item.Row, item.Action)
			}

			preview := buildPreview([]csvUserRow{item.CSV}, idx, req.FileColumns)
			if len(preview.Rows) == 0 || preview.Rows[0].Action == "error" {
				msg := "validation failed"
				var previewErrors []string
				if len(preview.Rows) > 0 {
					previewErrors = preview.Rows[0].Errors
					if len(previewErrors) > 0 {
						msg = strings.Join(previewErrors, "; ")
					}
				}
				if skipErrors {
					res.recordFailure(item, action, msg, previewErrors)
					continue
				}
				return fmt.Errorf("row %d: %s", item.Row, msg)
			}
			if preview.Rows[0].Action != action {
				msg := fmt.Sprintf("action mismatch (expected %s)", preview.Rows[0].Action)
				if skipErrors {
					res.recordFailure(item, action, msg, nil)
					continue
				}
				return fmt.Errorf("row %d: %s", item.Row, msg)
			}

			switch action {
			case "insert":
				if err := cc.applyInsert(tx, idx, pm, item, req.FileColumns, &res); err != nil {
					if skipErrors {
						res.recordFailure(item, action, err.Error(), nil)
						continue
					}
					return err
				}
			case "update":
				if err := cc.applyUpdate(tx, idx, pm, item, req.FileColumns, &res); err != nil {
					if skipErrors {
						res.recordFailure(item, action, err.Error(), nil)
						continue
					}
					return err
				}
			}
		}
		return nil
	})
	if err != nil {
		return cc.app.Api(c,
			r.WithError(err),
			r.WithStatus(fiber.StatusInternalServerError),
			r.WithCode("INTERNAL_SERVER_ERROR"),
		)
	}

	return c.JSON(res)
}

func (res *ApplyResponse) recordFailure(item ApplyRow, action, message string, rowErrors []string) {
	res.Failed++
	res.Skipped++
	res.Errors = append(res.Errors, fmt.Sprintf("row %d: %s", item.Row, message))
	res.FailedRows = append(res.FailedRows, ApplyFailedRow{
		Row:     item.Row,
		Action:  action,
		Message: message,
		CSV:     item.CSV,
		Errors:  rowErrors,
	})
}

func (cc *Controller) applyInsert(tx *gorm.DB, idx *userIndex, pm *utils.PasswordManager, item ApplyRow, fileColumns []string, res *ApplyResponse) error {
	user, err := csvToUserForInsert(item.CSV, pm, fileColumns)
	if err != nil {
		return err
	}
	if id := strings.TrimSpace(item.CSV.ID); id != "" {
		if _, taken := idx.byID[id]; taken {
			return fmt.Errorf("id already exists")
		}
		user.ID = id
	}
	if err := tx.Create(user).Error; err != nil {
		return err
	}
	registerUser(idx, user)
	res.Inserted++
	return nil
}

func (cc *Controller) applyUpdate(tx *gorm.DB, idx *userIndex, pm *utils.PasswordManager, item ApplyRow, fileColumns []string, res *ApplyResponse) error {
	match := idx.resolve(item.CSV)
	if len(match.Errors) > 0 || match.User == nil {
		if len(match.Errors) > 0 {
			return errors.New(strings.Join(match.Errors, "; "))
		}
		return errors.New("user not found for update")
	}
	updates, err := csvRowUpdates(item.CSV, pm, fileColumns)
	if err != nil {
		return err
	}
	if len(updates) == 0 {
		res.Updated++
		return nil
	}
	if err := tx.Model(&models.User{}).Where("id = ?", match.User.ID).Updates(updates).Error; err != nil {
		return err
	}
	registerUser(idx, mergeUserUpdates(match.User, updates))
	res.Updated++
	return nil
}

func registerUser(idx *userIndex, u *models.User) {
	if u == nil {
		return
	}
	idx.byID[u.ID] = u
	if e := strings.TrimSpace(u.Email); e != "" {
		idx.byEmail[strings.ToLower(e)] = u
	}
	if un := strings.TrimSpace(u.Username); un != "" {
		idx.byUsername[strings.ToLower(un)] = u
	}
}
