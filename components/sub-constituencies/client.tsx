"use client"

import React, { useState, useMemo } from "react"
import { useSubConstituencies } from "@/lib/query/hooks/useSubConstituencies"
import { useDeleteSubConstituencyMutation } from "@/lib/query/mutations/useConstituencyMutations"
import { useConstituencies } from "@/lib/query/hooks/useConstituencies"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { SubConstituencyResponseDto, SubConstituenciesFilterParams } from "@/types/constituencies"
import { Order } from "@/types/pagination"
import { SubConstituencyDialog } from "./sub-constituency-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar, FilterOption } from "@/components/datatable/data-table-toolbar"
import { MapPin } from "lucide-react"

export function SubConstituencyClient() {
    // Fetch constituencies for filter dropdown
    const { data: constituenciesData } = useConstituencies({ page: 1, take: 50 })
    const constituencies = constituenciesData?.data ?? []

    // Build filter options from fetched data
    const constituencyOptions: FilterOption[] = useMemo(() =>
        constituencies.map(c => ({ value: c.id, label: c.name })),
        [constituencies]
    )

    // Create custom toolbar with dynamic filter options
    const SubConstituencyToolbar = useMemo(() => {
        return function Toolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<SubConstituencyResponseDto>>) {
            return (
                <DataTableToolbar
                    table={table}
                    onCreateItem={onCreateItem}
                    showCreateButton={true}
                    createButtonLabel="Add Sub-Constituency"
                    searchPlaceholder="Search sub-constituencies..."
                    filterableColumns={[
                        {
                            id: "constituencyId",
                            title: "Constituency",
                            options: constituencyOptions,
                        },
                    ]}
                />
            );
        };
    }, [constituencyOptions]);

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

    // Hook adapter - defined at component body level for ESLint compatibility
    const useSubConstituenciesQuery = (params: SubConstituenciesFilterParams) => useSubConstituencies(params)

    return (
        <div className="flex h-full flex-1 flex-col p-8 md:flex">
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
                initialParams={{ page: 1, take: 10, sortBy: 'name', order: Order.DESC }}
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


