"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserResponseDto } from "@/types/users"
import {
    createTextColumn,
    createDateColumn,
    createActionsColumn,
    createAvatarColumn
} from "@/components/datatable/data-table-column-helpers"

interface GetColumnsProps {
    onEdit: (user: UserResponseDto) => void
    onDelete?: (user: UserResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<UserResponseDto>[] => [
    createTextColumn<UserResponseDto>("first_name", "First Name", undefined, true,), // Hidden for searching/sorting but not display
    createTextColumn<UserResponseDto>("last_name", "Last Name", undefined, true,), // Hidden for searching/sorting but not display
    createTextColumn<UserResponseDto>("email", "Email", undefined, true, "text-muted-foreground"),
    createTextColumn<UserResponseDto>("role", "Role", (user) => user.role.replace('_', ' ')),
    createDateColumn<UserResponseDto>("created_at", "Created At"),
    createActionsColumn<UserResponseDto>(
        undefined, // onView
        onEdit,    // onEdit
        onDelete   // onDelete
    ),
]
