export interface CreateCampaignDto extends Record<string, unknown> {
    name: string;
    description?: string;
    target_audience?: string;
    goal_amount?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
}

export interface CampaignResponseDto {
    id: string;
    name: string;
    description: string;
    target_audience: string;
    goal_amount: number;
    start_date: string;
    end_date: string;
    status: string;
    created_at: Date;
}
