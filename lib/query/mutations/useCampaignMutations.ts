import { useApiMutation } from "@/lib/query/base/use-api-mutation";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { CreateCampaignDto, CampaignResponseDto } from "@/types/campaigns";

export const useCreateCampaignMutation = () => {
    return useApiMutation<CampaignResponseDto, unknown, CreateCampaignDto>({
        url: API_ENDPOINTS.campaigns.createCampaign,
        method: "POST",
        invalidateKeys: [queryKeys.campaigns.all],
        successToast: { title: "Campaign Created", description: "The campaign has been successfully created." },
    });
};

export const useUpdateCampaignMutation = () => {
    return useApiMutation<CampaignResponseDto, unknown, { id: string; data: Partial<CreateCampaignDto> }>({
        getUrl: (variables) => API_ENDPOINTS.campaigns.updateCampaign(variables.id),
        method: "PATCH",
        getBody: (variables) => variables.data,
        invalidateKeys: [queryKeys.campaigns.all],
        successToast: { title: "Campaign Updated", description: "The campaign has been successfully updated." },
    });
};

export const useDeleteCampaignMutation = () => {
    return useApiMutation<void, unknown, { id: string }>({
        getUrl: (variables) => API_ENDPOINTS.campaigns.deleteCampaign(variables.id),
        method: "DELETE",
        invalidateKeys: [queryKeys.campaigns.all],
        successToast: { title: "Campaign Deleted", description: "The campaign has been successfully deleted." },
    });
};
