
import { z } from "zod"

export const donationSchema = z.object({
    amount: z.number().min(1, "Amount must be at least 1"),
    currency: z.string().min(1, "Currency is required"),
    payment_method: z.string().min(1, "Payment method is required"),
    donation_cause: z.string().min(1, "Donation cause is required"),
    donorId: z.string().min(1, "Donor is required"),
    campaignId: z.string().min(1, "Campaign is required"),
    donation_date: z.string().optional(),
})

export type DonationFormValues = z.infer<typeof donationSchema>
