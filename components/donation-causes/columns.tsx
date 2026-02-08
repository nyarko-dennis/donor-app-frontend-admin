"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DonationCauseResponseDto } from "@/types/donation-causes"
import { createTextColumn, createDateColumn, createActionsColumn } from "@/components/datatable/data-table-column-helpers"
import { Badge } from "@/components/ui/badge"

interface GetColumnsProps {
    onEdit: (cause: DonationCauseResponseDto) => void
    onDelete: (cause: DonationCauseResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<DonationCauseResponseDto>[] => [
    createTextColumn<DonationCauseResponseDto>("name", "Name", (row) => row.name),
    createTextColumn<DonationCauseResponseDto>("description", "Description", (row) => row.description || "—"),
    {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => {
            const isActive = row.original.is_active
            return (
                <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Inactive"}
                </Badge>
            )
        },
    },
    createDateColumn<DonationCauseResponseDto>("created_at", "Created At", (row) => row.created_at, { dateStyle: "medium" }),
    createActionsColumn<DonationCauseResponseDto>(
        undefined,
        onEdit,
        onDelete
    )
]
