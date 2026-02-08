import { z } from "zod"

export const donationCauseSchema = z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    is_active: z.boolean(),
})

export type DonationCauseFormValues = z.infer<typeof donationCauseSchema>
