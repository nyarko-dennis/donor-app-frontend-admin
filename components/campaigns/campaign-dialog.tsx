"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateCampaignMutation, useUpdateCampaignMutation } from "@/lib/query/mutations/useCampaignMutations"
import { CampaignFormValues, campaignSchema } from "@/schemas/campaigns"
import { CampaignResponseDto } from "@/types/campaigns"
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
import { Textarea } from "@/components/ui/textarea"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"

interface CampaignDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    campaign: CampaignResponseDto | null
}

const CAMPAIGN_STATUSES = ["PLANNED", "ACTIVE", "COMPLETED", "CANCELLED"]

export function CampaignDialog({
    open,
    onOpenChange,
    campaign,
}: Readonly<CampaignDialogProps>) {
    const createMutation = useCreateCampaignMutation()
    const updateMutation = useUpdateCampaignMutation()

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CampaignFormValues>({
        resolver: zodResolver(campaignSchema) as any,
        defaultValues: {
            name: "",
            description: "",
            target_audience: "",
            goal_amount: 0,
            start_date: undefined,
            end_date: undefined,
            status: "PLANNED",
        },
    })

    useEffect(() => {
        if (campaign) {
            reset({
                name: campaign.name,
                description: campaign.description,
                target_audience: campaign.target_audience,
                goal_amount: campaign.goal_amount,
                start_date: new Date(campaign.start_date),
                end_date: new Date(campaign.end_date),
                status: campaign.status,
            })
        } else {
            reset({
                name: "",
                description: "",
                target_audience: "",
                goal_amount: 0,
                start_date: undefined,
                end_date: undefined,
                status: "PLANNED",
            })
        }
    }, [campaign, reset, open])

    const onSubmit = (values: CampaignFormValues) => {
        // Convert dates to ISO strings for API if needed, or keeping as dates is handled by validation/serialization
        // The mutation expects CreateCampaignDto where dates are string in interface but usually Date object works or needs conversion
        // Checking types/campaigns.ts: start_date?: string; end_date?: string;
        // So we should convert to ISO string.

        const formattedValues = {
            ...values,
            start_date: values.start_date.toISOString(),
            end_date: values.end_date.toISOString(),
        }

        if (campaign) {
            updateMutation.mutate(
                { id: campaign.id, data: formattedValues },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        reset()
                    },
                }
            )
        } else {
            createMutation.mutate(
                formattedValues,
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>
                        {campaign ? "Edit Campaign" : "Create Campaign"}
                    </DialogTitle>
                    <DialogDescription>
                        {campaign
                            ? "Update campaign details."
                            : "Create a new fundraising campaign."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel htmlFor="name">Name</FieldLabel>
                        <FieldContent>
                            <Input
                                id="name"
                                placeholder="Campaign Name"
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
                                placeholder="Campaign details..."
                                {...register("description")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.description]} />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="target_audience">Target Audience</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="target_audience"
                                    placeholder="e.g. Alumni, Parents"
                                    {...register("target_audience")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.target_audience]} />
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="goal_amount">Goal Amount (GHS)</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="goal_amount"
                                    type="number"
                                    placeholder="0.00"
                                    {...register("goal_amount")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.goal_amount]} />
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel>Start Date</FieldLabel>
                            <FieldContent>
                                <Controller
                                    control={control}
                                    name="start_date"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.start_date]} />
                        </Field>

                        <Field>
                            <FieldLabel>End Date</FieldLabel>
                            <FieldContent>
                                <Controller
                                    control={control}
                                    name="end_date"
                                    render={({ field }) => (
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant={"outline"}
                                                    className={cn(
                                                        "w-full pl-3 text-left font-normal",
                                                        !field.value && "text-muted-foreground"
                                                    )}
                                                >
                                                    {field.value ? (
                                                        format(field.value, "PPP")
                                                    ) : (
                                                        <span>Pick a date</span>
                                                    )}
                                                    <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    )}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.end_date]} />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <FieldContent>
                            <Controller
                                control={control}
                                name="status"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="status">
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {CAMPAIGN_STATUSES.map((status) => (
                                                <SelectItem key={status} value={status}>
                                                    {status}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.status]} />
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
