import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { DonationResponseDto, DonationsFilterParams } from "@/types/donations";
import { PageDto } from "@/types/pagination";

export const useDonations = (params?: DonationsFilterParams) => {
    return useApiQuery<PageDto<DonationResponseDto>>({
        url: API_ENDPOINTS.donations.getDonations,
        queryKey: [...queryKeys.donations.all, params],
        params,
    });
};

export const useDonation = (id: string) => {
    return useApiQuery<DonationResponseDto>({
        url: API_ENDPOINTS.donations.getDonationById(id),
        queryKey: queryKeys.donations.detail(id),
        enabled: !!id,
    });
};
