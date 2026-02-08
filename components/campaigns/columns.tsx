"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CampaignResponseDto } from "@/types/campaigns"
import {
    createTextColumn,
    createDateColumn,
    createActionsColumn,
    createStatusColumn,
} from "@/components/datatable/data-table-column-helpers"

interface GetColumnsProps {
    onEdit: (campaign: CampaignResponseDto) => void
    onDelete: (campaign: CampaignResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<CampaignResponseDto>[] => [
    createTextColumn<CampaignResponseDto>("name", "Name", undefined, true, "font-medium"),
    createTextColumn<CampaignResponseDto>("target_audience", "Target Audience", undefined, true, "text-muted-foreground"),
    {
        accessorKey: "goal_amount",
        header: "Goal Amount",
        cell: ({ row }) => {
            const amount = parseFloat(row.getValue("goal_amount"))
            const formatted = new Intl.NumberFormat("en-GH", {
                style: "currency",
                currency: "GHS",
            }).format(amount)
            return <div className="font-medium">{formatted}</div>
        },
    },
    createStatusColumn<CampaignResponseDto>("status", "Status"),
    createDateColumn<CampaignResponseDto>("start_date", "Start Date"),
    createDateColumn<CampaignResponseDto>("end_date", "End Date"),
    createActionsColumn<CampaignResponseDto>(
        undefined, // onView
        onEdit,    // onEdit
        onDelete   // onDelete
    ),
]
