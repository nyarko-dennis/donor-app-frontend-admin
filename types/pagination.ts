export enum Order {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface PaginationParams {
    page?: number;
    take?: number;
    order?: Order;
    sortBy?: string;
    search?: string;
    [key: string]: string | number | boolean | Order | string[] | undefined;
}

export interface PageMetaDto {
    page: number;
    take: number;
    itemCount: number;
    pageCount: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
}

export interface PageDto<T> {
    data: T[];
    meta: PageMetaDto;
}

// Alias for compatibility with user's hook pattern
export type PaginationResponse<T> = PageDto<T> | {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
} | {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
};
