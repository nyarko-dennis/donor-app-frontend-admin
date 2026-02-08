import { z } from "zod";

export const subConstituencySchema = z.object({
    name: z.string().min(1, "Name is required"),
    constituency_id: z.string().min(1, "Parent Constituency is required"),
    description: z.string().optional(),
    order: z.number().optional(),
});

export type SubConstituencyFormValues = z.infer<typeof subConstituencySchema>;
