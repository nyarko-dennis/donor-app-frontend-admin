export enum UserRole {
    SUPER_ADMIN = 'SUPER_ADMIN',
    ADMIN = 'ADMIN',
    STAKEHOLDER = 'STAKEHOLDER',
}

export interface CreateUserDto extends Record<string, unknown> {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    constituency?: string;
    sub_constituency?: string;
    role?: UserRole;
}

export interface UserResponseDto {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    is_active: boolean;
    constituency?: string;
    sub_constituency?: string;
    created_at: Date;
}
