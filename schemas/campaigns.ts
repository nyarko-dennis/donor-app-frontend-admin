import { z } from "zod"

export const campaignSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    description: z.string().optional(),
    target_audience: z.string().optional(),
    goal_amount: z.coerce.number().min(1, "Goal amount must be at least 1"),
    start_date: z.coerce.date(),
    end_date: z.coerce.date(),
    status: z.string().optional(),
}).refine((data) => data.end_date >= data.start_date, {
    message: "End date must be after start date",
    path: ["end_date"],
})

export type CampaignFormValues = z.infer<typeof campaignSchema>
