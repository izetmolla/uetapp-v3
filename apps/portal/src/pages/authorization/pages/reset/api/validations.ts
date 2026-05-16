import { z } from "zod";

export const resetPasswordSchema = z.object({
    email: z.string().min(1, { message: 'Please enter your email' }),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>