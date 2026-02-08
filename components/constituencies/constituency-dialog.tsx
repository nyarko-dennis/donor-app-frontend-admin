"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateConstituencyMutation, useUpdateConstituencyMutation } from "@/lib/query/mutations/useConstituencyMutations"
import { ConstituencyResponseDto } from "@/types/constituencies"
import { constituencySchema, ConstituencyFormValues } from "@/schemas/constituencies"
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
import { Button } from "@/components/ui/button"
import { useEffect } from "react"
import { Spinner } from "@/components/ui/spinner"

interface ConstituencyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    constituency?: ConstituencyResponseDto | null
}

export function ConstituencyDialog({
    open,
    onOpenChange,
    constituency,
}: ConstituencyDialogProps) {
    const isEditing = !!constituency
    const createMutation = useCreateConstituencyMutation()
    const updateMutation = useUpdateConstituencyMutation()

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ConstituencyFormValues>({
        resolver: zodResolver(constituencySchema),
        defaultValues: {
            name: "",
        },
    })

    useEffect(() => {
        if (constituency) {
            reset({
                name: constituency.name,
            })
        } else {
            reset({
                name: "",
            })
        }
    }, [constituency, reset, open])

    const onSubmit = (values: ConstituencyFormValues) => {
        if (isEditing && constituency) {
            updateMutation.mutate(
                { id: constituency.id, data: values },
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
                    <DialogTitle>{isEditing ? "Edit Constituency" : "Create Constituency"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Make changes to the constituency here. Click save when you're done."
                            : "Add a new constituency to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <FieldContent>
                            <Input
                                id="name"
                                placeholder="Constituency Name"
                                {...register("name")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.name]} />
                    </Field>
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
