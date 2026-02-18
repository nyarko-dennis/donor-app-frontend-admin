"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Check, ChevronRight, Loader2, UserPlus, Users, CreditCard, ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
} from "@/components/ui/field"
import {
    Combobox,
    ComboboxContent,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
    ComboboxEmpty,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"
// Data hooks
import { useDonationCauses } from "@/lib/query/hooks/useDonationCauses"
import { useCampaigns } from "@/lib/query/hooks/useCampaigns"
import { useDonors } from "@/lib/query/hooks/useDonors"
import { useConstituencies } from "@/lib/query/hooks/useConstituencies"
import { useSubConstituencies } from "@/lib/query/hooks/useSubConstituencies"
import { useCreateDonationMutation } from "@/lib/query/mutations/useDonationMutations"
import { useCreateDonorMutation } from "@/lib/query/mutations/useDonorMutations"
import { toast } from "sonner"
import { PaginationParams } from "@/types/pagination"
import { useDebounce } from "@/lib/hooks/use-debounce"
import { useDonation } from "@/lib/query/hooks/useDonations"
import { useUpdateDonationMutation } from "@/lib/query/mutations/useDonationMutations"
import { useEffect } from "react"

// Combined schema with conditional validation
const wizardSchema = z.object({
    amount: z.number().min(1, "Amount must be at least 1"),
    currency: z.literal("GHS"),
    payment_method: z.enum(["Cash", "In Kind"], {
        error: "Payment method is required",
    }),
    donation_cause: z.string().min(1, "Donation cause is required"),
    campaignId: z.string().min(1, "Campaign is required"),

    // Step 2 fields
    isNewDonor: z.boolean(),
    donorId: z.string().optional(),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    email: z.string().email("Invalid email address").optional().or(z.literal("")),
    phone: z.string().optional(),
    constituency: z.string().optional(),
    sub_constituency: z.string().optional(),
}).superRefine((data, ctx) => {
    if (!data.isNewDonor) {
        if (!data.donorId) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Please select a donor",
                path: ["donorId"],
            });
        }
    } else {
        if (!data.first_name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "First name is required",
                path: ["first_name"],
            });
        }
        if (!data.last_name) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Last name is required",
                path: ["last_name"],
            });
        }
        if (!data.email) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Email is required",
                path: ["email"],
            });
        }
    }
});

// Define form type manually to avoid Zod v4 inference issues with react-hook-form
interface WizardValues {
    amount: number
    currency: "GHS"
    payment_method: "Cash" | "In Kind"
    donation_cause: string
    campaignId: string
    isNewDonor: boolean
    donorId?: string
    first_name?: string
    last_name?: string
    email?: string
    phone?: string
    constituency?: string
    sub_constituency?: string
}

const STEPS = [
    { id: 1, title: "Donation Details", icon: CreditCard, description: "Amount & Campaign Info" },
    { id: 2, title: "Donor Information", icon: Users, description: "Select or Create Donor" },
]

