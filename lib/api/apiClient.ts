import axios, { AxiosError, AxiosRequestConfig } from "axios";
import { serializeQueryParams } from "./utils/serializeQueryParams";

// Define your standard error structure
interface ErrorResponse {
    message?: string;
    error?: string;
    errors?: string[]; // For validation errors
    code?: string;     // Error codes for programmatic handling
    [key: string]: unknown;
}

// Standardized API error class
export class ApiError extends Error {
    status: number;
    data: unknown;
    code?: string;

    constructor(message: string, status: number, data?: unknown, code?: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
        this.data = data;
        this.code = code;

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }

    // Helper method to check if error is a specific type
    isStatus(status: number): boolean {
        return this.status === status;
    }

    // Helper method to check if error is client error (4xx)
    isClientError(): boolean {
        return this.status >= 400 && this.status < 500;
    }

    // Helper method to check if error is server error (5xx)
    isServerError(): boolean {
        return this.status >= 500;
    }
}

// Request timeout configuration
const DEFAULT_TIMEOUT = 600000; // 2 minutes

// Axios instance with enhanced configuration
export const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DEV_URL || "https://community-hub-portal-backend-137748040614.us-central1.run.app",
    timeout: DEFAULT_TIMEOUT,
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true,
    paramsSerializer: serializeQueryParams,
});

// Type guard to check if value is a record
function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// Type guard to check if error data has message property
function hasMessage(data: unknown): data is { message: string } {
    return isRecord(data) && typeof data.message === 'string';
}

// Type guard to check if error data has error property
function hasError(data: unknown): data is { error: string } {
    return isRecord(data) && typeof data.error === 'string';
}

// Type guard to check if error data has errors array
function hasErrors(data: unknown): data is { errors: string[] } {
    return isRecord(data) &&
        Array.isArray(data.errors) &&
        data.errors.every((item): item is string => typeof item === 'string');
}

// Type guard to check if error data has code property
function hasCode(data: unknown): data is { code: string } {
    return isRecord(data) && typeof data.code === 'string';
}

// Request interceptor for auth tokens, logging, etc.
axiosInstance.interceptors.request.use(
    (config) => {
        // Add auth token if available
        const token = typeof window !== 'undefined' ?
            localStorage.getItem('authToken') || sessionStorage.getItem('authToken') :
            null;

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Log requests in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
                data: config.data,
                params: config.params,
            });
        }

        return config;
    },
    (error: unknown) => {
        return Promise.reject(error);
    }
);

// Utility to safely cast unknown errors
export function toAxiosError(error: unknown): AxiosError<ErrorResponse> | null {
    if (axios.isAxiosError(error)) {
        return error;
    }
    return null;
}

// Extract error message from error data
function extractErrorMessage(data: unknown, fallbackMessage: string): string {
    if (hasMessage(data)) {
        return data.message;
    }
    if (hasError(data)) {
        return data.error;
    }
    if (hasErrors(data) && data.errors.length > 0) {
        return data.errors.join(", ");
    }
    return fallbackMessage;
}

// Extract error code from error data
function extractErrorCode(data: unknown): string | undefined {
    if (hasCode(data)) {
        return data.code;
    }
    return undefined;
}

