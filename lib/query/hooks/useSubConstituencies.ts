import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { SubConstituencyResponseDto } from "@/types/constituencies";
import { PageDto, PaginationParams } from "@/types/pagination";

export const useSubConstituencies = (params?: PaginationParams) => {
    return useApiQuery<PageDto<SubConstituencyResponseDto>>({
        url: API_ENDPOINTS.constituencies.getSubConstituencies,
        queryKey: [...queryKeys.constituencies.all, 'sub', params],
        params,
    });
};

export const useSubConstituency = (id: string) => {
    return useApiQuery<SubConstituencyResponseDto>({
        url: API_ENDPOINTS.constituencies.getSubConstituencyById(id),
        queryKey: [...queryKeys.constituencies.all, 'sub', id],
        enabled: !!id,
    });
};
