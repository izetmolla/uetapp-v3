import { z } from "zod";

export const STATUS_VALUES = [
    "active",
    "inactive",
    "suspended",
    "new",
    "pending",
    "disabled",
] as const;

export const generalSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email"),
    username: z.string().optional(),
    ldap_username: z.string().optional(),
    image: z.string().optional(),
    status: z.enum(STATUS_VALUES),
});

export const passwordSchema = z
    .object({
        password: z.string().optional(),
        password_confirm: z.string().optional(),
        is_confirmed: z.boolean(),
    })
    .superRefine((data, ctx) => {
        const password = data.password?.trim() ?? "";
        const confirm = data.password_confirm?.trim() ?? "";
        if (!password && !confirm) return;
        if (password.length < 8) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Password must be at least 8 characters",
                path: ["password"],
            });
        }
        if (password !== confirm) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Passwords do not match",
                path: ["password_confirm"],
            });
        }
    });

export type GeneralFormValues = z.infer<typeof generalSchema>;
export type PasswordFormValues = z.infer<typeof passwordSchema>;
