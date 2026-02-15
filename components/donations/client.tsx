"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useDonations } from "@/lib/query/hooks/useDonations"
import { useDeleteDonationMutation } from "@/lib/query/mutations/useDonationMutations"
import { useDonors } from "@/lib/query/hooks/useDonors"
import { useCampaigns } from "@/lib/query/hooks/useCampaigns"
import { useDonationCauses } from "@/lib/query/hooks/useDonationCauses"
import { DataTable } from "@/components/datatable/data-table"
import { getColumns } from "./columns"
import { DonationResponseDto, DonationsFilterParams } from "@/types/donations"
import { Order } from "@/types/pagination"
import { DonationDialog } from "./donation-dialog"
import { DeleteConfirmationDialog } from "@/components/delete-confirmation-dialog"
import { DataTableToolbarProps, DataTableToolbar, FilterOption } from "@/components/datatable/data-table-toolbar"
import { HandCoins } from "lucide-react"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import { Permission } from "@/lib/rbac"

// Payment method options (static) — only Cash and In Kind allowed on admin portal
const paymentMethodFilterOptions: FilterOption[] = [
    { value: "Cash", label: "Cash" },
    { value: "In Kind", label: "In Kind" },
    { value: "Mobile Money", label: "Mobile Money" },
    { value: "Card", label: "Card" }
]

export function DonationClient() {
    const router = useRouter()
    const { can } = useCurrentRole()
    const canCreate = can(Permission.CREATE_DONATION)
    const canDelete = can(Permission.DELETE_DONATION)

    // Fetch data for filter dropdowns
    const { data: donorsData } = useDonors({ page: 1, take: 50 })
    const donors = donorsData?.data ?? []

    const { data: campaignsData } = useCampaigns({ page: 1, take: 50 })
    const campaigns = campaignsData?.data ?? []

    const { data: causesData } = useDonationCauses({ page: 1, take: 50 })
    const causes = causesData?.data ?? []

    // Build filter options from fetched data
    const donorOptions: FilterOption[] = useMemo(() =>
        donors.map(d => ({ value: d.id, label: `${d.first_name} ${d.last_name}` })),
        [donors]
    )

    const campaignOptions: FilterOption[] = useMemo(() =>
        campaigns.map(c => ({ value: c.id, label: c.name })),
        [campaigns]
    )

    const causeOptions: FilterOption[] = useMemo(() =>
        causes.map(c => ({ value: c.id, label: c.name })),
        [causes]
    )

    // Create custom toolbar with dynamic filter options
    const DonationToolbar = useMemo(() => {
        return function Toolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<DonationResponseDto>>) {
            return (
                <DataTableToolbar
                    table={table}
                    onCreateItem={onCreateItem}
                    showCreateButton={!!onCreateItem}
                    createButtonLabel="Add Donation"
                    searchPlaceholder="Filter donations..."
                    filterableColumns={[
                        {
                            id: "campaignId",
                            title: "Campaign",
                            options: campaignOptions,
                        },
                        {
                            id: "causeId",
                            title: "Cause",
                            options: causeOptions,
                        },
                        {
                            id: "payment_method",
                            title: "Payment Method",
                            options: paymentMethodFilterOptions,
                        },
                    ]}
                />
            );
        };
    }, [donorOptions, campaignOptions, causeOptions]);

    // State for dialogs
    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedDonation, setSelectedDonation] = useState<DonationResponseDto | null>(null)

    // Mutations
    const deleteMutation = useDeleteDonationMutation()

    // Handlers — navigate to the new wizard page instead of opening a dialog
    const handleCreate = () => {
        router.push("/dashboard/donations/new")
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
        onDelete: canDelete ? handleDeleteClick : undefined,
    }), [canDelete])

    // Hook adapter - defined at component body level for ESLint compatibility
    const useDonationsQuery = (params: DonationsFilterParams) => useDonations(params)

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
                initialParams={{ page: 1, take: 10, sortBy: 'donation_date', order: Order.DESC }}
                toolbar={DonationToolbar}
                onCreateItem={canCreate ? handleCreate : undefined}
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
