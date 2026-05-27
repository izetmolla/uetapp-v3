package syncstudents

import (
	"testing"

	"github.com/flowtrove/packages/models"
)

func TestNormalizeProgramImportName(t *testing.T) {
	tests := []struct {
		in, want string
	}{
		{"  Informatics (ENG)  ", "Informatics"},
		{"Informatics", "Informatics"},
		{"", ""},
	}
	for _, tc := range tests {
		if got := normalizeProgramImportName(tc.in); got != tc.want {
			t.Errorf("normalizeProgramImportName(%q) = %q, want %q", tc.in, got, tc.want)
		}
	}
}

func TestNormalizeImportName(t *testing.T) {
	if got := normalizeImportName("  Active  "); got != "Active" {
		t.Fatalf("got %q", got)
	}
}

func TestNormalizeDocumentID(t *testing.T) {
	if got := normalizeDocumentID("  A12345  "); got != "A12345" {
		t.Fatalf("got %q", got)
	}
}

func TestIsValidDocumentID(t *testing.T) {
	tests := []struct {
		id   string
		want bool
	}{
		{"A1234567", true},
		{"1234567", true},
		{"Ab12Cd34", true},
		{"  X1234567  ", true},
		{"A12345", false},
		{"ABC-1234", false},
		{"ABC 1234", false},
		{"", false},
		{"!@#$%^&", false},
	}
	for _, tc := range tests {
		if got := isValidDocumentID(tc.id); got != tc.want {
			t.Errorf("isValidDocumentID(%q) = %v, want %v", tc.id, got, tc.want)
		}
	}
}

func TestChunkStrings(t *testing.T) {
	chunks := chunkStrings([]string{"a", "b", "c", "d", "e"}, 2)
	if len(chunks) != 3 || len(chunks[2]) != 1 {
		t.Fatalf("chunks = %#v", chunks)
	}
}

func TestGroupAthenaUsersByDocumentID(t *testing.T) {
	batches := groupAthenaUsersByDocumentID([]AthenaUser{
		{DocumentID: "  ID1 ", SPID: "sp1", Program: "A"},
		{DocumentID: "ID1", SPID: "sp2", Program: "B"},
		{DocumentID: "ID2", SPID: "sp3", Program: "C"},
	})
	if len(batches) != 2 {
		t.Fatalf("len = %d, want 2", len(batches))
	}
	if len(batches[0].Records) != 2 || batches[0].DocumentID != "ID1" {
		t.Fatalf("first batch: %+v", batches[0])
	}
	if batches[0].Records[0].SPID != "sp1" || batches[0].Records[1].SPID != "sp2" {
		t.Fatalf("programs not preserved: %+v", batches[0].Records)
	}
}

func TestBuildStudentStudyProgramSetsAuthenaUserID(t *testing.T) {
	row := AthenaUser{SPID: "  SP-42  ", Program: "Informatics", Faculty: "F", StudyLevel: "B", Status: "Active", RegYear: "2020"}
	row.SPID = normalizeImportName(row.SPID)
	program := models.StudentStudyProgram{}
	for _, field := range studentStudyProgramImportFields {
		field.apply(&program, row)
	}
	if program.AuthenaUserID == nil || *program.AuthenaUserID != "SP-42" {
		t.Fatalf("AuthenaUserID = %v, want SP-42", program.AuthenaUserID)
	}
}
