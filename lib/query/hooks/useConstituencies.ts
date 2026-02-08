import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { ConstituencyResponseDto } from "@/types/constituencies";
import { PageDto, PaginationParams } from "@/types/pagination";

export const useConstituencies = (params?: PaginationParams, options?: { enabled?: boolean }) => {
    return useApiQuery<PageDto<ConstituencyResponseDto>>({
        url: API_ENDPOINTS.constituencies.getConstituencies,
        queryKey: [...queryKeys.constituencies.all, params],
        params,
        enabled: options?.enabled,
    });
};

export const useConstituency = (id: string) => {
    return useApiQuery<ConstituencyResponseDto>({
        url: API_ENDPOINTS.constituencies.getConstituencyById(id),
        queryKey: queryKeys.constituencies.detail(id),
        enabled: !!id,
    });
};
