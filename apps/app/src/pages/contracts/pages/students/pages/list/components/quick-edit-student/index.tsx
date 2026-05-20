import { useQuery } from "@tanstack/react-query";
import { GraduationCap, Loader2 } from "lucide-react";
import { useCallback, useState, type FC } from "react";
import { queryClient } from "@workspace/flowtrove/lib/network";
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Badge } from "@workspace/ui/components/badge";
import { STUDENTS_FETCH_PERSISTANT } from "../../api";
import useStudentsListStore, { EMPTY_STUDENT } from "../../store";
import { getStudentCreateTemplate, getStudentDetail, type Student } from "./api";
import { QUICK_EDIT_STUDENT_FORM_ID } from "./form-ids";
import StudentForm from "./student-form";
import { getStudentLabel } from "../../lib/student-label";

const QuickEditStudent: FC = () => {
    const { selectedStudent, isCreateMode, isQuickEditDialogOpen, closeDialogs } = useStudentsListStore();
    const [isSaving, setIsSaving] = useState(false);

    const studentId = selectedStudent?.id ?? 0;
    const isCreate = isCreateMode || !studentId;

    const listQueryKey = [STUDENTS_FETCH_PERSISTANT, "students"] as const;

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: [STUDENTS_FETCH_PERSISTANT, "student-detail", isCreate ? "new" : studentId],
        queryFn: () => (isCreate ? getStudentCreateTemplate() : getStudentDetail(studentId)),
        enabled: isQuickEditDialogOpen && (isCreate || studentId > 0),
    });

    const student = data?.student ?? (isCreate ? EMPTY_STUDENT : undefined);

    const handleClose = useCallback(() => {
        setIsSaving(false);
        closeDialogs();
    }, [closeDialogs]);

    const handleSaved = useCallback(
        (updated: Student) => {
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [STUDENTS_FETCH_PERSISTANT, "stats"] });
            if (!isCreate && studentId) {
                void queryClient.setQueryData(
                    [STUDENTS_FETCH_PERSISTANT, "student-detail", studentId],
                    (prev: typeof data | undefined) =>
                        prev ? { ...prev, student: { ...prev.student, ...updated } } : prev,
                );
            }
            handleClose();
        },
        [listQueryKey, studentId, data, isCreate, handleClose],
    );

    const dialogTitle = isCreate ? "Add student" : "Edit student";
    const label = getStudentLabel(student);

    const statusVariant = (status: string): "default" | "secondary" | "outline" => {
        if (status === "active") return "default";
        if (status === "inactive") return "secondary";
        return "outline";
    };

    return (
        <Dialog open={isQuickEditDialogOpen} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="flex max-h-[min(88vh,640px)] w-full max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
                <div className="shrink-0 border-b px-6 py-4">
                    <DialogHeader className="sr-only">
                        <DialogTitle>{dialogTitle}</DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center gap-4">
                        {isLoading ? (
                            <Skeleton className="size-10 shrink-0 rounded-lg" />
                        ) : (
                            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                <GraduationCap className="size-5" aria-hidden />
                            </div>
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-muted-foreground mb-0.5 text-xs">{dialogTitle}</p>
                            <p className="truncate text-base font-semibold leading-tight">
                                {isLoading ? "Loading student..." : label || "Student details"}
                            </p>
                        </div>
                        {student?.status && !isLoading && !isCreate ? (
                            <Badge variant={statusVariant(student.status)} className="shrink-0 capitalize">
                                {student.status}
                            </Badge>
                        ) : null}
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col gap-3 px-6 py-6">
                        <Skeleton className="h-9 w-full" />
                        <Skeleton className="h-32 w-full" />
                    </div>
                ) : isError || !student ? (
                    <div className="flex flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                        <p className="text-muted-foreground text-sm">Could not load student details.</p>
                        <Button variant="outline" size="sm" onClick={() => void refetch()}>
                            Retry
                        </Button>
                    </div>
                ) : (
                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                        <StudentForm
                            studentId={studentId}
                            student={student}
                            isCreateMode={isCreate}
                            onSaved={handleSaved}
                            onPendingChange={setIsSaving}
                        />
                    </div>
                )}

                {!isLoading && !isError && student ? (
                    <DialogFooter className="shrink-0 gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-end">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            form={QUICK_EDIT_STUDENT_FORM_ID}
                            disabled={isSaving}
                            className="gap-2"
                        >
                            {isSaving ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
                            {isCreate ? "Create student" : "Save changes"}
                        </Button>
                    </DialogFooter>
                ) : null}
            </DialogContent>
        </Dialog>
    );
};

export default QuickEditStudent;
