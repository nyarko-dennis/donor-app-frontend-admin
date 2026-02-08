import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { queryKeys } from "@/lib/query/utils/queryKeys";
import { UserResponseDto } from "@/types/users";
import { PageDto, PaginationParams } from "@/types/pagination";

export const useUsers = (params?: PaginationParams) => {
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
