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
    created_at: Date;
}
