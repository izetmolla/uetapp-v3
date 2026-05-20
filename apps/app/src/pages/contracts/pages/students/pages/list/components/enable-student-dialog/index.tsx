import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { FC } from "react";
import { toast } from "sonner";
import {
    getApiErrorMessageFromBody,
    isApiErrorBody,
    queryClient,
} from "@workspace/flowtrove/lib/network";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@workspace/ui/components/alert-dialog";
import { STUDENTS_FETCH_PERSISTANT } from "../../api";
import useStudentsListStore from "../../store";
import { getStudentLabel } from "../../lib/student-label";
import { enableStudents } from "./api";

const EnableStudentDialog: FC = () => {
    const { selectedStudent, isEnableDialogOpen, closeDialogs } = useStudentsListStore();
    const listQueryKey = [STUDENTS_FETCH_PERSISTANT, "students"] as const;

    const mutation = useMutation({
        mutationFn: (ids: number[]) => enableStudents(ids),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, "Failed to enable student"), {
                    richColors: true,
                });
                return;
            }
            toast.success("Student enabled successfully", { richColors: true });
            void queryClient.invalidateQueries({ queryKey: listQueryKey });
            void queryClient.invalidateQueries({ queryKey: [STUDENTS_FETCH_PERSISTANT, "stats"] });
            closeDialogs();
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(err?.response?.data?.message ?? err?.message ?? "Failed to enable student", {
                richColors: true,
            });
        },
    });

    const name = getStudentLabel(selectedStudent);

    return (
        <AlertDialog open={isEnableDialogOpen} onOpenChange={(open) => !open && closeDialogs()}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Enable student?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Enable &quot;{name}&quot;? The student will be marked active again.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={mutation.isPending}>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        disabled={mutation.isPending || !selectedStudent?.id}
                        onClick={(e) => {
                            e.preventDefault();
                            if (selectedStudent?.id) mutation.mutate([selectedStudent.id]);
                        }}
                        className="gap-2"
                    >
                        {mutation.isPending ? (
                            <Loader2 className="size-4 animate-spin" aria-hidden />
                        ) : null}
                        Enable
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default EnableStudentDialog;
