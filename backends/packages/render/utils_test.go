package render

import "testing"

func TestFirstPathSegment(t *testing.T) {
	const defaultName = "app"

	cases := []struct {
		name string
		path string
		def  string
		want string
	}{
		{name: "empty path falls back to default", path: "", def: defaultName, want: defaultName},
		{name: "root path falls back to default", path: "/", def: defaultName, want: defaultName},
		{name: "single segment", path: "/contracts", def: defaultName, want: "contracts"},
		{name: "single segment no leading slash", path: "contracts", def: defaultName, want: "contracts"},
		{name: "two segments", path: "/users/list", def: defaultName, want: "users"},
		{name: "three segments", path: "/cadmin/users/list", def: defaultName, want: "cadmin"},
		{name: "trailing slash kept", path: "/contracts/", def: defaultName, want: "contracts"},
		{name: "double leading slash", path: "//contracts/list", def: defaultName, want: "contracts"},
		{name: "query string stripped", path: "/contracts?foo=bar", def: defaultName, want: "contracts"},
		{name: "fragment stripped", path: "/contracts#section", def: defaultName, want: "contracts"},
		{name: "query and fragment", path: "/users/list?page=2#top", def: defaultName, want: "users"},
		{name: "only query string falls back", path: "/?service=foo", def: defaultName, want: defaultName},
		{name: "deep nested path", path: "/secretary/contracts/123/edit", def: defaultName, want: "secretary"},
		{name: "empty default with empty path", path: "", def: "", want: ""},
		{name: "matches user reported case '/app'", path: "/app", def: defaultName, want: "app"},
		{name: "matches user reported case '/cadmin'", path: "/cadmin", def: defaultName, want: "cadmin"},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := firstPathSegment(tc.path, tc.def)
			if got != tc.want {
				t.Fatalf("firstPathSegment(%q, %q) = %q; want %q", tc.path, tc.def, got, tc.want)
			}
		})
	}
}

func BenchmarkFirstPathSegment(b *testing.B) {
	const path = "/cadmin/users/list"
	for i := 0; i < b.N; i++ {
		_ = firstPathSegment(path, "app")
	}
}
