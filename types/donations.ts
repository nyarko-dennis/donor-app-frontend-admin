import { PaginationParams } from "./pagination";

export interface CreateDonationDto extends Record<string, unknown> {
    amount: number;
    currency: string;
    payment_method: string;
    transaction_id: string;
    notes?: string;
    status: string;
    created_at: Date | string;
    donation_date?: string;
}

export interface DonationsFilterParams extends PaginationParams {
    donorId?: string | string[];
    campaignId?: string | string[];
    causeId?: string | string[];
    minAmount?: number;
    maxAmount?: number;
    startDate?: string;
    endDate?: string;
    paymentMethod?: string | string[];
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
    donation_date?: string;
}
