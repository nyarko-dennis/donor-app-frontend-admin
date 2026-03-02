import { useInfiniteQuery, UseInfiniteQueryOptions, UseInfiniteQueryResult, InfiniteData } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/lib/api/apiClient";
import { ApiToastOptions } from "@/types/toasts";
import { useAccessToken } from "@/hooks/useAccessToken";
import { toast } from "sonner";
import { notifySessionExpiredOnce, triggerSignOutOnce } from "@/lib/auth/logout-guard";
import { PageDto } from "@/types/pagination";

type QueryKey = string | readonly unknown[];
type Primitive = string | number | boolean;
type QueryParamValue = Primitive | Primitive[] | undefined;

export interface UseInfiniteApiQueryOptions<
    TData,
    TError = ApiError,
    TParams = Record<string, QueryParamValue>
> extends Omit<UseInfiniteQueryOptions<PageDto<TData>, TError, InfiniteData<PageDto<TData>, unknown>, readonly unknown[], unknown>, "queryFn" | "queryKey" | "getNextPageParam" | "initialPageParam"> {
    url: string;
    queryKey: QueryKey;
    params?: TParams;
    errorToast?: ApiToastOptions;
    token?: string;
    initialPageParam?: number;
}

export function useInfiniteApiQuery<
    TData = unknown,
    TError = ApiError,
    TParams = Record<string, QueryParamValue>
>(
    options: UseInfiniteApiQueryOptions<TData, TError, TParams>
): UseInfiniteQueryResult<InfiniteData<PageDto<TData>, unknown>, TError> {
    const { url, queryKey, params, token, errorToast, initialPageParam = 1, ...queryOptions } = options;
    const { accessToken, isReady, isAuthenticated } = useAccessToken();

    const finalQueryKey: readonly unknown[] = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useInfiniteQuery<PageDto<TData>, TError, InfiniteData<PageDto<TData>, unknown>, readonly unknown[], unknown>({
        queryKey: finalQueryKey,
        queryFn: async ({ pageParam = 1 }) => {
            try {
                return await apiRequest<PageDto<TData>>({
                    url,
                    method: "GET",
                    params: {
                        ...(params as any),
                        page: pageParam,
                    },
                    withCredentials: true,
                    token: token || accessToken
                });
            } catch (error) {
                if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    if (isAuthenticated && !!accessToken) {
                        const callbackUrl = `/login?callbackUrl=${encodeURIComponent(window.location.pathname)}`;
                        triggerSignOutOnce(callbackUrl);
                        notifySessionExpiredOnce(() =>
                            toast.error('Session Expired', {
                                description: 'Your session has expired. Please log in again.',
                                position: 'top-right',
                            })
                        );
                    }
                }
                throw error;
            }
        },
        getNextPageParam: (lastPage) => {
            if (lastPage.meta.hasNextPage) {
                return lastPage.meta.page + 1;
            }
            return undefined;
        },
        initialPageParam: initialPageParam,
        ...queryOptions,
        enabled: (queryOptions.enabled !== false) &&
            isReady &&
            (!token || (isAuthenticated && !!accessToken)),
    });
}
