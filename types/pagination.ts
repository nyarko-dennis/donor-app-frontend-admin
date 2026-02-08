export enum Order {
    ASC = 'ASC',
    DESC = 'DESC',
}

export interface PaginationParams {
    page?: number;
    take?: number;
    order?: Order;
    search?: string;
    [key: string]: string | number | boolean | Order | undefined;
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
