package ldap

import (
	"testing"

	ldap "github.com/go-ldap/ldap/v3"
)

func TestUserFromEntry_mappings(t *testing.T) {
	entry := &ldap.Entry{
		DN: "uid=jdoe,ou=people,dc=example,dc=com",
		Attributes: []*ldap.EntryAttribute{
			{Name: "mail", Values: []string{"jdoe@example.com"}},
			{Name: "displayName", Values: []string{"Jane Doe"}},
			{Name: "memberOf", Values: []string{
				"CN=Staff,OU=Groups,DC=example,DC=com",
				"CN=Editors,OU=Groups,DC=example,DC=com",
			}},
			{Name: "title", Values: []string{"Engineer"}},
		},
	}

	u := userFromEntry(entry, Config{
		UserAttribute: "mail",
		RoleAttribute: "memberOf",
		Attributes:    []string{"title"},
	})

	if u.Email != "jdoe@example.com" {
		t.Fatalf("email: got %q", u.Email)
	}
	if u.Name != "Jane Doe" {
		t.Fatalf("name: got %q", u.Name)
	}
	if u.Username != "jdoe@example.com" {
		t.Fatalf("username: got %q", u.Username)
	}
	if len(u.Roles) != 2 || u.Roles[0] != "Staff" || u.Roles[1] != "Editors" {
		t.Fatalf("roles: got %v", u.Roles)
	}
	if u.Get("title") != "Engineer" {
		t.Fatalf("title attr: got %q", u.Get("title"))
	}
	if u.Identity() != "jdoe@example.com" {
		t.Fatalf("identity: got %q", u.Identity())
	}
}

func TestCnFromDN(t *testing.T) {
	if got := cnFromDN("CN=Admins,OU=Groups,DC=example,DC=com"); got != "Admins" {
		t.Fatalf("got %q", got)
	}
}
