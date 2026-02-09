import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { SubConstituencyResponseDto, SubConstituenciesFilterParams } from "@/types/constituencies";
import { PageDto } from "@/types/pagination";

export const useSubConstituencies = (params?: SubConstituenciesFilterParams) => {
    return useApiQuery<PageDto<SubConstituencyResponseDto>>({
        url: API_ENDPOINTS.constituencies.getSubConstituencies,
        queryKey: [...queryKeys.constituencies.subConstituencies.all, params],
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
