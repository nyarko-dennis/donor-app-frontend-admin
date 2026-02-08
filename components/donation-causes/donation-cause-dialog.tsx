"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateDonationCauseMutation, useUpdateDonationCauseMutation } from "@/lib/query/mutations/useDonationCauseMutations"
import { DonationCauseResponseDto } from "@/types/donation-causes"
import { donationCauseSchema, DonationCauseFormValues } from "@/schemas/donation-causes"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface DonationCauseDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    cause?: DonationCauseResponseDto | null
}

export function DonationCauseDialog({
    open,
    onOpenChange,
    cause,
}: DonationCauseDialogProps) {
    const isEditing = !!cause
    const createMutation = useCreateDonationCauseMutation()
    const updateMutation = useUpdateDonationCauseMutation()

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<DonationCauseFormValues>({
        resolver: zodResolver(donationCauseSchema),
        defaultValues: {
            name: "",
            description: "",
            is_active: true,
        },
    })

    const isActive = watch("is_active")

    useEffect(() => {
        if (cause) {
            reset({
                name: cause.name,
                description: cause.description || "",
                is_active: cause.is_active,
            })
        } else {
            reset({
                name: "",
                description: "",
                is_active: true,
            })
        }
    }, [cause, reset, open])

    const onSubmit = (values: DonationCauseFormValues) => {
        if (isEditing && cause) {
            updateMutation.mutate(
                { id: cause.id, data: values },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        reset()
                    },
                }
            )
        } else {
            createMutation.mutate(values, {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                },
            })
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Donation Cause" : "Create Donation Cause"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Make changes to the donation cause here. Click save when you're done."
                            : "Add a new donation cause to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <FieldContent>
                            <Input
                                id="name"
                                placeholder="Cause Name"
                                {...register("name")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.name]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <FieldContent>
                            <Textarea
                                id="description"
                                placeholder="Brief description of this cause"
                                {...register("description")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.description]} />
                    </Field>

                    <div className="flex items-center space-x-2">
                        <Switch
                            id="is_active"
                            checked={isActive}
                            onCheckedChange={(checked: boolean) => setValue("is_active", checked)}
                        />
                        <Label htmlFor="is_active">Active</Label>
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Spinner className="mr-2" />}
                            {isEditing ? "Save changes" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
