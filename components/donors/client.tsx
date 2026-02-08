"use client"

import React, { useState, useMemo } from "react"
import { useDonors } from "@/lib/query/hooks/useDonors"
import { useDeleteDonorMutation } from "@/lib/query/mutations/useDonorMutations"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { DonorResponseDto } from "@/types/donors"
import { DonorDialog } from "./donor-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar } from "@/components/datatable/data-table-toolbar"
import { PaginationParams } from "@/types/pagination"
import { Users } from "lucide-react"

function DonorToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<DonorResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={true}
            createButtonLabel="Add Donor"
            searchPlaceholder="Filter donors..."
        />
    );
}

export function DonorClient() {
    // State for dialogs
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedDonor, setSelectedDonor] = useState<DonorResponseDto | null>(null)

    // Mutations
    const deleteMutation = useDeleteDonorMutation()

    // Handlers
    const handleCreate = () => {
        setSelectedDonor(null)
        setDialogOpen(true)
    }

    const handleEdit = (donor: DonorResponseDto) => {
        setSelectedDonor(donor)
        setDialogOpen(true)
    }

    const handleDeleteClick = (donor: DonorResponseDto) => {
        setSelectedDonor(donor)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (selectedDonor) {
            deleteMutation.mutate(
                { id: selectedDonor.id },
                {
                    onSuccess: () => {
                        setDeleteDialogOpen(false)
                        setSelectedDonor(null)
                    },
                }
            )
        }
    }

    const columns = useMemo(() => getColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
    }), [])

    const useDonorsQuery = (params: PaginationParams) => useDonors(params)

    return (
        <div className="flex h-full flex-1 flex-col p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Donors</h2>
                    <p className="text-muted-foreground">
                        Manage the list of donors.
                    </p>
                </div>
            </div>

            <DataTable<DonorResponseDto>
                columns={columns}
                useQueryHook={useDonorsQuery}
                initialParams={{ page: 1, limit: 10 } as PaginationParams}
                toolbar={DonorToolbar}
                onCreateItem={handleCreate}
                emptyIcon={<Users className="h-10 w-10 text-muted-foreground/70" />}
                emptyTitle="No donors found"
                emptyDescription="Get started by creating a new donor."
                noResultsTitle="No matching donors"
                noResultsDescription="Try adjusting your search filters."
            />

            <DonorDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                donor={selectedDonor}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                loading={deleteMutation.isPending}
                title={`Delete ${selectedDonor?.first_name} ${selectedDonor?.last_name}?`}
                description="Are you sure you want to delete this donor? This action cannot be undone."
            />
        </div>
    )
}
