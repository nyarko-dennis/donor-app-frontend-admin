"use client";

import * as React from "react";
import { useState } from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Download } from "lucide-react";

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
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { triggerExport } from "@/lib/api/exports";

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
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Data Exports</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="col-span-2">
                    <CardHeader>
                        <CardTitle>Export Data</CardTitle>
                        <CardDescription>
                            Select the type of data and format you wish to export.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="entity">Data Type</Label>
                            <Select value={entity} onValueChange={(val: any) => setEntity(val)}>
                                <SelectTrigger id="entity">
                                    <SelectValue placeholder="Select data type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="donations">Donations</SelectItem>
                                    <SelectItem value="donors">Donors</SelectItem>
                                    <SelectItem value="campaigns">Campaigns</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="grid gap-2">
                                <Label>Start Date (Optional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !date && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            onSelect={setDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                            <div className="grid gap-2">
                                <Label>End Date (Optional)</Label>
                                <Popover>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant={"outline"}
                                            className={cn(
                                                "w-full justify-start text-left font-normal",
                                                !endDate && "text-muted-foreground"
                                            )}
                                        >
                                            <CalendarIcon className="mr-2 h-4 w-4" />
                                            {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                        <Calendar
                                            mode="single"
                                            selected={endDate}
                                            onSelect={setEndDate}
                                            initialFocus
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label>Format</Label>
                            <RadioGroup defaultValue="csv" value={formatType} onValueChange={(val: any) => setFormatType(val)} className="flex gap-4">
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="csv" id="r1" />
                                    <Label htmlFor="r1">CSV</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="xlsx" id="r2" />
                                    <Label htmlFor="r2">Excel (XLSX)</Label>
                                </div>
                            </RadioGroup>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" onClick={handleExport} disabled={isExporting}>
                            <Download className="mr-2 h-4 w-4" />
                            {isExporting ? "Exporting..." : "Download Export"}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
