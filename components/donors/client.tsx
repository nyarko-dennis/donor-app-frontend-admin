"use client"

import React, { useState, useMemo } from "react"
import { useDonors } from "@/lib/query/hooks/useDonors"
import { useDeleteDonorMutation } from "@/lib/query/mutations/useDonorMutations"
import { useConstituencies } from "@/lib/query/hooks/useConstituencies"
import { useSubConstituencies } from "@/lib/query/hooks/useSubConstituencies"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { DonorResponseDto, DonorsFilterParams } from "@/types/donors"
import { Order } from "@/types/pagination"
import { DonorDialog } from "./donor-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar, FilterOption } from "@/components/datatable/data-table-toolbar"
import { Users } from "lucide-react"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import { Permission } from "@/lib/rbac"

export function DonorClient() {
    const { can } = useCurrentRole()
    const canCreate = can(Permission.CREATE_DONOR)
    const canDelete = can(Permission.DELETE_DONOR)

    // Fetch constituencies for filter dropdown
    const { data: constituenciesData } = useConstituencies({ page: 1, take: 50 })
    const constituencies = constituenciesData?.data ?? []

    // Fetch all sub-constituencies
    const { data: subConstituenciesData } = useSubConstituencies({ page: 1, take: 50 })
    const subConstituencies = subConstituenciesData?.data ?? []

    // Build filter options from fetched data
    const constituencyOptions: FilterOption[] = useMemo(() =>
        constituencies.map(c => ({ value: c.id, label: c.name })),
        [constituencies]
    )

    const subConstituencyOptions: FilterOption[] = useMemo(() =>
        subConstituencies.map(sc => ({ value: sc.id, label: sc.name })),
        [subConstituencies]
    )

    // Create custom toolbar with dynamic filter options
    const DonorToolbar = useMemo(() => {
        return function Toolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<DonorResponseDto>>) {
            return (
                <DataTableToolbar
                    table={table}
                    onCreateItem={onCreateItem}
                    showCreateButton={!!onCreateItem}
                    createButtonLabel="Add Donor"
                    searchPlaceholder="Search donors..."
                    filterableColumns={[
                        {
                            id: "constituencyId",
                            title: "Constituency",
                            options: constituencyOptions,
                        },
                        {
                            id: "subConstituencyId",
                            title: "Sub-Constituency",
                            options: subConstituencyOptions,
                        },
                    ]}
                />
            );
        };
    }, [constituencyOptions, subConstituencyOptions]);

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
        onDelete: canDelete ? handleDeleteClick : undefined,
    }), [canDelete])

    // Hook adapter - defined at component body level for ESLint compatibility
    const useDonorsQuery = (params: DonorsFilterParams) => useDonors(params)

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
                initialParams={{ page: 1, take: 10, sortBy: 'date_joined', order: Order.DESC }}
                toolbar={DonorToolbar}
                onCreateItem={canCreate ? handleCreate : undefined}
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
