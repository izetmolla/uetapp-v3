import { z } from "zod";

export const signUpSchema = z.object({
    first_name: z.string().min(1, { message: 'Please enter your first name' }),
    last_name: z.string().min(1, { message: 'Please enter your last name' }),
    email: z.string().min(1, { message: 'Please enter your email or username' }),
    password: z.string().min(1, { message: 'Please enter your password' }),
})

export type SignUpSchema = z.infer<typeof signUpSchema>