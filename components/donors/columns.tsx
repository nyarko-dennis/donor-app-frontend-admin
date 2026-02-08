"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DonorResponseDto } from "@/types/donors"
import { createTextColumn, createDateColumn, createActionsColumn } from "@/components/datatable/data-table-column-helpers"

interface GetColumnsProps {
    onEdit: (donor: DonorResponseDto) => void
    onDelete: (donor: DonorResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<DonorResponseDto>[] => [
    createTextColumn<DonorResponseDto>(
        "name",
        "Name",
        (row) => `${row.first_name} ${row.last_name}`
    ),
    createTextColumn<DonorResponseDto>("email", "Email", (row) => row.email),
    createTextColumn<DonorResponseDto>("phone", "Phone", (row) => row.phone || "—"),
    createTextColumn<DonorResponseDto>("constituency", "Constituency", (row) => row.constituency || "—"),
    createDateColumn<DonorResponseDto>("created_at", "Created At", (row) => row.created_at, { dateStyle: "medium" }),
    createActionsColumn<DonorResponseDto>(
        undefined,
        onEdit,
        onDelete
    )
]
