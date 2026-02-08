import { UserResponseDto } from "./users";

export interface LoginDto {
    email: string;
    password: string;
    code?: string;
}

export interface LoginResponse {
    accessToken: string;
    user: UserResponseDto; // Circular dependency might be an issue, better to import or redefine
}

export interface ForgotPasswordDto {
    email: string;
}

export interface ResetPasswordDto {
    token: string;
    newPassword: string;
}

export interface ChangePasswordDto {
    oldPassword: string;
    newPassword: string;
}

export interface TwoFactorAuthenticationCodeDto {
    code: string;
}

export interface TwoFactorSecret {
    otpauthUrl: string;
}

// Importing UserResponseDto to avoid circular dependency issues if in same file, but here we can just use `any` or minimal User type if strictly needed,
// but usually login response just has accessToken.
// Looking at AuthController.login: returns `this.authService.login(user)` which usually returns `{ accessToken: ... }`.
// Let's assume it returns accessToken.
// The user object might be returned in a separate profile call or included.
// For now, let's keep it simple.


