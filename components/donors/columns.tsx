"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DonorResponseDto } from "@/types/donors"
import { createTextColumn, createDateColumn, createActionsColumn } from "@/components/datatable/data-table-column-helpers"

interface GetColumnsProps {
    onEdit: (donor: DonorResponseDto) => void
    onDelete?: (donor: DonorResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<DonorResponseDto>[] => [
    // Hidden columns for filtering
    {
        id: "constituencyId",
        accessorFn: (row) => row.constituency_id,
        header: "Constituency ID",
        enableHiding: true,
        meta: { hidden: true },
    },
    {
        id: "subConstituencyId",
        accessorFn: (row) => row.sub_constituency_id,
        header: "Sub-Constituency ID",
        enableHiding: true,
        meta: { hidden: true },
    },
    // Visible columns
    createTextColumn<DonorResponseDto>(
        "name",
        "Name",
        (row) => `${row.first_name} ${row.last_name}`
    ),
    createTextColumn<DonorResponseDto>("email", "Email", (row) => row.email),
    createTextColumn<DonorResponseDto>("phone", "Phone", (row) => row.phone || "—"),
    createTextColumn<DonorResponseDto>("constituency", "Constituency", (row) => row.constituency || "—"),
    createTextColumn<DonorResponseDto>("sub_constituency", "Sub-Constituency", (row) => row.sub_constituency || "—"),
    createDateColumn<DonorResponseDto>("created_at", "Created At", (row) => row.created_at, { dateStyle: "medium" }),
    createActionsColumn<DonorResponseDto>(
        undefined,
        onEdit,
        onDelete
    )
]

