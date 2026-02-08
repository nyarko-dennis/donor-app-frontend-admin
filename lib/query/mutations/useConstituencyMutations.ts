import { useApiMutation } from "@/lib/query/base/use-api-mutation";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import {
    CreateConstituencyDto,
    ConstituencyResponseDto,
    CreateSubConstituencyDto,
    SubConstituencyResponseDto
} from "@/types/constituencies";

// Constituency Mutations
export const useCreateConstituencyMutation = () => {
    return useApiMutation<ConstituencyResponseDto, unknown, CreateConstituencyDto>({
        url: API_ENDPOINTS.constituencies.createConstituency,
        method: "POST",
        invalidateKeys: [queryKeys.constituencies.all],
        successToast: { title: "Constituency Created", description: "The constituency has been successfully created." },
    });
};

export const useUpdateConstituencyMutation = () => {
    return useApiMutation<ConstituencyResponseDto, unknown, { id: string; data: Partial<CreateConstituencyDto> }>({
        getUrl: (variables) => API_ENDPOINTS.constituencies.updateConstituency(variables.id),
        method: "PATCH",
        getBody: (variables) => variables.data,
        invalidateKeys: [queryKeys.constituencies.all],
        successToast: { title: "Constituency Updated", description: "The constituency has been successfully updated." },
    });
};

export const useDeleteConstituencyMutation = () => {
    return useApiMutation<void, unknown, { id: string }>({
        getUrl: (variables) => API_ENDPOINTS.constituencies.deleteConstituency(variables.id),
        method: "DELETE",
        invalidateKeys: [queryKeys.constituencies.all],
        successToast: { title: "Constituency Deleted", description: "The constituency has been successfully deleted." },
    });
};

// Sub-Constituency Mutations
export const useCreateSubConstituencyMutation = () => {
    return useApiMutation<SubConstituencyResponseDto, unknown, CreateSubConstituencyDto & { constituencyId: string }>({
        getUrl: (variables) => API_ENDPOINTS.constituencies.createSubConstituency(variables.constituencyId),
        method: "POST",
        getBody: (variables) => {
            const { constituencyId, ...data } = variables;
            return { ...data, constituency_id: constituencyId }; // Ensure body matches DTO if needed specifically
        },
        invalidateKeys: [queryKeys.constituencies.all], // Invalidate parent list or specific sub list
        successToast: { title: "Sub-Constituency Created", description: "The sub-constituency has been successfully created." },
    });
};

export const useUpdateSubConstituencyMutation = () => {
    return useApiMutation<SubConstituencyResponseDto, unknown, { id: string; data: Partial<CreateSubConstituencyDto> }>({
        getUrl: (variables) => API_ENDPOINTS.constituencies.updateSubConstituency(variables.id),
        method: "PATCH",
        getBody: (variables) => variables.data,
        invalidateKeys: [queryKeys.constituencies.all],
        successToast: { title: "Sub-Constituency Updated", description: "The sub-constituency has been successfully updated." },
    });
};

export const useDeleteSubConstituencyMutation = () => {
    return useApiMutation<void, unknown, { id: string }>({
        getUrl: (variables) => API_ENDPOINTS.constituencies.deleteSubConstituency(variables.id),
        method: "DELETE",
        invalidateKeys: [queryKeys.constituencies.all],
        successToast: { title: "Sub-Constituency Deleted", description: "The sub-constituency has been successfully deleted." },
    });
};
