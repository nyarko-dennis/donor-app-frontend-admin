import { useApiMutation } from "@/lib/query/base/use-api-mutation";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { CreateDonorDto, DonorResponseDto } from "@/types/donors";

export const useCreateDonorMutation = () => {
    return useApiMutation<DonorResponseDto, unknown, CreateDonorDto>({
        url: API_ENDPOINTS.donors.createDonor,
        method: "POST",
        invalidateKeys: [queryKeys.donors.all],
        successToast: { title: "Donor Created", description: "The donor has been successfully created." },
    });
};

export const useUpdateDonorMutation = () => {
    return useApiMutation<DonorResponseDto, unknown, { id: string; data: Partial<CreateDonorDto> }>({
        getUrl: (variables) => API_ENDPOINTS.donors.updateDonor(variables.id),
        method: "PATCH",
        getBody: (variables) => variables.data,
        invalidateKeys: [queryKeys.donors.all],
        successToast: { title: "Donor Updated", description: "The donor has been successfully updated." },
    });
};

export const useDeleteDonorMutation = () => {
    return useApiMutation<void, unknown, { id: string }>({
        getUrl: (variables) => API_ENDPOINTS.donors.deleteDonor(variables.id),
        method: "DELETE",
        invalidateKeys: [queryKeys.donors.all],
        successToast: { title: "Donor Deleted", description: "The donor has been successfully deleted." },
    });
};
