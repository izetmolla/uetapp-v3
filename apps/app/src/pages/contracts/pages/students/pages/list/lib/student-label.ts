import type { Student } from "../api";

export function getStudentLabel(student: Student | null | undefined): string {
    if (!student) return "";
    const name = [student.firstname, student.lastname].filter(Boolean).join(" ").trim();
    return name || student.email || `Student #${student.id}`;
}
