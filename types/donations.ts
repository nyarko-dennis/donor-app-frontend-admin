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
    donor: {
        id: string;
        first_name: string;
        last_name: string;
        email: string;
    },
    campaign: {
        id: string;
        name: string;
        status: string;
    },
    created_at: Date;
}
