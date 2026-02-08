"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ConstituencyResponseDto } from "@/types/constituencies"
import { createTextColumn, createDateColumn, createActionsColumn } from "@/components/datatable/data-table-column-helpers"

interface GetColumnsProps {
    onEdit: (constituency: ConstituencyResponseDto) => void
    onDelete: (constituency: ConstituencyResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<ConstituencyResponseDto>[] => [
    createTextColumn<ConstituencyResponseDto>("name", "Name", (row) => row.name),
    createTextColumn<ConstituencyResponseDto>(
        "sub_constituencies",
        "Sub-Constituencies",
        (row) => (row.sub_constituencies?.length || 0).toString(),
        false
    ),
    createDateColumn<ConstituencyResponseDto>("created_at", "Created At", (row) => row.created_at, { dateStyle: "medium" }),
    createActionsColumn<ConstituencyResponseDto>(
        undefined, // No View action for now, or maybe reuse Edit
        onEdit,
        onDelete
    )
]
