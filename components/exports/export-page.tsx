"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download, FileJson, FileSpreadsheet, History, Info } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { triggerExport } from "@/lib/api/exports";
import { Separator } from "@/components/ui/separator";

export function ExportPage() {
    const [entity, setEntity] = useState<'donations' | 'donors' | 'campaigns'>('donations');
    const [formatType, setFormatType] = useState<'csv' | 'xlsx'>('csv');
    const [date, setDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        const filters: any = {};
        if (date) filters.startDate = date.toISOString();
        if (endDate) filters.endDate = endDate.toISOString();

        await triggerExport(entity, formatType, filters);
        setIsExporting(false);
    };

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10">
            {/* Header Section */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="flex flex-col gap-1">
                    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">Data Management</h2>
                    <p className="text-slate-500">Generate and manage your organization's data reports.</p>
                </div>
            </div>

            <div className="max-w-6xl mx-auto grid gap-8 lg:grid-cols-3">

                {/* Main Export Card */}
                <Card className="lg:col-span-2 shadow-sm border-slate-200/60 overflow-hidden">
                    <CardHeader className="bg-white pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 bg-emerald-50 rounded-lg">
                                <Download className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                                <CardTitle className="text-xl">Export Report</CardTitle>
                                <CardDescription>Configure your data parameters below.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="p-8 space-y-8">
                        {/* Data Type Selection */}
                        <div className="grid gap-3">
                            <Label htmlFor="entity" className="text-sm font-medium text-slate-700">Select Dataset</Label>
                            <Select value={entity} onValueChange={(val: any) => setEntity(val)}>
                                <SelectTrigger id="entity" className="h-12 border-slate-200 focus:ring-emerald-500/20">
                                    <SelectValue placeholder="Select data type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="donations">Donations History</SelectItem>
                                    <SelectItem value="donors">Donor Registry</SelectItem>
                                    <SelectItem value="campaigns">Active Campaigns</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Date Range Selection */}
                        <div className="grid gap-3">
                            <Label className="text-sm font-medium text-slate-700">Date Range (Optional)</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "h-12 justify-start text-left font-normal border-slate-200 hover:bg-slate-50",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                            {date ? format(date, "PPP") : "From date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                    </PopoverContent>
                                </Popover>

                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className={cn(
                                                "h-12 justify-start text-left font-normal border-slate-200 hover:bg-slate-50",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                                            {endDate ? format(endDate, "PPP") : "To date"}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={endDate} onSelect={setEndDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        {/* File Format Selection */}
                        <div className="grid gap-4">
                            <Label className="text-sm font-medium text-slate-700">Preferred Format</Label>
                            <RadioGroup
                                defaultValue="csv"
                                value={formatType}
                                onValueChange={(val: any) => setFormatType(val)}
                                className="grid grid-cols-2 gap-4"
                            >
                                <Label
                                    htmlFor="csv"
                                    className={cn(
                                        "flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 cursor-pointer transition-all",
                                        formatType === "csv" && "border-emerald-500 bg-emerald-50/30"
                                    )}
                                >
                                    <RadioGroupItem value="csv" id="csv" className="sr-only" />
                                    <FileJson className={cn("mb-2 h-6 w-6 text-slate-400", formatType === "csv" && "text-emerald-600")} />
                                    <span className="text-sm font-semibold">CSV File</span>
                                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Standard</span>
                                </Label>

                                <Label
                                    htmlFor="xlsx"
                                    className={cn(
                                        "flex flex-col items-center justify-between rounded-xl border-2 border-slate-100 bg-white p-4 hover:bg-slate-50 cursor-pointer transition-all",
                                        formatType === "xlsx" && "border-emerald-500 bg-emerald-50/30"
                                    )}
                                >
                                    <RadioGroupItem value="xlsx" id="xlsx" className="sr-only" />
                                    <FileSpreadsheet className={cn("mb-2 h-6 w-6 text-slate-400", formatType === "xlsx" && "text-emerald-600")} />
                                    <span className="text-sm font-semibold">Excel Sheet</span>
                                    <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Enhanced</span>
                                </Label>
                            </RadioGroup>
                        </div>
                    </CardContent>

                    <div className="p-8 bg-slate-50/50 border-t border-slate-100">
                        <Button
                            className="w-full h-12 text-md font-medium shadow-lg shadow-emerald-900/10 bg-emerald-600 hover:bg-emerald-700 transition-all"
                            onClick={handleExport}
                            disabled={isExporting}
                        >
                            {isExporting ? (
                                <span className="flex items-center gap-2">Generating Report...</span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <Download className="h-4 w-4" /> Prepare & Download Export
                                </span>
                            )}
                        </Button>
                    </div>
                </Card>

                {/* Right Column: Info/Help Panel */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-slate-200/60 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <Info className="h-4 w-4 text-slate-400" />
                                Export Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-slate-600 space-y-4">
                            <p>Exports may take up to 30 seconds for large datasets. You will receive a notification when the file is ready.</p>
                            <Separator className="bg-slate-100" />
                            <div className="flex flex-col gap-2">
                                <span className="font-semibold text-slate-700">Privacy Notice:</span>
                                <p className="text-xs">Downloaded files contain PII (Personally Identifiable Information). Please handle according to school policy.</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-slate-200/60 bg-white">
                        <CardHeader>
                            <CardTitle className="text-lg flex items-center gap-2 text-slate-800">
                                <History className="h-4 w-4 text-slate-400" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex items-center justify-between text-sm group cursor-pointer">
                                        <div className="flex flex-col">
                                            <span className="font-medium text-slate-700">Donations_Feb2026.csv</span>
                                            <span className="text-xs text-slate-400">2 minutes ago</span>
                                        </div>
                                        <Download className="h-4 w-4 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}