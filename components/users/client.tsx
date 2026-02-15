"use client"

import { useState } from "react"
import { useUsers } from "@/lib/query/hooks/useUsers"
import { useDeleteUserMutation } from "@/lib/query/mutations/useUserMutations"
import { UserResponseDto, UserRole, UsersFilterParams } from "@/types/users"
import { Order } from "@/types/pagination"
import { DataTable } from "@/components/datatable/data-table"
import { DataTableToolbarProps, DataTableToolbar } from "@/components/datatable/data-table-toolbar"
import { getColumns } from "./columns" // Import normally
import { UserDialog } from "./user-dialog"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import { Permission } from "@/lib/rbac"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define filter options for the toolbar
const roleFilterOptions = [
    { value: UserRole.ADMIN, label: "Admin" },
    { value: UserRole.STAKEHOLDER, label: "Stakeholder" },
    { value: UserRole.SUPER_ADMIN, label: "Super Admin" },
];

const statusFilterOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
];

function UserToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<UserResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={!!onCreateItem}
            createButtonLabel="Add User"
            searchPlaceholder="Search users..."
            filterableColumns={[
                {
                    id: "role",
                    title: "Role",
                    options: roleFilterOptions,
                },
                {
                    id: "isActive",
                    title: "Status",
                    options: statusFilterOptions,
                },
            ]}
        />
    );
}

export function UserClient() {
    const { can } = useCurrentRole()
    const canCreate = can(Permission.MANAGE_USERS)
    const canDelete = can(Permission.MANAGE_USERS)

    const deleteMutation = useDeleteUserMutation()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingUser, setEditingUser] = useState<UserResponseDto | null>(null)
    const [deletingUser, setDeletingUser] = useState<UserResponseDto | null>(null)

    const handleCreate = () => {
        setEditingUser(null)
        setDialogOpen(true)
    }

    const handleEdit = (user: UserResponseDto) => {
        setEditingUser(user)
        setDialogOpen(true)
    }

    const handleDelete = (user: UserResponseDto) => {
        setDeletingUser(user)
    }

    const confirmDelete = () => {
        if (deletingUser) {
            deleteMutation.mutate(
                { id: deletingUser.id },
                {
                    onSuccess: () => {
                        setDeletingUser(null)
                    },
                }
            )
        }
    }

    const columns = getColumns({
        onEdit: handleEdit,
        onDelete: canDelete ? handleDelete : undefined,
    })

    // Hook adapter - defined at component body level for ESLint compatibility
    const useUsersQuery = (params: UsersFilterParams) => useUsers(params)

    return (
        <div className="flex h-full flex-1 flex-col p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Users</h2>
                    <p className="text-muted-foreground">
                        Manage users and their roles.
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                useQueryHook={useUsersQuery}
                initialParams={{ page: 1, take: 10, sortBy: 'created_at', order: Order.DESC }}
                toolbar={UserToolbar}
                onCreateItem={canCreate ? handleCreate : undefined}
            />

            <UserDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                user={editingUser}
            />

            <AlertDialog open={!!deletingUser} onOpenChange={(open) => !open && setDeletingUser(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the user
                            <span className="font-medium text-foreground"> {deletingUser?.first_name} {deletingUser?.last_name} </span>
                            and remove their data from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
