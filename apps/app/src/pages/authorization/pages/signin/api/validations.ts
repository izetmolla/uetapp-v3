import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().min(1, { message: 'Please enter your email or username' }),
    password: z.string().optional(),
    checkEmail: z.boolean().optional(),
}).superRefine((data, ctx) => {
    if (!data.checkEmail && !data.password?.trim()) {
        ctx.addIssue({
            code: 'custom',
            message: 'Please enter your password',
            path: ['password'],
        })
    }
})

export type SignInSchema = z.infer<typeof signInSchema>