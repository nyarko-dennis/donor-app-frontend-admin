"use client"

import { ColumnDef } from "@tanstack/react-table"
import { SubConstituencyResponseDto } from "@/types/constituencies"
import {
    createTextColumn,
    createTruncatedTextColumn,
    createDateColumn,
    createActionsColumn
} from "@/components/datatable/data-table-column-helpers"

interface GetColumnsProps {
    onEdit: (subConstituency: SubConstituencyResponseDto) => void
    onDelete: (subConstituency: SubConstituencyResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<SubConstituencyResponseDto>[] => [
    // Hidden column for filtering
    {
        id: "constituencyId",
        accessorFn: (row) => row.constituency_id,
        header: "Constituency ID",
        enableHiding: true,
        meta: { hidden: true },
    },
    // Visible columns
    createTextColumn<SubConstituencyResponseDto>("name", "Name", undefined, true, "font-medium"),
    createTextColumn<SubConstituencyResponseDto>("constituency.name", "Constituency", undefined, true, "text-muted-foreground"),
    createTruncatedTextColumn<SubConstituencyResponseDto>("description", "Description"),
    createDateColumn<SubConstituencyResponseDto>("created_at", "Created At"),
    createActionsColumn<SubConstituencyResponseDto>(
        undefined, // onView
        onEdit,    // onEdit
        onDelete   // onDelete
    ),
];