// Enhanced response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        // Log successful responses in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${response.config.method?.toUpperCase()} ${response.config.url}`, {
                status: response.status,
                data: response.data,
            });
        }
        return response;
    },
    (error: unknown) => {
        // Log errors in development
        if (process.env.NODE_ENV === 'development') {
            console.error(`❌ API Error:`, error);
        }

        const axiosError = toAxiosError(error);
        if (axiosError) {
            const status = axiosError.response?.status || 500;
            const data = axiosError.response?.data;

            // Enhanced message extraction
            let message = extractErrorMessage(data, axiosError.message || "Unknown error");
            const code = extractErrorCode(data);

            // Handle specific error cases
            if (status === 401) {
                // Handle unauthorized - might want to redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('authToken');
                    sessionStorage.removeItem('authToken');
                }
                message = extractErrorMessage(data, "Authentication required");
            } else if (status === 403) {
                message = extractErrorMessage(data, "Access forbidden");
            } else if (status === 404) {
                message = extractErrorMessage(data, "Resource not found");
            } else if (status === 422) {
                message = extractErrorMessage(data, "Validation failed");
            } else if (status >= 500) {
                message = extractErrorMessage(data, "Server error occurred");
            }

            return Promise.reject(new ApiError(message, status, data, code));
        }

        // Handle network errors, timeouts, etc.
        if (isRecord(error) && error.code === 'ECONNABORTED') {
            return Promise.reject(new ApiError("Request timeout", 408, null, 'TIMEOUT'));
        }

        if (isRecord(error) && error.code === 'ERR_NETWORK') {
            return Promise.reject(new ApiError("Network error", 0, null, 'NETWORK'));
        }

        // Unknown error fallback
        return Promise.reject(new ApiError("Unknown error occurred", 500, null, 'UNKNOWN'));
    }
);

// Core API Request function with proper typing
export async function apiRequest<TResponse>(
    config: AxiosRequestConfig & { token?: string } // Allow optional token in config
): Promise<TResponse> {
    try {
        const { token, headers, ...restConfig } = config;
        const response = await axiosInstance.request<TResponse>({
            ...restConfig,
            headers: {
                ...headers,
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
        });

        return response.data;
    } catch (error) {
        // Re-throw as ApiError if it isn't already
        if (error instanceof ApiError) {
            throw error;
        }

        // This shouldn't happen due to our interceptor, but just in case
        throw new ApiError("Request failed", 500, error);
    }
}

// Convenience methods for common HTTP verbs with proper typing
export const api = {
    get: <TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> =>
        apiRequest<TResponse>({ ...config, method: 'GET', url }),

    post: <TResponse, TData = unknown>(
        url: string,
        data?: TData,
        config?: AxiosRequestConfig
    ): Promise<TResponse> =>
        apiRequest<TResponse>({ ...config, method: 'POST', url, data }),

    put: <TResponse, TData = unknown>(
        url: string,
        data?: TData,
        config?: AxiosRequestConfig
    ): Promise<TResponse> =>
        apiRequest<TResponse>({ ...config, method: 'PUT', url, data }),

    patch: <TResponse, TData = unknown>(
        url: string,
        data?: TData,
        config?: AxiosRequestConfig
    ): Promise<TResponse> =>
        apiRequest<TResponse>({ ...config, method: 'PATCH', url, data }),

    delete: <TResponse>(url: string, config?: AxiosRequestConfig): Promise<TResponse> =>
        apiRequest<TResponse>({ ...config, method: 'DELETE', url }),
};

// Retry utility for failed requests
export async function apiRequestWithRetry<TResponse>(
    config: AxiosRequestConfig,
    maxRetries: number = 3,
    baseDelay: number = 1000
): Promise<TResponse> {
    let lastError: ApiError;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await apiRequest<TResponse>(config);
        } catch (error) {
            lastError = error instanceof ApiError ? error : new ApiError("Request failed", 500);

            // Don't retry client errors (4xx) except 429 (rate limiting)
            if (lastError.isClientError() && lastError.status !== 429) {
                throw lastError;
            }

            // Don't retry on the last attempt
            if (attempt === maxRetries) {
                throw lastError;
            }

            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
            await new Promise<void>(resolve => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
}

// Type-safe response wrapper for APIs that return standardized responses
export interface ApiResponse<TData> {
    data: TData;
    message?: string;
    success: boolean;
}

// Wrapper for APIs that return a standardized response format
export async function apiRequestStandardized<TData>(
    config: AxiosRequestConfig
): Promise<TData> {
    const response = await apiRequest<ApiResponse<TData>>(config);
    return response.data;
}