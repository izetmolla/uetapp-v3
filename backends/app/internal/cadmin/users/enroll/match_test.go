package enroll

import (
	"testing"

	"github.com/flowtrove/packages/models"
)

func TestResolve_priorityAndInsert(t *testing.T) {
	existingID := "11111111-1111-1111-1111-111111111111"
	otherID := "22222222-2222-2222-2222-222222222222"

	idx := &userIndex{
		byID: map[string]*models.User{
			existingID: {ID: existingID, Email: "a@example.com", Username: "usera"},
		},
		byEmail: map[string]*models.User{
			"a@example.com": {ID: existingID, Email: "a@example.com", Username: "usera"},
		},
		byUsername: map[string]*models.User{
			"usera": {ID: existingID, Email: "a@example.com", Username: "usera"},
			"userb": {ID: otherID, Email: "b@example.com", Username: "userb"},
		},
	}

	// id match
	m := idx.resolve(csvUserRow{ID: existingID, Email: "a@example.com"})
	if m.User == nil || m.MatchedBy != "id" {
		t.Fatalf("id match: %+v", m)
	}

	// unknown id → email match
	m = idx.resolve(csvUserRow{ID: "00000000-0000-0000-0000-000000000000", Email: "a@example.com"})
	if m.User == nil || m.MatchedBy != "email" || !m.UnmatchedID {
		t.Fatalf("email fallback: %+v", m)
	}

	// unknown id, no email → username match
	m = idx.resolve(csvUserRow{ID: "00000000-0000-0000-0000-000000000000", Username: "userb"})
	if m.User == nil || m.MatchedBy != "username" || !m.UnmatchedID {
		t.Fatalf("username fallback: %+v", m)
	}

	// no match → insert
	m = idx.resolve(csvUserRow{ID: "00000000-0000-0000-0000-000000000000", Email: "new@example.com", Username: "newuser"})
	if m.User != nil || len(m.Errors) > 0 || !m.UnmatchedID {
		t.Fatalf("insert: %+v", m)
	}
}
