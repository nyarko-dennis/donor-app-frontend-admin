export interface CreateDonationDto extends Record<string, unknown> {
    amount: number;
    currency: string;
    payment_method: string;
    donation_cause: string;
    donorId: string;
    campaignId: string;
}

export interface DonationResponseDto {
    id: string;
    amount: number;
    currency: string;
    payment_method: string;
    donation_cause: string;
    donor_id: string;
    campaign_id: string;
    created_at: Date;
}
