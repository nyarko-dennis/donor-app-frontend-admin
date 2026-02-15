"use client"

import { useState } from "react"
import { useCampaigns } from "@/lib/query/hooks/useCampaigns"
import { useDeleteCampaignMutation } from "@/lib/query/mutations/useCampaignMutations"
import { CampaignResponseDto, CampaignsFilterParams } from "@/types/campaigns"
import { Order } from "@/types/pagination"
import { DataTable } from "@/components/datatable/data-table"
import { DataTableToolbar, DataTableToolbarProps } from "@/components/datatable/data-table-toolbar"
import { getColumns } from "./columns"
import { CampaignDialog } from "./campaign-dialog"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import { Permission } from "@/lib/rbac"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define filter options for the toolbar
const statusFilterOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
    { value: "Completed", label: "Completed" },
];

function CampaignToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<CampaignResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={!!onCreateItem}
            createButtonLabel="Add Campaign"
            searchPlaceholder="Search campaigns..."
            filterableColumns={[
                {
                    id: "status",
                    title: "Status",
                    options: statusFilterOptions,
                },
            ]}
        />
    );
}

export function CampaignClient() {
    const { can } = useCurrentRole()
    const canCreate = can(Permission.CREATE_CAMPAIGN)
    const canDelete = can(Permission.DELETE_CAMPAIGN)

    const deleteMutation = useDeleteCampaignMutation()

    const [dialogOpen, setDialogOpen] = useState(false)
    const [editingCampaign, setEditingCampaign] = useState<CampaignResponseDto | null>(null)
    const [deletingCampaign, setDeletingCampaign] = useState<CampaignResponseDto | null>(null)

    const handleCreate = () => {
        setEditingCampaign(null)
        setDialogOpen(true)
    }

    const handleEdit = (campaign: CampaignResponseDto) => {
        setEditingCampaign(campaign)
        setDialogOpen(true)
    }

    const handleDelete = (campaign: CampaignResponseDto) => {
        setDeletingCampaign(campaign)
    }

    const confirmDelete = () => {
        if (deletingCampaign) {
            deleteMutation.mutate(
                { id: deletingCampaign.id },
                {
                    onSuccess: () => {
                        setDeletingCampaign(null)
                    },
                }
            )
        }
    }

    const columns = getColumns({
        onEdit: handleEdit,
        onDelete: canDelete ? handleDelete : undefined,
    })

    // Hook adapter - defined at component body level for ESLint compatibility
    const useCampaignsQuery = (params: CampaignsFilterParams) => useCampaigns(params)

    return (
        <div className="flex h-full flex-1 flex-col p-8 md:flex">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Campaigns</h2>
                    <p className="text-muted-foreground">
                        Manage fundraising campaigns.
                    </p>
                </div>
            </div>

            <DataTable
                columns={columns}
                useQueryHook={useCampaignsQuery}
                initialParams={{ page: 1, take: 10, sortBy: 'created_at', order: Order.DESC }}
                toolbar={CampaignToolbar}
                onCreateItem={canCreate ? handleCreate : undefined}
            />

            <CampaignDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                campaign={editingCampaign}
            />

            <AlertDialog open={!!deletingCampaign} onOpenChange={(open) => !open && setDeletingCampaign(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the campaign
                            <span className="font-medium text-foreground"> {deletingCampaign?.name} </span>
                            and remove it from the system.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={confirmDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
