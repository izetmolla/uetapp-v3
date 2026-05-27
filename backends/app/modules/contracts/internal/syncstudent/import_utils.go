package syncstudent

import (
	"fmt"
)

// AthenaUser mirrors a row from the athena_users source (import list / API payloads).
type AthenaUser struct {
	StudentFID       string `json:"student_fid"`
	SPID             string `json:"sp_id"`
	PersonID         string `json:"person_id"`
	Status           string `json:"status"`
	StatusType       string `json:"status_type"`
	Surname          string `json:"surname"`
	Firstname        string `json:"firstname"`
	Fathersname      string `json:"fathersname"`
	Phone            string `json:"phone"`
	Mobile           string `json:"mobile"`
	Email            string `json:"email"`
	EmailUET         string `json:"email_uet"`
	DocumentID       string `json:"document_id"`
	DocumentType     string `json:"document_type"`
	Department       string `json:"department"`
	ProgramID        string `json:"program_id"`
	Program          string `json:"program"`
	ProgramSpecialty string `json:"program_specialty"`
	RegDate          string `json:"reg_date"`
	RegYear          string `json:"reg_year"`
	Faculty          string `json:"faculty"`
	StudyLevel       string `json:"study_level"`
	Nationality      string `json:"nationality"`
	NatCode          string `json:"nat_code"`
	City             string `json:"city"`
	Address          string `json:"address"`
	Lastsyncdate     string `json:"lastsyncdate"`
}

// Helpers Functions
func parseAthenaUsers(body map[string]any) ([]AthenaUser, error) {
	rows, err := extractHttpBodyRows(body)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}

	out := make([]AthenaUser, 0, len(rows))
	for i, row := range rows {
		record, ok := row.(map[string]any)
		if !ok {
			return nil, fmt.Errorf("data[%d] is not an object", i)
		}
		out = append(out, athenaUserFromRecord(record))
	}
	return out, nil
}

func athenaUserFromRecord(record map[string]any) AthenaUser {
	return AthenaUser{
		StudentFID:       optionalString(record["student_fid"]),
		SPID:             optionalString(record["sp_id"]),
		PersonID:         optionalString(record["person_id"]),
		Status:           normalizeImportName(optionalString(record["status"])),
		StatusType:       normalizeImportName(optionalString(record["status_type"])),
		Surname:          optionalString(record["surname"]),
		Firstname:        optionalString(record["firstname"]),
		Fathersname:      optionalString(record["fathersname"]),
		Phone:            optionalString(record["phone"]),
		Mobile:           optionalString(record["mobile"]),
		Email:            optionalString(record["email"]),
		EmailUET:         optionalString(record["email_uet"]),
		DocumentID:       optionalString(record["document_id"]),
		DocumentType:     optionalString(record["document_type"]),
		Department:       optionalString(record["department"]),
		ProgramID:        optionalString(record["program_id"]),
		Program:          normalizeProgramImportName(optionalString(record["program"])),
		ProgramSpecialty: normalizeProgramImportName(optionalString(record["program_specialty"])),
		RegDate:          optionalString(record["reg_date"]),
		RegYear:          normalizeImportName(optionalString(record["reg_year"])),
		Faculty:          normalizeImportName(optionalString(record["faculty"])),
		StudyLevel:       normalizeImportName(optionalString(record["study_level"])),
		Nationality:      optionalString(record["nationality"]),
		NatCode:          optionalString(record["nat_code"]),
		City:             optionalString(record["city"]),
		Address:          optionalString(record["address"]),
		Lastsyncdate:     optionalString(record["lastsyncdate"]),
	}
}
