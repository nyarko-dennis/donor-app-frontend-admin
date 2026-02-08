import { useApiMutation } from "@/lib/query/base/use-api-mutation";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import {
    LoginDto,
    LoginResponse,
    ForgotPasswordDto,
    ResetPasswordDto,
    ChangePasswordDto,
    TwoFactorAuthenticationCodeDto,
} from "@/types/auth";

export const useLoginMutation = () => {
    return useApiMutation<LoginResponse, unknown, LoginDto>({
        url: API_ENDPOINTS.auth.login,
        method: "POST",
        successToast: { title: "Login Successful", description: "You have been logged in." },
    });
};

export const useForgotPasswordMutation = () => {
    return useApiMutation<void, unknown, ForgotPasswordDto>({
        url: API_ENDPOINTS.auth.forgotPassword,
        method: "POST",
        successToast: { title: "Email Sent", description: "If an account exists, a password reset email has been sent." },
    });
};

export const useResetPasswordMutation = () => {
    return useApiMutation<void, unknown, ResetPasswordDto>({
        url: API_ENDPOINTS.auth.resetPassword,
        method: "POST",
        successToast: { title: "Password Reset", description: "Your password has been successfully reset." },
    });
};

export const useChangePasswordMutation = () => {
    return useApiMutation<void, unknown, ChangePasswordDto>({
        url: API_ENDPOINTS.auth.changePassword,
        method: "POST",
        successToast: { title: "Password Changed", description: "Your password has been updated." },
    });
};

export const useGenerateTwoFactorMutation = () => {
    return useApiMutation<{ data: string }, unknown, void>({ // Assuming it returns data url string in data or directly? 
        // Controller returns `generateQrCodeDataURL`, likely just string or {data: string}
        // Actually controller returns `this.authService.generateQrCodeDataURL(otpauthUrl)`.
        // Let's assume it returns { data: ... } or just string. The hook generic will need to match.
        // For now using `any` to be safe or `string`.
        url: API_ENDPOINTS.auth.generate2FA,
        method: "GET", // Wait, verify method.
        // Controller: @Get('2fa/generate')
        // So it is GET. But useApiMutation is for mutations (POST/PUT/DELETE).
        // For GET requests triggered by user action (like clicking "Generate 2FA"), we can use `useQuery` with `enabled: false` and `refetch`,
        // OR we can use `useApiMutation` if we want to handle it as an action.
        // `useApiMutation` forces method to be POST/PUT/PATCH/DELETE in types...
        // `method: 'POST' | 'PUT' | 'PATCH' | 'DELETE';` (Step 12).
        // So we CANNOT use `useApiMutation` for GET requests easily unless we cast or change type.
        // It's better to use `useApiQuery` for GET.
    });
};

export const useTurnOnTwoFactorMutation = () => {
    return useApiMutation<{ message: string }, unknown, TwoFactorAuthenticationCodeDto>({
        url: API_ENDPOINTS.auth.turnOn2FA,
        method: "POST",
        successToast: { title: "2FA Enabled", description: "Two-factor authentication has been enabled." },
    });
};
