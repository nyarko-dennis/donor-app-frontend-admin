import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { UserResponseDto, UsersFilterParams } from "@/types/users";
import { PageDto } from "@/types/pagination";

export const useUsers = (params?: UsersFilterParams) => {
    return useApiQuery<PageDto<UserResponseDto>>({
        url: API_ENDPOINTS.users.getUsers,
        queryKey: [...queryKeys.users.all, params],
        params,
    });
};

export const useUser = (id: string) => {
    return useApiQuery<UserResponseDto>({
        url: API_ENDPOINTS.users.getUserById(id),
        queryKey: queryKeys.users.detail(id),
        enabled: !!id,
    });
};
