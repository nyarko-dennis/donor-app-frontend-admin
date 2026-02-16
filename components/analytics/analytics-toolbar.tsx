"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Filter, Download } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useCampaigns } from "@/lib/query/hooks/useCampaigns";
import { useConstituencies } from "@/lib/query/hooks/useConstituencies";
import { AnalyticsFilters } from "@/lib/api/analytics";

interface AnalyticsToolbarProps {
    onFilterChange: (filters: AnalyticsFilters) => void;
    filters: AnalyticsFilters;
}

export function AnalyticsToolbar({ onFilterChange, filters }: AnalyticsToolbarProps) {
    const [date, setDate] = useState<DateRange | undefined>({
        from: filters.startDate ? new Date(filters.startDate) : undefined,
        to: filters.endDate ? new Date(filters.endDate) : undefined,
    });

    const { data: campaignsData } = useCampaigns({ pageSize: 100 });
    const { data: constituenciesData } = useConstituencies({ pageSize: 100 });


    const handleDateSelect = (newDate: DateRange | undefined) => {
        setDate(newDate);
        if (newDate?.from) {
            onFilterChange({
                ...filters,
                startDate: format(newDate.from, 'yyyy-MM-dd'),
                endDate: newDate.to ? format(newDate.to, 'yyyy-MM-dd') : undefined,
            });
        } else {
            onFilterChange({ ...filters, startDate: undefined, endDate: undefined });
        }
    }


    const handleCampaignChange = (value: string) => {
        onFilterChange({ ...filters, campaignId: value === "all" ? undefined : value });
    };

    const handleConstituencyChange = (value: string) => {
        onFilterChange({ ...filters, constituencyId: value === "all" ? undefined : value });
    };

    return (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
                <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Analytics Overview</h2>
                <p className="text-slate-500">Real-time performance and donor engagement insights.</p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {/* Campaign Filter */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1 shadow-sm">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select
                        value={filters.campaignId || "all"}
                        onValueChange={handleCampaignChange}
                    >
                        <SelectTrigger className="border-none shadow-none focus:ring-0 w-[160px] h-8 p-0">
                            <SelectValue placeholder="All Campaigns" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Campaigns</SelectItem>
                            {campaignsData?.data?.map((campaign) => (
                                <SelectItem key={campaign.id} value={campaign.id}>
                                    {campaign.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Constituency Filter */}
                <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1 shadow-sm">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <Select
                        value={filters.constituencyId || "all"}
                        onValueChange={handleConstituencyChange}
                    >
                        <SelectTrigger className="border-none shadow-none focus:ring-0 w-[160px] h-8 p-0">
                            <SelectValue placeholder="All Constituencies" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Constituencies</SelectItem>
                            {constituenciesData?.data?.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Date Filter */}
                <div className={cn("grid gap-2")}>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                id="date"
                                variant={"outline"}
                                className={cn(
                                    "w-[260px] justify-start text-left font-normal bg-white",
                                    !date && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date?.from ? (
                                    date.to ? (
                                        <>
                                            {format(date.from, "LLL dd, y")} -{" "}
                                            {format(date.to, "LLL dd, y")}
                                        </>
                                    ) : (
                                        format(date.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pick a date</span>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                initialFocus
                                mode="range"
                                defaultMonth={date?.from}
                                selected={date}
                                onSelect={handleDateSelect}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>
        </div>
    );
}
