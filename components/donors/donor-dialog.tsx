"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateDonorMutation, useUpdateDonorMutation } from "@/lib/query/mutations/useDonorMutations"
import { DonorResponseDto } from "@/types/donors"
import { donorSchema, DonorFormValues } from "@/schemas/donors"
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
import { useConstituencies } from "@/lib/query/hooks/useConstituencies"
import { useSubConstituencies } from "@/lib/query/hooks/useSubConstituencies"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { PaginationParams } from "@/types/pagination"

interface DonorDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    donor?: DonorResponseDto | null
}

export function DonorDialog({
    open,
    onOpenChange,
    donor,
}: DonorDialogProps) {
    const isEditing = !!donor
    const createMutation = useCreateDonorMutation()
    const updateMutation = useUpdateDonorMutation()

    // Fetch constituencies and sub-constituencies
    const { data: constituenciesPage, isLoading: isLoadingConstituencies } = useConstituencies({ page: 1, limit: 100 } as PaginationParams)
    const constituencies = constituenciesPage?.data || []

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<DonorFormValues>({
        resolver: zodResolver(donorSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            constituency: "",
            sub_constituency: "",
        },
    })

    const selectedConstituency = watch("constituency")

    // Fetch sub-constituencies and filter by selected constituency on client
    const { data: subConstituenciesPage, isLoading: isLoadingSubConstituencies } = useSubConstituencies(
        { page: 1, limit: 100 } as PaginationParams
    )
    const allSubConstituencies = subConstituenciesPage?.data || []
    // Filter sub-constituencies by constituency name if selected
    const subConstituencies = selectedConstituency
        ? allSubConstituencies.filter((sc) => (sc as any).constituency?.name === selectedConstituency)
        : []

    useEffect(() => {
        if (donor) {
            reset({
                first_name: donor.first_name,
                last_name: donor.last_name,
                email: donor.email,
                phone: donor.phone || "",
                constituency: donor.constituency || "",
                sub_constituency: "",
            })
        } else {
            reset({
                first_name: "",
                last_name: "",
                email: "",
                phone: "",
                constituency: "",
                sub_constituency: "",
            })
        }
    }, [donor, reset, open])

    const onSubmit = (values: DonorFormValues) => {
        if (isEditing && donor) {
            updateMutation.mutate(
                { id: donor.id, data: values },
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
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Donor" : "Create Donor"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Make changes to the donor here. Click save when you're done."
                            : "Add a new donor to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="first_name"
                                    placeholder="First Name"
                                    {...register("first_name")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.first_name]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="last_name"
                                    placeholder="Last Name"
                                    {...register("last_name")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.last_name]} />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <FieldContent>
                            <Input
                                id="email"
                                type="email"
                                placeholder="email@example.com"
                                {...register("email")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.email]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="phone">Phone</FieldLabel>
                        <FieldContent>
                            <Input
                                id="phone"
                                placeholder="+233 XX XXX XXXX"
                                {...register("phone")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.phone]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="constituency">Constituency</FieldLabel>
                        <FieldContent>
                            <Select
                                onValueChange={(value) => {
                                    setValue("constituency", value)
                                    setValue("sub_constituency", "")
                                }}
                                value={watch("constituency")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select constituency" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingConstituencies ? (
                                        <div className="p-2 flex justify-center"><Spinner /></div>
                                    ) : (
                                        constituencies.map((c) => (
                                            <SelectItem key={c.id} value={c.name}>
                                                {c.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </FieldContent>
                        <FieldError errors={[errors.constituency]} />
                    </Field>

                    {selectedConstituency && (
                        <Field>
                            <FieldLabel htmlFor="sub_constituency">Sub-Constituency</FieldLabel>
                            <FieldContent>
                                <Select
                                    onValueChange={(value) => setValue("sub_constituency", value)}
                                    value={watch("sub_constituency")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select sub-constituency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {isLoadingSubConstituencies ? (
                                            <div className="p-2 flex justify-center"><Spinner /></div>
                                        ) : subConstituencies.length === 0 ? (
                                            <div className="p-2 text-sm text-muted-foreground text-center">No sub-constituencies</div>
                                        ) : (
                                            subConstituencies.map((sc) => (
                                                <SelectItem key={sc.id} value={sc.name}>
                                                    {sc.name}
                                                </SelectItem>
                                            ))
                                        )}
                                    </SelectContent>
                                </Select>
                            </FieldContent>
                            <FieldError errors={[errors.sub_constituency]} />
                        </Field>
                    )}

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
