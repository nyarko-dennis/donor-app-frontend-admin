"use client"

import { useState } from "react"
import { useCampaigns } from "@/lib/query/hooks/useCampaigns"
import { useDeleteCampaignMutation } from "@/lib/query/mutations/useCampaignMutations"
import { CampaignResponseDto } from "@/types/campaigns"
import { DataTable } from "@/components/datatable/data-table"
import { DataTableToolbar, DataTableToolbarProps } from "@/components/datatable/data-table-toolbar"
import { getColumns } from "./columns"
import { CampaignDialog } from "./campaign-dialog"
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

function CampaignToolbar({ table, onCreateItem }: Readonly<DataTableToolbarProps<CampaignResponseDto>>) {
    return (
        <DataTableToolbar
            table={table}
            onCreateItem={onCreateItem}
            showCreateButton={true}
            createButtonLabel="Add Campaign"
            searchPlaceholder="Search campaigns..."
        />
    );
}

export function CampaignClient() {
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
        onDelete: handleDelete,
    })

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
                useQueryHook={(params) => useCampaigns(params)}
                initialParams={{ page: 1, take: 10 }}
                toolbar={CampaignToolbar}
                onCreateItem={handleCreate}
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
