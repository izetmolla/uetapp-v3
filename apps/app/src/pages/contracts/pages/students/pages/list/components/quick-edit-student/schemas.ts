import { z } from "zod";

export const STATUS_VALUES = ["active", "inactive"] as const;

export const studentSchema = z.object({
    firstname: z.string().trim().min(1, "First name is required").max(255),
    lastname: z.string().trim().min(1, "Last name is required").max(255),
    email: z.union([z.literal(""), z.string().trim().email("Invalid email").max(255)]),
    document_id: z.string().max(255).optional(),
    pasport_number: z.string().max(255).optional(),
    status: z.enum(STATUS_VALUES),
    user_id: z
        .string()
        .trim()
        .uuid("Invalid user ID")
        .optional()
        .or(z.literal("")),
});

export type StudentFormValues = z.infer<typeof studentSchema>;

export function parseStudentInput(data: unknown): StudentFormValues {
    return studentSchema.parse(data);
}
