"use client"

import React, { useState, useMemo } from "react"
import { useDonations } from "@/lib/query/hooks/useDonations"
import { useDeleteDonationMutation } from "@/lib/query/mutations/useDonationMutations"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { DonationResponseDto } from "@/types/donations"
import { DonationDialog } from "./donation-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar } from "@/components/datatable/data-table-toolbar"
import { PaginationParams } from "@/types/pagination"
import { HandCoins } from "lucide-react"

function DonationToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<DonationResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={true}
            createButtonLabel="Add Donation"
            searchPlaceholder="Filter donations..."
        />
    );
}

export function DonationClient() {
    // State for dialogs
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedDonation, setSelectedDonation] = useState<DonationResponseDto | null>(null)

    // Mutations
    const deleteMutation = useDeleteDonationMutation()

    // Handlers
    const handleCreate = () => {
        setSelectedDonation(null)
        setDialogOpen(true)
    }

    const handleEdit = (donation: DonationResponseDto) => {
        setSelectedDonation(donation)
        setDialogOpen(true)
    }

    const handleDeleteClick = (donation: DonationResponseDto) => {
        setSelectedDonation(donation)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (selectedDonation) {
            deleteMutation.mutate(
                { id: selectedDonation.id },
                {
                    onSuccess: () => {
                        setDeleteDialogOpen(false)
                        setSelectedDonation(null)
                    },
                }
            )
        }
    }

    const columns = useMemo(() => getColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
    }), [])

    const useDonationsQuery = (params: PaginationParams) => useDonations(params)

    return (
        <div className="flex h-full flex-1 flex-col p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Donations</h2>
                    <p className="text-muted-foreground">
                        Manage the list of donations.
                    </p>
                </div>
            </div>

            <DataTable<DonationResponseDto>
                columns={columns}
                useQueryHook={useDonationsQuery}
                initialParams={{ page: 1, limit: 10 } as PaginationParams}
                toolbar={DonationToolbar}
                onCreateItem={handleCreate}
                emptyIcon={<HandCoins className="h-10 w-10 text-muted-foreground/70" />}
                emptyTitle="No donations found"
                emptyDescription="Get started by creating a new donation."
                noResultsTitle="No matching donations"
                noResultsDescription="Try adjusting your search filters."
            />

            <DonationDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                donation={selectedDonation}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                loading={deleteMutation.isPending}
                title={`Delete donation?`}
                description="Are you sure you want to delete this donation? This action cannot be undone."
            />
        </div>
    )
}
