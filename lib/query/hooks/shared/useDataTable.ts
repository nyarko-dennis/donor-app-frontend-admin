"use client";

import * as React from "react";
import { PaginationState, SortingState } from "@tanstack/react-table";
import { PaginationParams, Order, PageDto } from "@/types/pagination";

interface UseDataTableOptions<TData, TParams extends PaginationParams> {
    sort?: string[]; // e.g. ["field,ASC"] - adapted from backend logic if needed, or just allow params override
    search?: string;
    [key: string]: unknown;
}

interface UseDataTableResult<TData> {
    tableData: TData[];
    totalElements: number;
    pageCount: number;
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useDataTable<TData, TParams extends PaginationParams = PaginationParams>(
    useQueryHook: (params: TParams) => {
        data: PageDto<TData> | undefined;
        isLoading: boolean;
        isFetching: boolean;
        error: Error | null;
        refetch: () => void;
    },
    initialParams: TParams,
    extraParams?: Partial<TParams> & { sort?: string[] } // Handling the sort specifically if needed
): UseDataTableResult<TData> {

    // -- Pagination State --
    // We initialize from initialParams or default to page=0 (frontend index), take=10
    const initialPageIndex = (initialParams.page && initialParams.page > 0) ? initialParams.page - 1 : 0;
    const initialPageSize = initialParams.take || 10;

    const [pagination, setPagination] = React.useState<PaginationState>({
        pageIndex: initialPageIndex,
        pageSize: initialPageSize,
    });

    // -- Construct Query Params --
    // Map frontend pagination (0-based) to backend (1-based)
    // Merge with initialParams and extraParams
    const queryParams: TParams = React.useMemo(() => {

        // Base params
        const params = {
            ...initialParams,
            ...extraParams,
            page: pagination.pageIndex + 1,
            take: pagination.pageSize,
        } as TParams;

        // Handle Sorting Map
        // The generic table passes `sort` as an array of strings like ["created_at,desc"] or similar
        // The backend `PageOptionsDto` expects a single `order` field: Order.ASC | Order.DESC
        // AND presumably it needs to know which field to sort by. 
        // FROWNING: Backend `PageOptionsDto` only has `order: Order`. It DOES NOT seem to have a `sortBy` field.
        // CHECK: Does `PageOptionsDto` allow sorting by specific fields?
        // The definition I saw: `readonly order: Order = Order.ASC;`
        // It implies there might be a default sort field or it's handled elsewhere.
        // IF the backend only supports simple "ASC/DESC" on a default field, we map to that.
        // IF the backend supports filtering/sorting by fields via other params, we pass them through.

        // For now, if the hook receives a 'sort' array from the table, we might need to extract the direction
        // to map to `order`. 
        // Example: sort: ["createdAt,desc"] -> order: Order.DESC
        if (extraParams?.sort && extraParams.sort.length > 0) {
            const sortString = extraParams.sort[0]; // Take first sort
            if (sortString.toLowerCase().includes('desc')) {
                params.order = Order.DESC;
            } else {
                params.order = Order.ASC;
            }
        }

        return params;
    }, [pagination.pageIndex, pagination.pageSize, initialParams, extraParams]);

    // -- Data Fetching --
    const {
        data,
        isLoading,
        isFetching,
        error,
        refetch
    } = useQueryHook(queryParams);

    // -- Derived State --
    const tableData = React.useMemo(() => data?.data || [], [data]);
    const totalElements = data?.meta?.itemCount || 0;
    const pageCount = data?.meta?.pageCount || 0;

    return {
        tableData,
        totalElements,
        pageCount,
        pagination,
        setPagination,
        isLoading,
        isFetching,
        error,
        refetch,
    };
}
