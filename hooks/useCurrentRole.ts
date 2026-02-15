"use client";

import { useSession } from "next-auth/react";
import { UserRole } from "@/types/users";
import { hasPermission, hasAnyPermission, Permission } from "@/lib/rbac";

/**
 * Convenience hook that returns the current user's role and
 * permission-checking helpers derived from the session.
 */
export function useCurrentRole() {
    const { data: session } = useSession();
    const role = (session?.user?.role as UserRole) ?? undefined;

    return {
        role,
        /**
         * Check if the current user has a specific permission.
         */
        can: (permission: Permission) => hasPermission(role, permission),
        /**
         * Check if the current user has at least one of the given permissions.
         */
        canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    };
}
