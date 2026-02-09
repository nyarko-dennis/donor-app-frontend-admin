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
}

import { PaginationParams } from "./pagination";

export interface DonorsFilterParams extends PaginationParams {
    constituencyId?: string;
    subConstituencyId?: string;
}
