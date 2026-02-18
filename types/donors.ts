export interface CreateDonorDto extends Record<string, unknown> {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
    constituency?: string;
    sub_constituency?: string;
}

export interface DonorResponseDto {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
    constituency: string;
    sub_constituency?: string;
    constituency_id?: string;
    sub_constituency_id?: string;
    created_at: Date;
    donations?: DonorDonationResponseDto[];
}

export interface DonorDonationResponseDto {
    id: string;
    amount: string | number;
    currency: string;
    payment_method: string;
    cause?: {
        id: string;
        name: string;
    };
    donation_cause?: string;
    campaign?: {
        id: string;
        name: string;
    };
    created_at?: Date | string;
    donation_date?: string | Date;
}

import { PaginationParams } from "./pagination";

export interface DonorsFilterParams extends PaginationParams {
    constituencyId?: string | string[];
    subConstituencyId?: string | string[];
}
