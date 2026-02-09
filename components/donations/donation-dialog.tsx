"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateDonationMutation, useUpdateDonationMutation } from "@/lib/query/mutations/useDonationMutations"
import { DonationResponseDto } from "@/types/donations"
import { DonationCauseResponseDto } from "@/types/donation-causes"
import { DonorResponseDto } from "@/types/donors"
import { donationSchema, DonationFormValues } from "@/schemas/donations"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { useDonationCauses } from "@/lib/query/hooks/useDonationCauses"
import { useCampaigns } from "@/lib/query/hooks/useCampaigns"
import { useDonors } from "@/lib/query/hooks/useDonors"
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox"
import { PaginationParams } from "@/types/pagination"
import { PageDto } from "@/types/pagination"

interface DonationDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    donation?: DonationResponseDto | null
}

export function DonationDialog({
    open,
    onOpenChange,
    donation,
}: DonationDialogProps) {
    const isEditing = !!donation
    const createMutation = useCreateDonationMutation()
    const updateMutation = useUpdateDonationMutation()

    // Fetch data for dropdowns
    const { data: donationCausesData, isLoading: isLoadingCauses } = useDonationCauses()
    const { data: campaignsPage, isLoading: isLoadingCampaigns } = useCampaigns({ page: 1, limit: 100 } as PaginationParams)
    const { data: donorsPage, isLoading: isLoadingDonors } = useDonors({ page: 1, limit: 100 } as PaginationParams)

    // Handle both array and paginated responses for donationCauses
    const donationCauses: DonationCauseResponseDto[] = Array.isArray(donationCausesData)
        ? donationCausesData
        : (donationCausesData as unknown as PageDto<DonationCauseResponseDto>)?.data || []
    const campaigns = campaignsPage?.data || []
    const donors: DonorResponseDto[] = donorsPage?.data || []

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<DonationFormValues>({
        resolver: zodResolver(donationSchema),
        defaultValues: {
            amount: 0,
            currency: "GHS",
            payment_method: "",
            donation_cause: "",
            donorId: "",
            campaignId: "",
        },
    })

    // Watch values for Combobox controlled components if needed, or just use setValue
    const selectedDonorId = watch("donorId")
    const selectedCampaignId = watch("campaignId")

    useEffect(() => {
        if (donation) {
            reset({
                amount: donation.amount,
                currency: donation.currency,
                payment_method: donation.payment_method,
                donation_cause: donation.donation_cause,
                donorId: donation.donor.id,
                campaignId: donation.campaign.id,
            })
        } else {
            reset({
                amount: 0,
                currency: "GHS",
                payment_method: "",
                donation_cause: "",
                donorId: "",
                campaignId: "",
            })
        }
    }, [donation, reset, open])

    const onSubmit = (values: DonationFormValues) => {
        if (isEditing && donation) {
            updateMutation.mutate(
                { id: donation.id, data: values },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        reset()
                    },
                }
            )
        } else {
            createMutation.mutate({
                ...values,
                transaction_id: "",
                status: "",
                created_at: new Date().toISOString(),
            }, {
                onSuccess: () => {
                    onOpenChange(false)
                    reset()
                },
            })
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    // Helper to get selected item label for Combobox display
    const getDonorLabel = (id: string) => {
        const donor = donors.find(d => d.id === id)
        return donor ? `${donor.first_name} ${donor.last_name}` : "Select Donor"
    }

    const getCampaignLabel = (id: string) => {
        const campaign = campaigns.find(c => c.id === id)
        return campaign ? campaign.name : "Select Campaign"
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Donation" : "Create Donation"}</DialogTitle>
                    <DialogDescription>
                        {isEditing
                            ? "Make changes to the donation here. Click save when you're done."
                            : "Add a new donation to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="amount">Amount</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="amount"
                                    type="number"
                                    placeholder="0.00"
                                    {...register("amount")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.amount]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="currency">Currency</FieldLabel>
                            <FieldContent>
                                <Select
                                    onValueChange={(value) => setValue("currency", value)}
                                    defaultValue={watch("currency")}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select currency" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="GHS">GHS</SelectItem>
                                        <SelectItem value="USD">USD</SelectItem>
                                        <SelectItem value="EUR">EUR</SelectItem>
                                        <SelectItem value="GBP">GBP</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FieldContent>
                            <FieldError errors={[errors.currency]} />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="payment_method">Payment Method</FieldLabel>
                        <FieldContent>
                            <Select
                                onValueChange={(value) => setValue("payment_method", value)}
                                defaultValue={watch("payment_method")}
                                value={watch("payment_method")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="momo">Mobile Money</SelectItem>
                                    <SelectItem value="card">Card</SelectItem>
                                    <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                                    <SelectItem value="cash">Cash</SelectItem>
                                </SelectContent>
                            </Select>
                        </FieldContent>
                        <FieldError errors={[errors.payment_method]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="donation_cause">Donation Cause</FieldLabel>
                        <FieldContent>
                            <Select
                                onValueChange={(value) => setValue("donation_cause", value)}
                                defaultValue={watch("donation_cause")}
                                value={watch("donation_cause")}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select cause" />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingCauses ? (
                                        <div className="p-2 flex justify-center"><Spinner /></div>
                                    ) : (
                                        donationCauses?.map((cause) => (
                                            <SelectItem key={cause.id} value={cause.name}>
                                                {cause.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                        </FieldContent>
                        <FieldError errors={[errors.donation_cause]} />
                    </Field>

                    <Field>
                        <FieldLabel>Donor</FieldLabel>
                        <FieldContent>
                            <Combobox
                                value={selectedDonorId || null}
                                onValueChange={(val) => setValue("donorId", String(val) || "")}
                            >
                                <ComboboxInput placeholder={selectedDonorId ? getDonorLabel(selectedDonorId) : "Select Donor"} />
                                <ComboboxContent>
                                    <ComboboxList>
                                        {isLoadingDonors ? (
                                            <div className="p-2 flex justify-center"><Spinner /></div>
                                        ) : donors.length === 0 ? (
                                            <ComboboxEmpty>No donors found.</ComboboxEmpty>
                                        ) : (
                                            donors.map((donor) => (
                                                <ComboboxItem key={donor.id} value={donor.id}>
                                                    {donor.first_name} {donor.last_name} ({donor.email})
                                                </ComboboxItem>
                                            ))
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </FieldContent>
                        <FieldError errors={[errors.donorId]} />
                    </Field>

                    <Field>
                        <FieldLabel>Campaign</FieldLabel>
                        <FieldContent>
                            <Combobox
                                value={selectedCampaignId || null}
                                onValueChange={(val) => setValue("campaignId", String(val) || "")}
                            >
                                <ComboboxInput placeholder={selectedCampaignId ? getCampaignLabel(selectedCampaignId) : "Select Campaign"} />
                                <ComboboxContent>
                                    <ComboboxList>
                                        {isLoadingCampaigns ? (
                                            <div className="p-2 flex justify-center"><Spinner /></div>
                                        ) : campaigns.length === 0 ? (
                                            <ComboboxEmpty>No campaigns found.</ComboboxEmpty>
                                        ) : (
                                            campaigns.map((campaign) => (
                                                <ComboboxItem key={campaign.id} value={campaign.id}>
                                                    {campaign.name}
                                                </ComboboxItem>
                                            ))
                                        )}
                                    </ComboboxList>
                                </ComboboxContent>
                            </Combobox>
                        </FieldContent>
                        <FieldError errors={[errors.campaignId]} />
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
