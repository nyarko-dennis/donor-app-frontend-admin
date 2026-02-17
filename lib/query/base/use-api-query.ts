import { useQuery, UseQueryOptions, UseQueryResult } from "@tanstack/react-query";
import { apiRequest, ApiError } from "@/lib/api/apiClient";
import { ApiToastOptions } from "@/types/toasts";
import { useAccessToken } from "@/hooks/useAccessToken";
import { toast } from "sonner";
import { notifySessionExpiredOnce, triggerSignOutOnce } from "@/lib/auth/logout-guard";

// Type for query key - can be string or array of primitives
// Type for query key - can be string or array of primitives or objects
type QueryKey = string | readonly unknown[];
type Primitive = string | number | boolean;
type QueryParamValue = Primitive | Primitive[] | undefined;

/**
 * Options for the useApiQuery hook, extending React Query's UseQueryOptions
 * with API-specific properties like url, and a typed params object.
 *
 * @template TData The expected return type of the API calls on success.
 * @template TError The expected error type if the API call fails.
 * @template TParams The type of the parameters object passed to the API call (for query strings).
 */
export interface UseApiQueryOptions<
    TData,
    TError = ApiError,
    TParams = Record<string, QueryParamValue>
> extends Omit<UseQueryOptions<TData, TError>, "queryFn" | "queryKey"> {
    /**
     * The API endpoint URL path (e.g., '/users', '/products/123').
     */
    url: string;
    /**
     * The query key for React Query caching. It should uniquely identify
     * this query, ideally including any parameters that affect the data.
     */
    queryKey: QueryKey;
    /**
     * Optional parameters object to be serialized into the URL's query string
     * for GET requests.
     * @remarks The type of this object is defined by the TParams generic.
     */
    params?: TParams;
    /**
     * Optional configuration for a toast notification to show when the query
     * fails with an error.
     */
    errorToast?: ApiToastOptions;


    token?: string; // Optional token for authenticated requests

    enabled?: boolean; // Optional flag to enable/disable the query. This can be used to conditionally enable or disable the query based on some state.
}

/**
 * Custom hook for fetching data from an API endpoint using React Query.
 * It wraps `useQuery` and integrates with the `apiRequest` utility
 * for standardized API calls and error handling. It supports generics
 * for the data return type and the query parameters type.
 *
 * @template TData The expected return type of the API call on success (defaults to unknown).
 * @template TError The expected error type if the API call fails (defaults to ApiError).
 * @template TParams The type of the parameter object passed to the API call (for query strings).
 * @param options Configuration options for the query, including standard React Query options,
 * url, queryKey, and optional params.
 * @returns React Query's useQuery result object (e.g., { data, isLoading, isError, ... }).
 */
export function useApiQuery<
    TData = unknown,
    TError = ApiError,
    TParams = Record<string, QueryParamValue>
>(
    options: UseApiQueryOptions<TData, TError, TParams>
): UseQueryResult<TData, TError> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { url, queryKey, params, token, errorToast, ...queryOptions } = options;
    const { accessToken, isReady, isAuthenticated } = useAccessToken();

    // Ensure queryKey is in the expected array format for React Query
    const finalQueryKey: readonly unknown[] = Array.isArray(queryKey) ? queryKey : [queryKey];

    return useQuery<TData, TError>({
        queryKey: finalQueryKey,
        retry: (failureCount, error) => {
            // Do not retry on unauthorized/forbidden errors to avoid loops
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                return false;
            }
            const retryOpt = (options as UseApiQueryOptions<TData, TError, TParams>).retry as unknown;
            if (typeof retryOpt === 'function') {
                try {
                    return (retryOpt as (failureCount: number, error: unknown) => boolean)(failureCount, error);
                } catch {
                    return true;
                }
            }
            if (typeof retryOpt === 'number') {
                return failureCount < (retryOpt as number);
            }
            if (typeof retryOpt === 'boolean') {
                return retryOpt as boolean;
            }
            return true; // default React Query behavior
        },
        queryFn: async () => {
            try {
                return await apiRequest<TData>({
                    url,
                    method: "GET",
                    params,
                    withCredentials: true,
                    token: token || accessToken
                });
            } catch (error) {
                if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                    // Handle token expiration/forbidden once
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
        ...queryOptions,
        // Enable the query only if we have a valid session or if no token is required
        enabled: (queryOptions.enabled !== false) &&
            isReady &&
            (!token || (isAuthenticated && !!accessToken)),
    });
}
