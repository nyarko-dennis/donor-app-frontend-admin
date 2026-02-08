"use client"

import React, { useState, useMemo } from "react"
import { useDonationCauses } from "@/lib/query/hooks/useDonationCauses"
import { useDeleteDonationCauseMutation } from "@/lib/query/mutations/useDonationCauseMutations"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { DonationCauseResponseDto } from "@/types/donation-causes"
import { DonationCauseDialog } from "./donation-cause-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar } from "@/components/datatable/data-table-toolbar"
import { PaginationParams } from "@/types/pagination"
import { PageDto } from "@/types/pagination"
import { Heart } from "lucide-react"

function DonationCauseToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<DonationCauseResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={true}
            createButtonLabel="Add Cause"
            searchPlaceholder="Filter causes..."
        />
    );
}

export function DonationCauseClient() {
    // State for dialogs
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedCause, setSelectedCause] = useState<DonationCauseResponseDto | null>(null)

    // Mutations
    const deleteMutation = useDeleteDonationCauseMutation()

    // Handlers
    const handleCreate = () => {
        setSelectedCause(null)
        setDialogOpen(true)
    }

    const handleEdit = (cause: DonationCauseResponseDto) => {
        setSelectedCause(cause)
        setDialogOpen(true)
    }

    const handleDeleteClick = (cause: DonationCauseResponseDto) => {
        setSelectedCause(cause)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (selectedCause) {
            deleteMutation.mutate(
                { id: selectedCause.id },
                {
                    onSuccess: () => {
                        setDeleteDialogOpen(false)
                        setSelectedCause(null)
                    },
                }
            )
        }
    }

    const columns = useMemo(() => getColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
    }), [])

    // Custom hook adapter - useDonationCauses may return array or paginated
    const useDonationCausesQuery = (params: PaginationParams) => {
        const query = useDonationCauses()
        // Transform array response to PageDto format if needed
        const transformedData: PageDto<DonationCauseResponseDto> | undefined = query.data
            ? Array.isArray(query.data)
                ? { data: query.data, meta: { page: 1, take: query.data.length, itemCount: query.data.length, pageCount: 1, hasPreviousPage: false, hasNextPage: false } }
                : query.data as unknown as PageDto<DonationCauseResponseDto>
            : undefined

        return {
            ...query,
            data: transformedData,
        }
    }

    return (
        <div className="flex h-full flex-1 flex-col p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Donation Causes</h2>
                    <p className="text-muted-foreground">
                        Manage the list of donation causes.
                    </p>
                </div>
            </div>

            <DataTable<DonationCauseResponseDto>
                columns={columns}
                useQueryHook={useDonationCausesQuery}
                initialParams={{ page: 1, limit: 10 } as PaginationParams}
                toolbar={DonationCauseToolbar}
                onCreateItem={handleCreate}
                emptyIcon={<Heart className="h-10 w-10 text-muted-foreground/70" />}
                emptyTitle="No donation causes found"
                emptyDescription="Get started by creating a new donation cause."
                noResultsTitle="No matching causes"
                noResultsDescription="Try adjusting your search filters."
            />

            <DonationCauseDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                cause={selectedCause}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                loading={deleteMutation.isPending}
                title={`Delete ${selectedCause?.name}?`}
                description="Are you sure you want to delete this donation cause? This action cannot be undone."
            />
        </div>
    )
}
