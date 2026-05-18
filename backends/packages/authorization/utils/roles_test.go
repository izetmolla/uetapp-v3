package utils

import (
	"encoding/json"
	"testing"
)

func TestFormatRoles(t *testing.T) {
	tests := []struct {
		name  string
		raw   json.RawMessage
		want  []string
	}{
		{name: "string array", raw: json.RawMessage(`["admin:rw"]`), want: []string{"admin:rw"}},
		{name: "mixed json array", raw: json.RawMessage(`["admin:rw","secretary:r"]`), want: []string{"admin:rw", "secretary:r"}},
		{name: "single grant string", raw: json.RawMessage(`"admin:rw"`), want: []string{"admin:rw"}},
		{name: "empty", raw: json.RawMessage(``), want: []string{}},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := FormatRoles(tt.raw)
			if len(got) != len(tt.want) {
				t.Fatalf("FormatRoles() = %v, want %v", got, tt.want)
			}
			for i := range tt.want {
				if got[i] != tt.want[i] {
					t.Fatalf("FormatRoles()[%d] = %q, want %q", i, got[i], tt.want[i])
				}
			}
		})
	}
}
