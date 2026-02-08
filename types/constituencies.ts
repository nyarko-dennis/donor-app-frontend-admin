export interface CreateConstituencyDto {
    name: string;
}

export type UpdateConstituencyDto = Partial<CreateConstituencyDto>;

export interface CreateSubConstituencyDto {
    name: string;
    description?: string;
    order?: number;
    constituency_id?: string; // Optional in DTO creation if passed via URL param, but backend DTO has it as required. Frontend might not need to send it if endpoint handles it.
}

export type UpdateSubConstituencyDto = Partial<CreateSubConstituencyDto>;

export interface SubConstituencyResponseDto {
    id: string;
    name: string;
    description?: string;
    order?: number;
    constituency_id: string;
    constituency: {
        id: string;
        name: string;
        created_at: Date;
    };
    created_at: Date;
}

export interface ConstituencyResponseDto {
    id: string;
    name: string;
    sub_constituencies?: SubConstituencyResponseDto[];
    created_at: Date;
}
