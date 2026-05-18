import { z } from "zod";

export const slugEntityFormSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    slug: z.string().min(1, "Slug is required"),
    description: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    status: z.enum(["active", "inactive"]),
});

export type SlugEntityFormValues = z.infer<typeof slugEntityFormSchema>;

export const departmentFormSchema = slugEntityFormSchema.extend({
    faculty_id: z.string().min(1, "Faculty is required"),
});

export type DepartmentFormValues = z.infer<typeof departmentFormSchema>;
