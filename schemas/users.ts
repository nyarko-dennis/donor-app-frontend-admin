import { z } from "zod"
import { UserRole } from "@/types/users"

export const userSchema = z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    last_name: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal('')),
    role: z.enum(UserRole),
})

export type UserFormValues = z.infer<typeof userSchema>
