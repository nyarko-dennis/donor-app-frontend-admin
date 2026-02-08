import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { CampaignResponseDto } from "@/types/campaigns";
import { PageDto, PaginationParams } from "@/types/pagination"; // Assuming these exist or I need to create them/import them if they exist in codebase

export const useCampaigns = (params?: PaginationParams) => {
    return useApiQuery<PageDto<CampaignResponseDto>>({
        url: API_ENDPOINTS.campaigns.getCampaigns,
        queryKey: [...queryKeys.campaigns.all, params],
        params,
    });
};

export const useCampaign = (id: string) => {
    return useApiQuery<CampaignResponseDto>({
        url: API_ENDPOINTS.campaigns.getCampaignById(id),
        queryKey: queryKeys.campaigns.detail(id),
        enabled: !!id,
    });
};
