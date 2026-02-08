import { useApiMutation } from "@/lib/query/base/use-api-mutation";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { CreateDonationCauseDto, DonationCauseResponseDto } from "@/types/donation-causes";

export const useCreateDonationCauseMutation = () => {
    return useApiMutation<DonationCauseResponseDto, unknown, CreateDonationCauseDto>({
        url: API_ENDPOINTS.donationCauses.createDonationCause,
        method: "POST",
        invalidateKeys: [queryKeys.donationCauses.all],
        successToast: { title: "Cause Created", description: "The donation cause has been successfully created." },
    });
};

export const useUpdateDonationCauseMutation = () => {
    return useApiMutation<DonationCauseResponseDto, unknown, { id: string; data: Partial<CreateDonationCauseDto> }>({
        getUrl: (variables) => API_ENDPOINTS.donationCauses.updateDonationCause(variables.id),
        method: "PATCH",
        getBody: (variables) => variables.data,
        invalidateKeys: [queryKeys.donationCauses.all],
        successToast: { title: "Cause Updated", description: "The donation cause has been successfully updated." },
    });
};

export const useDeleteDonationCauseMutation = () => {
    return useApiMutation<void, unknown, { id: string }>({
        getUrl: (variables) => API_ENDPOINTS.donationCauses.deleteDonationCause(variables.id),
        method: "DELETE",
        invalidateKeys: [queryKeys.donationCauses.all],
        successToast: { title: "Cause Deleted", description: "The donation cause has been successfully deleted." },
    });
};
