import { useApiMutation } from "@/lib/query/base/use-api-mutation";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { CreateDonationDto, DonationResponseDto } from "@/types/donations";

export const useCreateDonationMutation = () => {
    return useApiMutation<DonationResponseDto, unknown, CreateDonationDto>({
        url: API_ENDPOINTS.donations.createDonation,
        method: "POST",
        invalidateKeys: [queryKeys.donations.all],
        successToast: { title: "Donation Created", description: "The donation has been successfully created." },
    });
};

export const useUpdateDonationMutation = () => {
    return useApiMutation<DonationResponseDto, unknown, { id: string; data: Partial<CreateDonationDto> }>({
        getUrl: (variables) => API_ENDPOINTS.donations.updateDonation(variables.id),
        method: "PATCH",
        getBody: (variables) => variables.data,
        invalidateKeys: [queryKeys.donations.all],
        successToast: { title: "Donation Updated", description: "The donation has been successfully updated." },
    });
};

export const useDeleteDonationMutation = () => {
    return useApiMutation<void, unknown, { id: string }>({
        getUrl: (variables) => API_ENDPOINTS.donations.deleteDonation(variables.id),
        method: "DELETE",
        invalidateKeys: [queryKeys.donations.all],
        successToast: { title: "Donation Deleted", description: "The donation has been successfully deleted." },
    });
};
