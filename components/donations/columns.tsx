"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DonationResponseDto } from "@/types/donations"
import { createTextColumn, createDateColumn, createActionsColumn } from "@/components/datatable/data-table-column-helpers"

interface GetColumnsProps {
    onEdit: (donation: DonationResponseDto) => void
    onDelete?: (donation: DonationResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<DonationResponseDto>[] => [
    // Hidden columns for filtering
    {
        id: "donorId",
        accessorFn: (row) => row.donor?.id,
        header: "Donor ID",
        enableHiding: true,
        meta: { hidden: true },
    },
    {
        id: "campaignId",
        accessorFn: (row) => row.campaign?.id,
        header: "Campaign ID",
        enableHiding: true,
        meta: { hidden: true },
    },
    {
        id: "causeId",
        accessorFn: (row) => row.donation_cause,
        header: "Cause ID",
        enableHiding: true,
        meta: { hidden: true },
    },
    // Visible columns
    createTextColumn<DonationResponseDto>(
        "donor",
        "Donor",
        (row) => row.donor ? `${row.donor.first_name} ${row.donor.last_name}` : "N/A"
    ),
    createTextColumn<DonationResponseDto>(
        "campaign",
        "Campaign",
        (row) => row.campaign?.name || "N/A"
    ),
    createTextColumn<DonationResponseDto>(
        "amount",
        "Amount",
        (row) => `${row.currency} ${row.amount.toLocaleString()}`
    ),
    createTextColumn<DonationResponseDto>("payment_method", "Payment Method", (row) => row.payment_method),
    createTextColumn<DonationResponseDto>("donation_cause", "Cause", (row) => row.donation_cause),
    createDateColumn<DonationResponseDto>("created_at", "Date", (row) => row.created_at, { dateStyle: "medium", timeStyle: "short" }),
    createActionsColumn<DonationResponseDto>(
        undefined,
        onEdit,
        onDelete
    )
]

