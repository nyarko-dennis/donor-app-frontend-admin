import { UserRole } from "@/types/users";

/**
 * Permissions that can be checked against a user's role.
 */
export enum Permission {
    // Dashboard
    VIEW_DASHBOARD = "VIEW_DASHBOARD",

    // Campaigns
    VIEW_CAMPAIGNS = "VIEW_CAMPAIGNS",
    CREATE_CAMPAIGN = "CREATE_CAMPAIGN",
    DELETE_CAMPAIGN = "DELETE_CAMPAIGN",

    // Donors
    VIEW_DONORS = "VIEW_DONORS",
    CREATE_DONOR = "CREATE_DONOR",
    DELETE_DONOR = "DELETE_DONOR",

    // Donations
    VIEW_DONATIONS = "VIEW_DONATIONS",
    CREATE_DONATION = "CREATE_DONATION",
    DELETE_DONATION = "DELETE_DONATION",

    // Users
    MANAGE_USERS = "MANAGE_USERS",

    // Settings
    VIEW_SETTINGS = "VIEW_SETTINGS",

    // Constituencies & Auth (all roles)
    VIEW_CONSTITUENCIES = "VIEW_CONSTITUENCIES",
}

/**
 * Maps each role to its set of allowed permissions.
 * Derived from the access matrix in ROLE_ACCESS.md.
 */
const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
    [UserRole.STAKEHOLDER]: new Set([
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_CAMPAIGNS,
        Permission.VIEW_DONORS,
        Permission.VIEW_DONATIONS,
        Permission.VIEW_SETTINGS,
        Permission.VIEW_CONSTITUENCIES,
    ]),

    [UserRole.ADMIN]: new Set([
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_CAMPAIGNS,
        Permission.CREATE_CAMPAIGN,
        Permission.VIEW_DONORS,
        Permission.CREATE_DONOR,
        Permission.VIEW_DONATIONS,
        Permission.CREATE_DONATION,
        Permission.VIEW_SETTINGS,
        Permission.VIEW_CONSTITUENCIES,
    ]),

    [UserRole.SUPER_ADMIN]: new Set([
        Permission.VIEW_DASHBOARD,
        Permission.VIEW_CAMPAIGNS,
        Permission.CREATE_CAMPAIGN,
        Permission.DELETE_CAMPAIGN,
        Permission.VIEW_DONORS,
        Permission.CREATE_DONOR,
        Permission.DELETE_DONOR,
        Permission.VIEW_DONATIONS,
        Permission.CREATE_DONATION,
        Permission.DELETE_DONATION,
        Permission.MANAGE_USERS,
        Permission.VIEW_SETTINGS,
        Permission.VIEW_CONSTITUENCIES,
    ]),
};

/**
 * Check if a role has a specific permission.
 */
export function hasPermission(role: UserRole | string | undefined, permission: Permission): boolean {
    if (!role) return false;
    const perms = ROLE_PERMISSIONS[role as UserRole];
    return perms?.has(permission) ?? false;
}

/**
 * Check if a role has at least one of the given permissions.
 */
export function hasAnyPermission(role: UserRole | string | undefined, permissions: Permission[]): boolean {
    return permissions.some((p) => hasPermission(role, p));
}
