import { useApiQuery } from "@/lib/query/base/use-api-query";
import { useInfiniteApiQuery } from "@/lib/query/base/use-infinite-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { DonorResponseDto, DonorsFilterParams } from "@/types/donors";
import { PageDto } from "@/types/pagination";

export const useDonors = (params?: DonorsFilterParams) => {
    return useApiQuery<PageDto<DonorResponseDto>>({
        url: API_ENDPOINTS.donors.getDonors,
        queryKey: [...queryKeys.donors.all, params],
        params,
    });
};

export const useInfiniteDonors = (params?: DonorsFilterParams) => {
    return useInfiniteApiQuery<DonorResponseDto>({
        url: API_ENDPOINTS.donors.getDonors,
        queryKey: [...queryKeys.donors.all, "infinite", params],
        params,
        initialPageParam: 1,
    });
};

export const useDonor = (id: string) => {
    return useApiQuery<DonorResponseDto>({
        url: API_ENDPOINTS.donors.getDonorById(id),
        queryKey: queryKeys.donors.detail(id),
        enabled: !!id,
    });
};
