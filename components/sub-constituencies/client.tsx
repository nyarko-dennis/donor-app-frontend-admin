"use client"

import React, { useState, useMemo } from "react"
import { useSubConstituencies } from "@/lib/query/hooks/useSubConstituencies"
import { useDeleteSubConstituencyMutation } from "@/lib/query/mutations/useConstituencyMutations"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { SubConstituencyResponseDto } from "@/types/constituencies"
import { SubConstituencyDialog } from "./sub-constituency-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar } from "@/components/datatable/data-table-toolbar"
import { PaginationParams } from "@/types/pagination"
import { MapPin } from "lucide-react"

function SubConstituencyToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<SubConstituencyResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={true}
            createButtonLabel="Add Sub-Constituency"
            searchPlaceholder="Filter sub-constituencies..."
        />
    );
}

export function SubConstituencyClient() {
    // State for dialogs
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedSubConstituency, setSelectedSubConstituency] = useState<SubConstituencyResponseDto | null>(null)

    // Mutations
    const deleteMutation = useDeleteSubConstituencyMutation()

    // Handlers
    const handleCreate = () => {
        setSelectedSubConstituency(null)
        setDialogOpen(true)
    }

    const handleEdit = (subConstituency: SubConstituencyResponseDto) => {
        setSelectedSubConstituency(subConstituency)
        setDialogOpen(true)
    }

    const handleDeleteClick = (subConstituency: SubConstituencyResponseDto) => {
        setSelectedSubConstituency(subConstituency)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (selectedSubConstituency) {
            deleteMutation.mutate(
                { id: selectedSubConstituency.id },
                {
                    onSuccess: () => {
                        setDeleteDialogOpen(false)
                        setSelectedSubConstituency(null)
                    },
                }
            )
        }
    }

    const columns = useMemo(() => getColumns({
        onEdit: handleEdit,
        onDelete: handleDeleteClick,
    }), [])

    // Hook adapter to match DataTable's expectations
    const useSubConstituenciesQuery = (params: PaginationParams) => useSubConstituencies(params)

    return (
        <div className="flex h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Sub-Constituencies</h2>
                    <p className="text-muted-foreground">
                        Manage the list of sub-constituencies.
                    </p>
                </div>
            </div>

            <DataTable<SubConstituencyResponseDto>
                columns={columns}
                useQueryHook={useSubConstituenciesQuery}
                initialParams={{ page: 1, take: 10 } as PaginationParams}
                toolbar={SubConstituencyToolbar}
                onCreateItem={handleCreate}
                emptyIcon={<MapPin className="h-10 w-10 text-muted-foreground/70" />}
                emptyTitle="No sub-constituencies found"
                emptyDescription="Get started by creating a new sub-constituency."
                noResultsTitle="No matching sub-constituencies"
                noResultsDescription="Try adjusting your search filters."
            />

            <SubConstituencyDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                subConstituency={selectedSubConstituency}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                loading={deleteMutation.isPending}
                title={`Delete ${selectedSubConstituency?.name}?`}
                description="Are you sure you want to delete this sub-constituency? This action cannot be undone."
            />
        </div>
    )
}
