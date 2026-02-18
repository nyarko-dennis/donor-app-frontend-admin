export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    STAKEHOLDER = 'STAKEHOLDER',
}

export interface CreateUserDto {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role?: UserRole;
}

export type UpdateUserDto = Partial<Omit<CreateUserDto, 'password'>>;

import { PaginationParams } from "./pagination";

export interface UsersFilterParams extends PaginationParams {
    role?: UserRole | UserRole[];
    isActive?: boolean;
}

export interface UserResponseDto {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_active: boolean;
    created_at: Date;
}
