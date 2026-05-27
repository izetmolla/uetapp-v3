import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useEffect, type FC } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { getApiErrorMessageFromBody, isApiErrorBody } from "@workspace/flowtrove/lib/network";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@workspace/ui/components/form";
import { Input } from "@workspace/ui/components/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@workspace/ui/components/select";
import type { Student } from "../../api";
import { createStudent, updateStudent } from "./api";
import { QUICK_EDIT_STUDENT_FORM_ID } from "./form-ids";
import { studentSchema, STATUS_VALUES, type StudentFormValues } from "./schemas";

interface StudentFormProps {
    studentId: number;
    student: Student;
    isCreateMode?: boolean;
    onSaved: (student: Student) => void;
    onPendingChange: (pending: boolean) => void;
}

function toFormValues(student: Student): StudentFormValues {
    const status = student.status === "inactive" ? "inactive" : "active";
    return {
        firstname: student.firstname ?? "",
        lastname: student.lastname ?? "",
        email: student.email ?? "",
        document_id: student.document_id ?? "",
        pasport_number: student.pasport_number ?? "",
        status: STATUS_VALUES.includes(status as StudentFormValues["status"])
            ? (status as StudentFormValues["status"])
            : "active",
        user_id: student.user_id ?? "",
    };
}

const StudentForm: FC<StudentFormProps> = ({
    studentId,
    student,
    isCreateMode = false,
    onSaved,
    onPendingChange,
}) => {
    const form = useForm<StudentFormValues>({
        resolver: zodResolver(studentSchema),
        defaultValues: toFormValues(student),
    });

    useEffect(() => {
        form.reset(toFormValues(student));
    }, [form, student]);

    const mutation = useMutation({
        mutationFn: (data: StudentFormValues) =>
            isCreateMode ? createStudent(data) : updateStudent(studentId, data),
        onMutate: () => onPendingChange(true),
        onSettled: () => onPendingChange(false),
        onSuccess: (res) => {
            if (isApiErrorBody(res)) {
                toast.error(
                    getApiErrorMessageFromBody(
                        res,
                        isCreateMode ? "Failed to create student" : "Failed to update student",
                    ),
                    { richColors: true },
                );
                return;
            }
            toast.success(
                isCreateMode ? "Student created successfully" : "Student saved successfully",
                { richColors: true },
            );
            if (res.student) onSaved(res.student);
        },
        onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
            toast.error(
                err?.response?.data?.message ??
                    err?.message ??
                    (isCreateMode ? "Failed to create student" : "Failed to update student"),
                { richColors: true },
            );
        },
    });

    return (
        <Form {...form}>
            <form
                id={QUICK_EDIT_STUDENT_FORM_ID}
                className="flex flex-col gap-4"
                onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                    <Input {...field} autoComplete="given-name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                    <Input {...field} autoComplete="family-name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input {...field} type="email" autoComplete="email" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        control={form.control}
                        name="document_id"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>ID number</FormLabel>
                                <FormControl>
                                    <Input {...field} autoComplete="off" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="pasport_number"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Passport number</FormLabel>
                                <FormControl>
                                    <Input {...field} autoComplete="off" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="user_id"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Linked user ID</FormLabel>
                            <FormControl>
                                <Input {...field} placeholder="Optional UUID" autoComplete="off" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                {!isCreateMode ? (
                    <FormField
                        control={form.control}
                        name="status"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Status</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                ) : null}
            </form>
        </Form>
    );
};

export default StudentForm;
