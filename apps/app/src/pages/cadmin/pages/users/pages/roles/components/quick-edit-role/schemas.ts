import { z } from "zod";

export const STATUS_VALUES = ["active", "inactive"] as const;

export const roleSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(50, "Name must be at most 50 characters")
        .regex(/^[a-z0-9_-]+$/i, "Use letters, numbers, hyphens, or underscores only"),
    description: z.string().max(255, "Description must be at most 255 characters").optional(),
    status: z.enum(STATUS_VALUES),
});

export type RoleFormValues = z.infer<typeof roleSchema>;
