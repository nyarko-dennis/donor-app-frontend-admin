import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { DonationCauseResponseDto, DonationCausesFilterParams } from "@/types/donation-causes";
import { PageDto } from "@/types/pagination";

export const useDonationCauses = (params?: DonationCausesFilterParams) => {
    return useApiQuery<PageDto<DonationCauseResponseDto>>({
        url: API_ENDPOINTS.donationCauses.getDonationCauses,
        queryKey: [...queryKeys.donationCauses.all, params],
        params,
    });
};

export const useDonationCause = (id: string) => {
    return useApiQuery<DonationCauseResponseDto>({
        url: API_ENDPOINTS.donationCauses.getDonationCauseById(id),
        queryKey: queryKeys.donationCauses.detail(id),
        enabled: !!id,
    });
};
