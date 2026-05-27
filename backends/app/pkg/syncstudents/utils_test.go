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

func TestStudentStudyProgramCompositeKey(t *testing.T) {
	profileID := int64(5)
	a := models.StudentStudyProgram{
		StudyProgramID:  1,
		StudentStatusID: 2,
		FacultyID:       3,
		StudyLevelID:    4,
		RegYearId:       6,
		StudyProfileID:  &profileID,
	}
	b := a
	if studentStudyProgramCompositeKey(a) != studentStudyProgramCompositeKey(b) {
		t.Fatal("same enrollment should produce same key")
	}
	b.StudyProgramID = 99
	if studentStudyProgramCompositeKey(a) == studentStudyProgramCompositeKey(b) {
		t.Fatal("different enrollment should produce different key")
	}
}

func TestStudentStudyProgramSyncKeyUsesSPID(t *testing.T) {
	spid := "SP-99"
	p := models.StudentStudyProgram{AuthenaUserID: &spid}
	if studentStudyProgramSyncKey(p) != "sp:SP-99" {
		t.Fatalf("got %q", studentStudyProgramSyncKey(p))
	}
}

func TestDedupeAthenaUsersBySPID(t *testing.T) {
	users := dedupeAthenaUsersBySPID([]AthenaUser{
		{SPID: "a", Program: "1"},
		{SPID: "a", Program: "2"},
		{SPID: "b", Program: "3"},
	})
	if len(users) != 2 {
		t.Fatalf("len = %d", len(users))
	}
}

func TestMergeAthenaUserRecordsMergesEmailUET(t *testing.T) {
	merged := mergeAthenaUserRecords([]AthenaUser{
		{EmailUET: "old@uet.edu.al"},
		{EmailUET: "new@uet.edu.al"},
	})
	if merged.EmailUET != "new@uet.edu.al" {
		t.Fatalf("EmailUET = %q, want new@uet.edu.al", merged.EmailUET)
	}
}

func TestAcademicEmailFromAthenaRecordsUsesLastNonEmpty(t *testing.T) {
	email := academicEmailFromAthenaRecords([]AthenaUser{
		{EmailUET: ""},
		{EmailUET: "first@uet.edu.al"},
		{EmailUET: "last@uet.edu.al"},
	})
	if email != "last@uet.edu.al" {
		t.Fatalf("got %q", email)
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

func TestBuildStudentStudyProgramSetsAcademicEmail(t *testing.T) {
	row := AthenaUser{EmailUET: "student@uet.edu.al", SPID: "SP-1"}
	program := models.StudentStudyProgram{}
	for _, field := range studentStudyProgramImportFields {
		field.apply(&program, row)
	}
	if program.AcademicEmail == nil || *program.AcademicEmail != "student@uet.edu.al" {
		t.Fatalf("AcademicEmail = %v, want student@uet.edu.al", program.AcademicEmail)
	}
}
