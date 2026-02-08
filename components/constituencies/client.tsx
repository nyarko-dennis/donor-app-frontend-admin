"use client"

import React, { useState, useMemo } from "react"
import { useConstituencies } from "@/lib/query/hooks/useConstituencies"
import { useDeleteConstituencyMutation } from "@/lib/query/mutations/useConstituencyMutations"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { ConstituencyResponseDto } from "@/types/constituencies"
import { ConstituencyDialog } from "./constituency-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar } from "@/components/datatable/data-table-toolbar"
import { PaginationParams } from "@/types/pagination"
import { Landmark } from "lucide-react"

function ConstituencyToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<ConstituencyResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={true}
            createButtonLabel="Add Constituency"
            searchPlaceholder="Filter constituencies..."
        />
    );
}

export function ConstituencyClient() {
    // State for dialogs
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedConstituency, setSelectedConstituency] = useState<ConstituencyResponseDto | null>(null)

    // Mutations
    const deleteMutation = useDeleteConstituencyMutation()

    // Handlers
    const handleCreate = () => {
        setSelectedConstituency(null)
        setDialogOpen(true)
    }

    const handleEdit = (constituency: ConstituencyResponseDto) => {
        setSelectedConstituency(constituency)
        setDialogOpen(true)
    }

    const handleDeleteClick = (constituency: ConstituencyResponseDto) => {
        setSelectedConstituency(constituency)
        setDeleteDialogOpen(true)
    }

    const handleConfirmDelete = () => {
        if (selectedConstituency) {
            deleteMutation.mutate(
                { id: selectedConstituency.id },
                {
                    onSuccess: () => {
                        setDeleteDialogOpen(false)
                        setSelectedConstituency(null)
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
    // The DataTable expects a hook that takes params and returns useDataTable result
    // But useConstituencies returns the query result directly.
    // We need to pass the hook itself.
    const useConstituenciesQuery = (params: PaginationParams) => useConstituencies(params)

    return (
        <div className="flex h-full flex-1 flex-col space-y-8 p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Constituencies</h2>
                    <p className="text-muted-foreground">
                        Manage the list of constituencies and their sub-constituencies.
                    </p>
                </div>
            </div>

            <DataTable<ConstituencyResponseDto>
                columns={columns}
                useQueryHook={useConstituenciesQuery}
                initialParams={{ page: 1, limit: 10 } as PaginationParams} // Use 'limit' if that's what the API expects, or 'pageSize' if generic
                toolbar={ConstituencyToolbar}
                onCreateItem={handleCreate}
                emptyIcon={<Landmark className="h-10 w-10 text-muted-foreground/70" />}
                emptyTitle="No constituencies found"
                emptyDescription="Get started by creating a new constituency."
                noResultsTitle="No matching constituencies"
                noResultsDescription="Try adjusting your search filters."
            />

            <ConstituencyDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                constituency={selectedConstituency}
            />

            <DeleteConfirmationDialog
                open={deleteDialogOpen}
                onOpenChange={setDeleteDialogOpen}
                onConfirm={handleConfirmDelete}
                loading={deleteMutation.isPending}
                title={`Delete ${selectedConstituency?.name}?`}
                description="Are you sure you want to delete this constituency? This action cannot be undone."
            />
        </div>
    )
}
