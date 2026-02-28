"use client"

import { ColumnDef } from "@tanstack/react-table"
import { DonationResponseDto } from "@/types/donations"
import { createTextColumn, createDateColumn, createActionsColumn } from "@/components/datatable/data-table-column-helpers"
import { Pencil } from "lucide-react"

interface GetColumnsProps {
    onEdit: (donation: DonationResponseDto) => void
    onDelete?: (donation: DonationResponseDto) => void
}

export const getColumns = ({ onEdit, onDelete }: GetColumnsProps): ColumnDef<DonationResponseDto>[] => [
    // Hidden columns for filtering
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
    createDateColumn<DonationResponseDto>("donation_date", "Date", (row) => row.donation_date || row.created_at, { dateStyle: "medium", timeStyle: "short" }),
    createActionsColumn<DonationResponseDto>(
        undefined,
        undefined,
        onDelete,
        (row) => {
            if (["Cash", "In Kind"].includes(row.payment_method)) {
                return [
                    {
                        label: "Edit",
                        onClick: () => onEdit(row),
                        icon: <Pencil className="mr-2 h-4 w-4" />,
                    },
                ]
            }
            return []
        }
    )
]

