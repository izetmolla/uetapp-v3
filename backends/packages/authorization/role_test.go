package authorization_test

import "testing"

func TestGetRole(t *testing.T) {
	auth, _ := newAuth(t)

	tests := []struct {
		name             string
		endpoint         []string
		user             []string
		wantRole         bool
		wantRead         bool
		wantWrite        bool
	}{
		{
			name:      "admin rw full access",
			endpoint:  []string{"admin"},
			user:      []string{"admin:rw"},
			wantRole:  true,
			wantRead:  true,
			wantWrite: true,
		},
		{
			name:      "admin read only",
			endpoint:  []string{"admin"},
			user:      []string{"admin:r"},
			wantRole:  true,
			wantRead:  true,
			wantWrite: false,
		},
		{
			name:      "admin write only",
			endpoint:  []string{"admin"},
			user:      []string{"admin:w"},
			wantRole:  true,
			wantRead:  false,
			wantWrite: true,
		},
		{
			name:      "wrong role",
			endpoint:  []string{"admin"},
			user:      []string{"user:rw"},
			wantRole:  false,
			wantRead:  false,
			wantWrite: false,
		},
		{
			name:      "multiple endpoint roles",
			endpoint:  []string{"admin", "hr"},
			user:      []string{"hr:r"},
			wantRole:  true,
			wantRead:  true,
			wantWrite: false,
		},
		{
			name:      "merge permissions across roles",
			endpoint:  []string{"admin", "hr"},
			user:      []string{"admin:r", "hr:w"},
			wantRole:  true,
			wantRead:  true,
			wantWrite: true,
		},
		{
			name:      "role name without perms",
			endpoint:  []string{"admin"},
			user:      []string{"admin"},
			wantRole:  true,
			wantRead:  false,
			wantWrite: false,
		},
		{
			name:      "endpoint role with suffix ignored",
			endpoint:  []string{"admin:rw"},
			user:      []string{"admin:r"},
			wantRole:  true,
			wantRead:  true,
			wantWrite: false,
		},
		{
			name:      "empty inputs",
			endpoint:  []string{"admin"},
			user:      nil,
			wantRole:  false,
			wantRead:  false,
			wantWrite: false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			hasRole, canRead, canWrite := auth.GetRole(tt.endpoint, tt.user)
			if hasRole != tt.wantRole || canRead != tt.wantRead || canWrite != tt.wantWrite {
				t.Fatalf("GetRole(%v, %v) = (%v, %v, %v), want (%v, %v, %v)",
					tt.endpoint, tt.user, hasRole, canRead, canWrite,
					tt.wantRole, tt.wantRead, tt.wantWrite)
			}
		})
	}
}
