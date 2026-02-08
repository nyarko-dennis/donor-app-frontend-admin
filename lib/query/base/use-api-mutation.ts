import { useMutation, UseMutationOptions, UseMutationResult, QueryKey, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiRequest, ApiError } from "@/lib/api/apiClient";
import { ApiToastOptions } from "@/types/toasts";
import { useAccessToken } from "@/hooks/useAccessToken";
import { useSession } from "next-auth/react";
import { notifySessionExpiredOnce, triggerSignOutOnce } from "@/lib/auth/logout-guard";


// Base type for mutation variables - most mutations send some data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MutationVariables = any; // simplified to allow interfaces without index signatures

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface StaticUrlOption<TVars = unknown> {
    url: string;
    getUrl?: never;
}

interface DynamicUrlOption<TVariables> {
    url?: never;
    getUrl: (variables: TVariables) => string | undefined;
}

interface BodyOption<TVariables> {
    /**
     * Compute the body to send. Return undefined to omit the body (useful for PUT/DELETE with no body).
     * Defaults to using the mutation variables as body.
     */
    getBody?: (variables: TVariables) => unknown | undefined;
}

/**
 * Options for the useApiMutation hook, extending React Query's UseMutationOptions
 * with API-specific properties like url, method, and invalidation keys.
 * plus options for toast notifications.
 *
 * @template TData The expected return type of the API calls on success.
 * @template TError The expected error type if the API call fails.
 * @template TVariables The type of the variable object passed to the mutation function.
 */
type UseApiMutationOptions<TData, TError, TVariables extends MutationVariables, TContext> =
    Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'> &
    BodyOption<TVariables> &
    (StaticUrlOption<TVariables> | DynamicUrlOption<TVariables>) & {
        /**
         * The API endpoint URL path (e.g., '/users', '/products/123').
         * Note: url is defined in StaticUrlOption/DynamicUrlOption
         */
        /**
         * The HTTP method for the API call.
         */
        method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
        /**
         * An optional array of React Query keys to invalidate after the mutation
         * is successful. This triggers refetches for related queries.
         */
        invalidateKeys?: QueryKey[];
        /**
         * Optional toast configuration for success and error notifications.
         * This can include title, description, and other toast options.
         */
        successToast?: ApiToastOptions | false; // Allow disabling success toast
        errorToast?: ApiToastOptions | false;   // Allow disabling error toast
        /**
         * Whether to show default toasts when custom ones aren't provided.
         * Defaults to true.
         */
        showDefaultToasts?: boolean;

        /**
         * Optional token for authenticated requests, if needed.
         * This can be used to pass an authentication token in the request headers.
         */
        token?: string;

        /**
         * Optional flag to enable/disable the mutation.
         * This can be used to conditionally enable or disable the mutation based on some state.
         */
        enabled?: boolean;
    }

/**
 * Custom hook for making API mutations (POST, PUT, PATCH, DELETE) with React Query.
 * It wraps `useMutation` and integrates with the `apiRequest` utility
 * for standardized API calls and error handling. It also provides an option
 * for automatic query invalidation on success
 *
 * @template TData The expected return type of the API calls on success.
 * @template TError The expected error type if the API call fails (defaults to ApiError).
 * @template TVariables The type of the variable object passed to the mutation function.
 * @param options Configuration options for the API mutation, including React Query options,
 * url, method, and optional invalidateKeys.
 * @returns The mutation results object from React Query (e.g., { mutate, isLoading, isError, data, error, ... }).
 */
export function useApiMutation<
    TData,
    TError = ApiError,
    TVariables extends MutationVariables = Record<string, unknown>,
    TContext = unknown,
