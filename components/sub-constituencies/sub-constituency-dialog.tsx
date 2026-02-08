"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateSubConstituencyMutation, useUpdateSubConstituencyMutation } from "@/lib/query/mutations/useConstituencyMutations"
import { useConstituencies } from "@/lib/query/hooks/useConstituencies"
import { SubConstituencyFormValues, subConstituencySchema } from "@/schemas/sub-constituencies"
import { SubConstituencyResponseDto } from "@/types/constituencies"
import { Button } from "@/components/ui/button"
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
import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

interface SubConstituencyDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    subConstituency: SubConstituencyResponseDto | null
}

export function SubConstituencyDialog({
    open,
    onOpenChange,
    subConstituency,
}: Readonly<SubConstituencyDialogProps>) {
    const createMutation = useCreateSubConstituencyMutation()
    const updateMutation = useUpdateSubConstituencyMutation()

    // Fetch constituencies for the parent select dropdown
    // Fetching a large number to cover most cases. Ideal would be async select or infinite scroll.
    const { data: constituenciesData } = useConstituencies({ page: 1, take: 50 }, { enabled: open })
    const constituencies = constituenciesData?.data || []

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<SubConstituencyFormValues>({
        resolver: zodResolver(subConstituencySchema),
        defaultValues: {
            name: "",
            constituency_id: "",
            description: "",
            order: 0,
        },
    })

    useEffect(() => {
        if (subConstituency) {
            reset({
                name: subConstituency.name,
                constituency_id: subConstituency.constituency_id,
                description: subConstituency.description || "",
                order: subConstituency.order || 0,
            })
        } else {
            reset({
                name: "",
                constituency_id: "",
                description: "",
                order: 0,
            })
        }
    }, [subConstituency, reset, open])

    const onSubmit = (values: SubConstituencyFormValues) => {
        if (subConstituency) {
            updateMutation.mutate(
                { id: subConstituency.id, data: values },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        reset()
                    },
                }
            )
        } else {
            createMutation.mutate(
                { ...values, constituencyId: values.constituency_id },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        reset()
                    },
                }
            )
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {subConstituency ? "Edit Sub-Constituency" : "Create Sub-Constituency"}
                    </DialogTitle>
                    <DialogDescription>
                        {subConstituency
                            ? "Update the details of the sub-constituency."
                            : "Add a new sub-constituency to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <FieldContent>
                            <Input
                                id="name"
                                placeholder="Enter sub-constituency name"
                                {...register("name")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.name]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="constituency_id">Parent Constituency</FieldLabel>
                        <FieldContent>
                            <Controller
                                control={control}
                                name="constituency_id"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="constituency_id">
                                            <SelectValue placeholder="Select a parent constituency" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {constituencies.map((c) => (
                                                <SelectItem key={c.id} value={c.id}>
                                                    {c.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.constituency_id]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="description">Description</FieldLabel>
                        <FieldContent>
                            <Input
                                id="description"
                                placeholder="Enter description (optional)"
                                {...register("description")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.description]} />
                    </Field>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Spinner className="mr-2" />}
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