export function CreateDonationWizard({ donationId }: { donationId?: string }) {
    const isEditing = !!donationId
    const router = useRouter()
    const [step, setStep] = useState(1)

    // Mutations
    const createDonationMutation = useCreateDonationMutation()
    const updateDonationMutation = useUpdateDonationMutation()
    const createDonorMutation = useCreateDonorMutation()

    // Query
    const { data: donationData, isLoading: isLoadingDonation } = useDonation(donationId ?? "")

    const [campaignSearch, setCampaignSearch] = useState("")
    const [donorSearch, setDonorSearch] = useState("")
    const debouncedDonorSearch = useDebounce(donorSearch, 500)

    // Data Fetching
    const { data: interactionCausesData, isLoading: isLoadingCauses } = useDonationCauses()
    const { data: campaignsPage, isLoading: isLoadingCampaigns } = useCampaigns({ page: 1, take: 100 } as PaginationParams)
    const { data: donorsPage, isLoading: isLoadingDonors } = useDonors({
        page: 1,
        take: 20,
        search: debouncedDonorSearch
    } as PaginationParams)
    const { data: constituenciesPage, isLoading: isLoadingConstituencies } = useConstituencies({ page: 1, take: 100 } as PaginationParams)
    const { data: subConstituenciesPage, isLoading: isLoadingSubConstituencies } = useSubConstituencies({ page: 1, take: 100 } as PaginationParams)

    const donationCauses = Array.isArray(interactionCausesData)
        ? interactionCausesData
        : (interactionCausesData as any)?.data || []
    const campaigns = campaignsPage?.data || []
    const donors = donorsPage?.data || []
    const constituencies = constituenciesPage?.data || []
    const allSubConstituencies = subConstituenciesPage?.data || []

    const filteredCampaigns = useMemo(() => {
        if (!campaignSearch) return campaigns
        return campaigns.filter((c: any) => c.name.toLowerCase().includes(campaignSearch.toLowerCase()))
    }, [campaigns, campaignSearch])

    // Donors are filtered server-side now
    const filteredDonors = donors

    const form = useForm<WizardValues>({
        resolver: zodResolver(wizardSchema) as any,
        defaultValues: {
            amount: 0,
            currency: "GHS",
            payment_method: "Cash",
            donation_cause: "",
            campaignId: "",
            isNewDonor: false,
            donorId: "",
            first_name: "",
            last_name: "",
            email: "",
            phone: "",
            constituency: "",
            sub_constituency: "",
        },
        mode: "onChange"
    })

    const { register, handleSubmit, watch, setValue, reset, trigger, formState: { errors } } = form

    // Handle initial data for editing
    useEffect(() => {
        if (isEditing && donationData) {
            reset({
                amount: donationData.amount,
                currency: donationData.currency as "GHS",
                payment_method: donationData.payment_method as "Cash" | "In Kind",
                donation_cause: donationData.donation_cause,
                campaignId: donationData.campaign?.id,
                isNewDonor: false,
                donorId: donationData.donor?.id,
            });
        }
    }, [isEditing, donationData, reset]);

    const isNewDonor = watch("isNewDonor")
    const selectedConstituency = watch("constituency")

    // Filter sub-constituencies
    const subConstituencies = useMemo(() => {
        if (!selectedConstituency) return []
        return allSubConstituencies.filter((sc: any) => sc.constituency?.name === selectedConstituency)
    }, [selectedConstituency, allSubConstituencies])

    const handleNext = async () => {
        const step1Valid = await trigger(["amount", "currency", "payment_method", "donation_cause", "campaignId"])
        if (step1Valid) {
            setStep(2)
        }
    }

    const handleBack = () => {
        if (step === 1) router.back()
        else setStep(1)
    }

    const onSubmit = async (data: WizardValues) => {
        try {
            let donorId = data.isNewDonor ? "" : data.donorId

            if (data.isNewDonor) {
                // Create Donor First
                const donorData = {
                    first_name: data.first_name!,
                    last_name: data.last_name!,
                    email: data.email!,
                    phone: data.phone,
                    constituency: data.constituency,
                    sub_constituency: data.sub_constituency,
                }
                const newDonor = await createDonorMutation.mutateAsync(donorData)
                donorId = newDonor.id
                toast.success("Donor created successfully")
            }

            if (!donorId) {
                toast.error("Donor ID is missing")
                return
            }

            if (isEditing) {
                await updateDonationMutation.mutateAsync({
                    id: donationId!,
                    data: {
                        amount: data.amount,
                        currency: data.currency,
                        payment_method: data.payment_method,
                        donation_cause: data.donation_cause,
                        campaignId: data.campaignId,
                    }
                })
                toast.success("Donation updated successfully")
            } else {
                // Create Donation
                await createDonationMutation.mutateAsync({
                    amount: data.amount,
                    currency: data.currency,
                    payment_method: data.payment_method,
                    donation_cause: data.donation_cause,
                    campaignId: data.campaignId,
                    donorId: donorId,
                    status: "completed",
                    transaction_id: `TXN-${Date.now()}`,
                    created_at: new Date().toISOString()
                })
                toast.success("Donation created successfully")
            }
            router.push("/dashboard/donations")
        } catch (error) {
            console.error(error)
            toast.error(isEditing ? "Failed to update donation" : "Failed to create donation")
        }
    }

    const isLoading = createDonationMutation.isPending || updateDonationMutation.isPending || createDonorMutation.isPending || isLoadingDonation

    // Helper for ComboBox displays
    const getCampaignLabel = (id: string) => {
        const c = campaigns.find(c => c.id === id)
        if (c) return c.name
        if (isEditing && donationData?.campaign && donationData.campaign.id === id) return donationData.campaign.name
        return "Select Campaign"
    }

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-zinc-50 dark:bg-zinc-950">
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Stepper */}
                <div className="w-80 bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 p-8 flex flex-col hidden md:flex">
                    <div className="mb-10">
                        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{isEditing ? "Edit Donation" : "Create Donation"}</h1>
                        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                            {isEditing ? "Update the details for this donation." : "Complete the steps to record a new donation."}
                        </p>
                    </div>

                    <div className="space-y-8 relative">
                        {STEPS.map((s, i) => {
                            const Icon = s.icon;
                            const isActive = step === s.id;
                            const isCompleted = step > s.id;

                            return (
                                <div key={s.id} className={cn("flex gap-4 relative z-10", isActive ? "opacity-100" : "opacity-60")}>
                                    {i !== STEPS.length - 1 && (
                                        <div className={cn(
                                            "absolute left-[19px] top-10 bottom-[-32px] w-0.5 transition-colors duration-300",
                                            isCompleted ? "bg-primary" : "bg-zinc-200 dark:bg-zinc-800"
                                        )} />
                                    )}
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 bg-white dark:bg-zinc-900",
                                        isActive ? "border-primary text-primary shadow-lg shadow-primary/20" :
                                            isCompleted ? "border-primary bg-primary text-primary-foreground" :
                                                "border-zinc-200 dark:border-zinc-800 text-zinc-400"
                                    )}>
                                        {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                                    </div>
                                    <div className="pt-1">
                                        <h3 className={cn("font-semibold text-base leading-none mb-1.5", isActive && "text-primary")}>{s.title}</h3>
                                        <p className="text-sm text-zinc-500">{s.description}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-6 md:p-10">
                        <div className="max-w-4xl mx-auto">
                            <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 md:p-8 min-h-[500px]">
                                <CardContent className="p-0">
                                    <form id="donation-wizard-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        {/* STEP 1 */}
                                        {step === 1 && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium">Donation Information</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <Field>
                                                            <FieldLabel htmlFor="amount">Amount</FieldLabel>
                                                            <FieldContent>
                                                                <div className="relative">
                                                                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">GH₵</div>
                                                                    <Input
                                                                        id="amount"
                                                                        type="number"
                                                                        placeholder="0.00"
                                                                        {...register("amount", { valueAsNumber: true })}
                                                                        className="pl-12 text-lg h-11"
                                                                    />
                                                                </div>
                                                            </FieldContent>
                                                            <FieldError errors={[errors.amount]} />
                                                        </Field>

                                                        <Field>
                                                            <FieldLabel htmlFor="payment_method">Payment Method</FieldLabel>
                                                            <FieldContent>
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    {["Cash", "In Kind"].map((method) => (
                                                                        <div
                                                                            key={method}
                                                                            onClick={() => setValue("payment_method", method as "Cash" | "In Kind")}
                                                                            className={cn(
                                                                                "cursor-pointer rounded-lg border-2 p-3 flex flex-col items-center justify-center gap-2 transition-all hover:bg-muted/50",
                                                                                watch("payment_method") === method
                                                                                    ? "border-primary bg-primary/5 text-primary"
                                                                                    : "border-muted bg-background text-muted-foreground"
                                                                            )}
                                                                        >
                                                                            <span className="font-medium">{method}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </FieldContent>
                                                            <FieldError errors={[errors.payment_method]} />
                                                        </Field>
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <h3 className="text-lg font-medium">Campaign Details</h3>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <Field>
                                                            <FieldLabel>Donation Cause</FieldLabel>
                                                            <FieldContent>
                                                                <Select
                                                                    onValueChange={(val) => setValue("donation_cause", val)}
                                                                    value={watch("donation_cause")}
                                                                >
                                                                    <SelectTrigger className="h-11">
                                                                        <SelectValue placeholder="Select cause" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {isLoadingCauses ? (
                                                                            <div className="flex justify-center p-2"><Loader2 className="animate-spin w-4 h-4" /></div>
                                                                        ) : (
                                                                            donationCauses.map((cause: any) => (
                                                                                <SelectItem key={cause.id} value={cause.name}>{cause.name}</SelectItem>
                                                                            ))
                                                                        )}
                                                                    </SelectContent>
                                                                </Select>
                                                            </FieldContent>
                                                            <FieldError errors={[errors.donation_cause]} />
                                                        </Field>

                                                        <Field>
                                                            <FieldLabel>Campaign</FieldLabel>
                                                            <FieldContent>
                                                                <Combobox
                                                                    value={watch("campaignId") || null}
                                                                    onValueChange={(val) => setValue("campaignId", String(val))}
                                                                    itemToStringLabel={(val) => getCampaignLabel(String(val))}
                                                                    onInputValueChange={(val) => setCampaignSearch(val)}
                                                                >
                                                                    <ComboboxInput
                                                                        placeholder="Select Campaign"
                                                                        className="h-11"
                                                                    />
                                                                    <ComboboxContent>
                                                                        <ComboboxList>
                                                                            {isLoadingCampaigns ? (
                                                                                <div className="flex justify-center p-2"><Loader2 className="animate-spin w-4 h-4" /></div>
                                                                            ) : (
                                                                                filteredCampaigns.map((c: any) => (
                                                                                    <ComboboxItem key={c.id} value={c.id}>
                                                                                        {c.name}
                                                                                    </ComboboxItem>
                                                                                ))
                                                                            )}
                                                                        </ComboboxList>
                                                                    </ComboboxContent>
                                                                </Combobox>
                                                            </FieldContent>
                                                            <FieldError errors={[errors.campaignId]} />
                                                        </Field>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {/* STEP 2 */}
                                        {step === 2 && (
                                            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                                    <div>
                                                        <h3 className="text-lg font-medium">Donor Information</h3>
                                                        <p className="text-sm text-muted-foreground">Search for an existing donor or create a new one.</p>
                                                    </div>

                                                    {/* Toggle between Existing and New Donor */}
                                                    <div className="flex border rounded-lg p-1 bg-muted/20 self-stretch md:self-auto">
                                                        <button
                                                            type="button"
                                                            disabled={isEditing}
                                                            onClick={() => setValue("isNewDonor", false)}
                                                            className={cn(
                                                                "flex-1 md:flex-none px-4 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                                                                !isNewDonor ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground",
                                                                isEditing && "opacity-50 cursor-not-allowed"
                                                            )}
                                                        >
                                                            <Users className="w-4 h-4" />
                                                            Existing Donor
                                                        </button>
                                                        <button
                                                            type="button"
                                                            disabled={isEditing}
                                                            onClick={() => setValue("isNewDonor", true)}
                                                            className={cn(
                                                                "flex-1 md:flex-none px-4 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-all",
                                                                isNewDonor ? "bg-white shadow text-primary" : "text-muted-foreground hover:text-foreground",
                                                                isEditing && "opacity-50 cursor-not-allowed"
                                                            )}
                                                        >
                                                            <UserPlus className="w-4 h-4" />
                                                            Create New Donor
                                                        </button>
                                                    </div>
                                                </div>

                                                {!isNewDonor ? (
                                                    <div className="space-y-4 max-w-xl">
                                                        <Field>
                                                            <FieldLabel>Select Donor</FieldLabel>
                                                            <FieldContent>
                                                                <Combobox
                                                                    value={watch("donorId") || null}
                                                                    onValueChange={(val) => setValue("donorId", val ? String(val) : "")}
                                                                    itemToStringLabel={(val) => {
                                                                        const d = donors.find((d: any) => d.id === val)
                                                                        if (d) return `${d.first_name} ${d.last_name} (${d.email})`
                                                                        if (isEditing && donationData?.donor) return `${donationData.donor.first_name} ${donationData.donor.last_name} (${donationData.donor.email})`
                                                                        return String(val)
                                                                    }}
                                                                    onInputValueChange={(val) => setDonorSearch(val)}
                                                                    disabled={isEditing}
                                                                >
                                                                    <ComboboxInput
                                                                        placeholder="Search donor name or email..."
                                                                        className="h-11"
                                                                    />
                                                                    <ComboboxContent>
                                                                        <ComboboxList>
                                                                            {isLoadingDonors ? (
                                                                                <div className="flex justify-center p-2"><Loader2 className="animate-spin w-4 h-4" /></div>
                                                                            ) : donors.length === 0 ? (
                                                                                <ComboboxEmpty>No donors found.</ComboboxEmpty>
                                                                            ) : (
                                                                                filteredDonors.map((d: any) => {
                                                                                    const label = `${d.first_name} ${d.last_name} (${d.email})`
                                                                                    return (
                                                                                        <ComboboxItem key={d.id} value={d.id}>
                                                                                            {label}
                                                                                        </ComboboxItem>
                                                                                    )
                                                                                })
                                                                            )}
                                                                        </ComboboxList>
                                                                    </ComboboxContent>
                                                                </Combobox>
                                                            </FieldContent>
                                                            {errors.donorId && <p className="text-sm font-medium text-destructive mt-1">{errors.donorId.message}</p>}
                                                        </Field>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-6">
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Field>
                                                                <FieldLabel>First Name</FieldLabel>
                                                                <FieldContent>
                                                                    <Input placeholder="First Name" {...register("first_name")} className="h-11" />
                                                                </FieldContent>
                                                                {errors.first_name && <p className="text-sm font-medium text-destructive mt-1">{errors.first_name.message}</p>}
                                                            </Field>
                                                            <Field>
                                                                <FieldLabel>Last Name</FieldLabel>
                                                                <FieldContent>
                                                                    <Input placeholder="Last Name" {...register("last_name")} className="h-11" />
                                                                </FieldContent>
                                                                {errors.last_name && <p className="text-sm font-medium text-destructive mt-1">{errors.last_name.message}</p>}
                                                            </Field>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Field>
                                                                <FieldLabel>Email</FieldLabel>
                                                                <FieldContent>
                                                                    <Input type="email" placeholder="email@example.com" {...register("email")} className="h-11" />
                                                                </FieldContent>
                                                                {errors.email && <p className="text-sm font-medium text-destructive mt-1">{errors.email.message}</p>}
                                                            </Field>

                                                            <Field>
                                                                <FieldLabel>Phone</FieldLabel>
                                                                <FieldContent>
                                                                    <Input placeholder="+233..." {...register("phone")} className="h-11" />
                                                                </FieldContent>
                                                                {errors.phone && <p className="text-sm font-medium text-destructive mt-1">{errors.phone.message}</p>}
                                                            </Field>
                                                        </div>

                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <Field>
                                                                <FieldLabel>Constituency</FieldLabel>
                                                                <FieldContent>
                                                                    <Select onValueChange={(val) => {
                                                                        setValue("constituency", val)
                                                                        setValue("sub_constituency", "")
                                                                    }}>
                                                                        <SelectTrigger className="h-11">
                                                                            <SelectValue placeholder="Select Constituency" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {constituencies.map((c: any) => (
                                                                                <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FieldContent>
                                                            </Field>
                                                            <Field>
                                                                <FieldLabel>Sub-Constituency</FieldLabel>
                                                                <FieldContent>
                                                                    <Select onValueChange={(val) => setValue("sub_constituency", val)} disabled={!selectedConstituency}>
                                                                        <SelectTrigger className="h-11">
                                                                            <SelectValue placeholder="Select Sub-Constituency" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            {subConstituencies.map((sc: any) => (
                                                                                <SelectItem key={sc.id} value={sc.name}>{sc.name}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                </FieldContent>
                                                            </Field>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Sticky Footer */}
                    <div className="p-6 border-t bg-white dark:bg-zinc-900 flex justify-between items-center px-6 md:px-10">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleBack}
                            disabled={isLoading}
                            className="w-32 h-11"
                        >
                            <ChevronLeft className="w-4 h-4 mr-2" />
                            {step === 1 ? "Cancel" : "Back"}
                        </Button>

                        {step === 1 ? (
                            <Button
                                type="button"
                                onClick={handleNext}
                                className="w-32 h-11"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-2" />
                            </Button>
                        ) : (
                            <Button
                                type="submit"
                                form="donation-wizard-form"
                                disabled={isLoading}
                                className="w-40 h-11"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    isEditing ? "Update Donation" : "Create Donation"
                                )}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