>(
    options: UseApiMutationOptions<TData, TError, TVariables, TContext>
): UseMutationResult<TData, TError, TVariables, TContext> {
    const queryClient = useQueryClient();
    const { data: session, status } = useSession();

    const {
        url,
        method,
        invalidateKeys,
        successToast,
        errorToast,
        showDefaultToasts = true,
        token,
        enabled,
        ...mutationOptions
    } = options;

    const { getUrl, getBody } = (options as unknown) as Partial<{ getUrl: (v: TVariables) => string; getBody: (v: TVariables) => unknown | undefined }>;

    // Check if the mutation should be enabled
    const isEnabled = enabled !== false && (!token || (status === "authenticated" && !!session?.accessToken));

    const mutationFn = async (variables: TVariables): Promise<TData> => {
        const resolvedUrl = typeof getUrl === 'function' ? getUrl(variables) : url;
        if (!resolvedUrl) {
            throw new Error('useApiMutation: Missing url or getUrl result');
        }
        const computedBody = typeof getBody === 'function' ? getBody(variables) : variables;

        type RequestOptions = {
            url: string;
            method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
            token?: string;
            data?: unknown;
        };
        const requestOptions: RequestOptions = {
            url: resolvedUrl,
            method,
            token: token || session?.accessToken,
        };
        if (computedBody !== undefined) {
            requestOptions.data = computedBody as unknown;
        }
        // Throw error if mutation is disabled
        if (!isEnabled) {
            throw new Error('Mutation is disabled due to missing authentication');
        }
        return apiRequest<TData>(requestOptions);
    };

    return useMutation<TData, TError, TVariables, TContext>({
        ...mutationOptions,
        mutationFn,
        onSuccess: (data, variables, context, mutation) => {
            if (invalidateKeys?.length) {
                invalidateKeys.forEach(key => {
                    queryClient.invalidateQueries({ queryKey: key });
                });
            }

            mutationOptions.onSuccess?.(data, variables, context, mutation);

            if (successToast !== false) {
                if (successToast) {
                    toast.success(successToast.title || 'Success', {
                        description: successToast.description,
                        position: successToast.position,
                        action: successToast.action,
                        duration: successToast.duration,
                        icon: successToast.icon,
                    });
                } else if (showDefaultToasts) {
                    toast.success('Success', {
                        description: 'Operation completed successfully.',
                    });
                }
            }
        },

        onError: (error: TError, variables, context, mutation) => {
            // Handle token expiration or forbidden access (single-flight)
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
                const callbackUrl = `/auth/login?redirect=${encodeURIComponent(window.location.pathname)}`;
                triggerSignOutOnce(callbackUrl);
                notifySessionExpiredOnce(() =>
                    toast.error('Session expired', {
                        description: 'Your session has expired. Please log in again.',
                        position: 'top-right',
                    })
                );
                return;
            }

            mutationOptions.onError?.(error, variables, context, mutation);

            if (errorToast !== false) {
                if (errorToast) {
                    const defaultErrorDescription = error instanceof ApiError ? error.message : 'An unknown error occurred.';
                    const description = errorToast.description || defaultErrorDescription;

                    toast.error(errorToast.title || 'Error', {
                        description,
                        position: errorToast.position,
                        action: errorToast.action,
                        duration: errorToast.duration,
                        icon: errorToast.icon,
                    });
                } else if (showDefaultToasts) {
                    const genericDescription = error instanceof ApiError ? error.message : 'An error occurred while communicating with the server.';
                    toast.error('Request Failed', {
                        description: genericDescription,
                    });
                }
            }
        },
    });
}


// Utility types for common mutation patterns
export interface CreateMutationVariables<T> extends Record<string, unknown> {
    data: T;
}

export interface UpdateMutationVariables<T> extends Record<string, unknown> {
    id: string | number;
    data: Partial<T>;
}

export interface DeleteMutationVariables extends Record<string, unknown> {
    id: string | number;
}


// Generic utility for CRUD operations
export function useCreateMutation<TData, TVariables extends MutationVariables>(
    endpoint: string,
    invalidateKeys?: QueryKey[],
    successMessage?: string,
    errorMessage?: string,
) {
    const { accessToken: token, isReady } = useAccessToken(); // Get the access token if needed
    return useApiMutation<TData, ApiError, TVariables>({
        url: endpoint,
        method: 'POST',
        invalidateKeys,
        token,
        successToast: successMessage ? {
            title: 'Created Successfully',
            description: successMessage,
            position: 'top-right',
        } : undefined,
        errorToast: errorMessage ? {
            title: 'Creation Failed',
            description: errorMessage,
            position: 'top-right',
        } : undefined,
        enabled: isReady, // Ensure the mutation is only enabled when the token is ready
    });
}

export function useUpdateMutation<TData, TVariables extends MutationVariables>(
    endpoint: string,
    invalidateKeys?: QueryKey[],
    successMessage?: string,
    errorMessage?: string,
    method: 'PUT' | 'PATCH' = 'PUT', // Default to PUT, but allow PATCH
) {
    const { accessToken: token, isReady } = useAccessToken();
    return useApiMutation<TData, ApiError, TVariables>({
        url: endpoint,
        method,
        invalidateKeys,
        token,
        successToast: successMessage ? {
            title: 'Updated Successfully',
            description: successMessage,
            position: 'top-right',
        } : undefined,
        errorToast: errorMessage ? {
            title: 'Update Failed',
            description: errorMessage,
            position: 'top-right',
        } : undefined,
        enabled: isReady,
    });
}

export function useDeleteMutation<TData = { success: boolean }>(
    endpoint: string,
    invalidateKeys?: QueryKey[],
    successMessage?: string,
    errorMessage?: string,
) {
    const { accessToken: token, isReady } = useAccessToken(); // Get the access token if needed
    return useApiMutation<TData, ApiError, DeleteMutationVariables>({
        url: endpoint,
        method: 'DELETE',
        invalidateKeys,
        token,
        successToast: successMessage ? {
            title: 'Deleted Successfully',
            description: successMessage,
            position: 'top-right',
        } : undefined,
        errorToast: errorMessage ? {
            title: 'Deletion Failed',
            description: errorMessage,
            position: 'top-right',
        } : undefined,
        enabled: isReady, // Ensure the mutation is only enabled when the token is ready
    });
}