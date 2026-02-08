import { z } from "zod"

export const donorSchema = z.object({
    first_name: z.string().min(1, "First name is required"),
    last_name: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().optional(),
    constituency: z.string().optional(),
    sub_constituency: z.string().optional(),
})

export type DonorFormValues = z.infer<typeof donorSchema>
