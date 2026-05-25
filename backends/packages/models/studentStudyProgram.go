package models

import (
	"time"

	"gorm.io/gorm"
)

// Server specific settings.
type StudentStudyProgram struct {
	ID             int64        `json:"id" gorm:"primaryKey;autoIncrement"`
	StudentID      int64        `json:"student_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_study_program"`
	Student        Student      `json:"student" gorm:"foreignKey:StudentID;references:ID"`
	StudyProgramID int64        `json:"study_program_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_study_program"`
	StudyProgram   StudyProgram `json:"study_program" gorm:"foreignKey:StudyProgramID;references:ID"`

	// Status StudentStudyProgramStatus `json:"status" gorm:"default:active;"`
	StudentStatusID int64         `json:"status_id" gorm:"type:bigint;not null;column:status;uniqueIndex:idx_student_study_program"`
	Status          StudentStatus `json:"status" gorm:"foreignKey:StudentStatusID;references:ID"`
	FacultyID       int64         `json:"faculty_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_study_program"`
	Faculty         Faculty       `json:"faculty" gorm:"foreignKey:FacultyID;references:ID"`
	StudyLevelID    int64         `json:"study_level_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_study_program"`
	StudyLevel      StudyLevel    `json:"study_level" gorm:"foreignKey:StudyLevelID;references:ID"`
	StudyProfileID  *int64        `json:"study_profile_id" gorm:"type:bigint;uniqueIndex:idx_student_study_program"`
	StudyProfile    StudyProfile  `json:"study_profile" gorm:"foreignKey:StudyProfileID;references:ID"`
	RegYearId       int64         `json:"reg_year_id" gorm:"type:bigint;not null;uniqueIndex:idx_student_study_program"`
	RegYear         AcademicYear  `json:"reg_year" gorm:"foreignKey:RegYearId;references:ID"`

	AuthenaUserID *string `json:"authena_user_id" gorm:"type:varchar(255)"`
	UMSUserID     *string `json:"ums_user_id" gorm:"type:varchar(255)"`
	AcademicEmail *string `json:"academic_email" gorm:"type:varchar(255)"`

	CreatedAt time.Time      `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt time.Time      `json:"updated_at" gorm:"autoUpdateTime"`
	DeletedAt gorm.DeletedAt `json:"deleted_at" gorm:"index"`
}

func (b *StudentStudyProgram) BeforeCreate(_ *gorm.DB) (err error) {
	return
}

func (b StudentStudyProgram) TableName() string {
	return "student_study_programs"
}
