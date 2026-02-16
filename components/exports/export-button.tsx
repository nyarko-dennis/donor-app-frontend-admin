"use client";

import * as React from "react";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { triggerExport, ExportFilters } from "@/lib/api/exports";
import { useState } from "react";

interface ExportButtonProps {
    entity: 'donations' | 'donors' | 'campaigns';
    filters: ExportFilters;
    className?: string; // Allow custom styling
}

export function ExportButton({ entity, filters, className }: ExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async (format: 'csv' | 'xlsx') => {
        setIsExporting(true);
        await triggerExport(entity, format, filters);
        setIsExporting(false);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className={className} disabled={isExporting}>
                    <Download className="mr-2 h-4 w-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleExport('csv')}>
                    Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('xlsx')}>
                    Export as Excel
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
