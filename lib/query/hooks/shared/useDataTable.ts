import { useState, useMemo } from 'react';
import { PaginationParams, PaginationResponse } from "@/types/pagination";
import { useAccessToken } from "@/hooks/useAccessToken";

interface QueryResult<TData> {
    data?: PaginationResponse<TData>;
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
    refetch: () => void;
}

export function useDataTable<TData, TParams extends PaginationParams = PaginationParams>(
    useQueryHook: (params: TParams) => QueryResult<TData>,
    initialParams: TParams,
    extraParams?: Partial<TParams>
) {
    const { status } = useAccessToken();
    const loadingToken = status === "loading";
    // Align local pagination state with app PaginationParams (page, pageSize)
    const [pagination, setPagination] = useState({
        // Convert 1-based page from backend to 0-based pageIndex for the table UI
        pageIndex: Math.max(0, ((initialParams.page as number | undefined) ?? 1) - 1),
        pageSize: (initialParams as PaginationParams).take || (initialParams as any).pageSize || 10,
    });

    // Memoize query parameters to prevent unnecessary re-renders
    const queryParams = useMemo(() => ({
        ...initialParams,
        ...(extraParams as object),
        // Convert UI's 0-based pageIndex to backend's 1-based "page"
        page: pagination.pageIndex + 1,
        // Support widely used "pageSize" or "take"
        pageSize: Math.max(1, pagination.pageSize),
        take: Math.max(1, pagination.pageSize),
    }), [initialParams, extraParams, pagination.pageIndex, pagination.pageSize]);

    // Use the provided query hook
    const queryResult = useQueryHook(queryParams as TParams);

    // Extract data safely
    const tableData = useMemo(() => {
        if (!queryResult.data) return [] as TData[];
        // Support shapes:
        // 1) PaginationResponse<T>: { data, total, page, pageSize }
        // 2) Spring-like Page<T>: { content, totalElements, ... }
        // 3) NestJS PageDto<T>: { data, meta: { itemCount, ... } }
        const anyData = queryResult.data as unknown as {
            data?: TData[];
            content?: TData[];
        };
        return (anyData.data ?? anyData.content ?? []) as TData[];
    }, [queryResult.data]);

    // Calculate total pages safely
    const totalElements = useMemo(() => {
        if (!queryResult.data) return 0;
        const anyData = queryResult.data as unknown as {
            total?: number;
            totalElements?: number;
            meta?: { itemCount: number };
        };
        return (anyData.total ?? anyData.totalElements ?? anyData.meta?.itemCount ?? 0) as number;
    }, [queryResult.data]);

    return {
        pagination,
        setPagination,
        queryParams,
        queryResult,
        tableData,
        totalElements,
        // Consider loading if either the access token or the query is loading
        isLoading: Boolean(loadingToken || queryResult.isLoading),
        isFetching: queryResult.isFetching,
        error: queryResult.error,
        refetch: queryResult.refetch
    };
}
