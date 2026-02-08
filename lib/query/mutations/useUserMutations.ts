import { useApiMutation } from "@/lib/query/base/use-api-mutation";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { CreateUserDto, UserResponseDto } from "@/types/users";

export const useCreateUserMutation = () => {
    return useApiMutation<UserResponseDto, unknown, CreateUserDto>({
        url: API_ENDPOINTS.users.createUser,
        method: "POST",
        invalidateKeys: [queryKeys.users.all],
        successToast: { title: "User Created", description: "The user has been successfully created." },
    });
};

export const useUpdateUserMutation = () => {
    return useApiMutation<UserResponseDto, unknown, { id: string; data: Partial<CreateUserDto> }>({
        getUrl: (variables) => API_ENDPOINTS.users.updateUser(variables.id),
        method: "PATCH",
        getBody: (variables) => variables.data,
        invalidateKeys: [queryKeys.users.all],
        successToast: { title: "User Updated", description: "The user has been successfully updated." },
    });
};

export const useDeleteUserMutation = () => {
    return useApiMutation<void, unknown, { id: string }>({
        getUrl: (variables) => API_ENDPOINTS.users.deleteUser(variables.id),
        method: "DELETE",
        invalidateKeys: [queryKeys.users.all],
        successToast: { title: "User Deleted", description: "The user has been successfully deleted." },
    });
};
