import { z } from "zod";

export const signInSchema = z.object({
    email: z.string().min(1, { message: 'Please enter your email or username' }),
    password: z.string().optional(),
    checkEmail: z.boolean().optional(),
})

export type SignInSchema = z.infer<typeof signInSchema>