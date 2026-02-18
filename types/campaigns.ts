export interface CreateCampaignDto extends Record<string, unknown> {
    name: string;
    description?: string;
    target_audience?: string;
    goal_amount?: number;
    start_date?: string;
    end_date?: string;
    status?: string;
}

import { PaginationParams } from "./pagination";

export interface CampaignsFilterParams extends PaginationParams {
    status?: string | string[];
    minGoal?: number;
    maxGoal?: number;
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
