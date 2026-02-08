import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { DonationCauseResponseDto } from "@/types/donation-causes";

// Params might be different or optional for this simple list
export const useDonationCauses = () => {
    return useApiQuery<DonationCauseResponseDto[]>({
        url: API_ENDPOINTS.donationCauses.getDonationCauses,
        queryKey: queryKeys.donationCauses.all,
    });
};

export const useDonationCause = (id: string) => {
    return useApiQuery<DonationCauseResponseDto>({
        url: API_ENDPOINTS.donationCauses.getDonationCauseById(id),
        queryKey: queryKeys.donationCauses.detail(id),
        enabled: !!id,
    });
};
