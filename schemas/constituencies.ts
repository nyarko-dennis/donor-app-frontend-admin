import { z } from "zod"

export const constituencySchema = z.object({
    name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
})

export type ConstituencyFormValues = z.infer<typeof constituencySchema>
