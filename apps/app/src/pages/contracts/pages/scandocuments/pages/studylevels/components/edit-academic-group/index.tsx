import { useCallback, useEffect, useMemo, type FC } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FolderPlus, Loader2 } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@workspace/ui/components/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import { ReactSelect } from "@workspace/ui/components/reactselect";
import {
    getApiErrorMessageFromBody,
    isApiErrorBody,
} from "@workspace/flowtrove/lib/network";
import { editAcademicGroup, editStudyLevelGroupSchema, type EditStudyLevelGroupSchema } from "./api";
import useStudyLevelGroupStore from "../../store";
import type { StudyLevel } from "../../api";
import { useParams } from "react-router";

const FORM_ID = "edit-study-level-group-form";

type StudyLevelOption = { label: string; value: string };


interface EditStudyLevelGroupDialogProps {
    study_levels: StudyLevel[];
}
const EditStudyLevelGroupDialog: FC<EditStudyLevelGroupDialogProps> = ({ study_levels }) => {
    const { year = "", faculty_slug = "" } = useParams();
    const {
        studyLevelGroup,
        setStudyLevelGroup,
        isEditStudyLevelGroupDialogOpen,
        setIsEditStudyLevelGroupDialogOpen,
    } = useStudyLevelGroupStore();

    const studyLevelOptions = useMemo<StudyLevelOption[]>(
        () =>
            study_levels.map((studyLevel) => ({
                label: studyLevel.name,
                value: String(studyLevel.id),
            })),
        [study_levels],
    );

    const form = useForm<EditStudyLevelGroupSchema>({
        resolver: zodResolver(editStudyLevelGroupSchema),
        defaultValues: {
            id: studyLevelGroup?.id != null ? String(studyLevelGroup.id) : "",
            name: studyLevelGroup?.name ?? "",
            study_levels: studyLevelGroup?.study_levels?.map((level) => String(level.id)) ?? [],
            year,
            faculty:faculty_slug,
        },
    });


    useEffect(() => {
        if (!isEditStudyLevelGroupDialogOpen) return;
        form.reset({
            id: studyLevelGroup?.id != null ? String(studyLevelGroup.id) : "",
            name: studyLevelGroup?.name ?? "",
            study_levels: studyLevelGroup?.study_levels?.map((level) => String(level.id)) ?? [],
            year,
            faculty:faculty_slug,
        });
    }, [form, studyLevelGroup, isEditStudyLevelGroupDialogOpen]);

    const onClose = useCallback(() => {
        setStudyLevelGroup(null);
        setIsEditStudyLevelGroupDialogOpen(false);
    }, [setStudyLevelGroup, setIsEditStudyLevelGroupDialogOpen]);

    const mutation = useMutation({
        mutationFn: editAcademicGroup,
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(getApiErrorMessageFromBody(res, "Failed to edit study level group"), {
                    richColors: true,
                });
                return;
            }
            toast.success(res?.message ?? "Study level group edited successfully", { richColors: true });
            onClose();
        },
        onError: (error: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(error?.response?.data?.message ?? error?.message ?? "Failed to edit study level group", {
                richColors: true,
            });
        },
    });

    return (
        <Dialog open={isEditStudyLevelGroupDialogOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="gap-0 overflow-hidden rounded-xl p-0 sm:max-w-lg">
                <Form {...form}>
                    <form
                        id={FORM_ID}
                        onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
                    >
                        <div className="bg-gradient-to-b from-primary/10 to-background px-6 pt-6 pb-4">
                            <div className="mx-auto mb-3 flex size-11 items-center justify-center rounded-full border border-primary/20 bg-primary/10 text-primary">
                                <FolderPlus className="size-5" aria-hidden />
                            </div>
                            <DialogHeader className="text-center">
                                <DialogTitle>{studyLevelGroup?.id ? "Edit study level group" : "Create new study level group"}</DialogTitle>
                                <DialogDescription>
                                    {studyLevelGroup?.id ? "Save the study level group details." : "Add a new study level group for this study level."}
                                </DialogDescription>
                            </DialogHeader>
                        </div>
                        <div className="space-y-4 px-6 py-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                {...field}
                                                placeholder="Study level group name"
                                                autoComplete="off"
                                                autoFocus
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="study_levels"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Study levels</FormLabel>
                                        <FormControl>
                                            <ReactSelect<StudyLevelOption, true>
                                                isMulti
                                                wrapOptionText
                                                options={studyLevelOptions}
                                                placeholder="Select study levels"
                                                invalid={!!form.formState.errors.study_levels}
                                                value={field.value ?? []}
                                                onValueChange={(values) => field.onChange(values)}
                                                onBlur={field.onBlur}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <DialogFooter className="gap-2 border-t bg-muted/20 px-6 py-4 sm:justify-end">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={mutation.isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={mutation.isPending}
                                className="gap-2"
                            >
                                {mutation.isPending ? (
                                    <Loader2 className="size-4 animate-spin" aria-hidden />
                                ) : null}
                                Save
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};

export default EditStudyLevelGroupDialog;
