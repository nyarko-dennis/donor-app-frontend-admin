export interface CreateDonationCauseDto extends Record<string, unknown> {
    name: string;
    description?: string;
    is_active?: boolean;
}

export interface DonationCauseResponseDto {
    id: string;
    name: string;
    description: string;
    is_active: boolean;
    created_at: Date;
}
