"use client";

import { Table } from "@tanstack/react-table";
import { X, Search, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTableViewOptions } from "@/components/datatable/data-table-view-options";
import { DataTableFacetedFilter } from "@/components/datatable/data-table-faceted-filter";
import React, { useEffect, useState } from "react";

export interface FilterOption {
    // Allow non-string values so filters can match underlying column types (e.g., boolean or number)
    value: unknown;
    label: string;
}

export interface ToolbarActionButton {
    key: string;
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant?: "default" | "secondary" | "destructive" | "outline" | "ghost" | "link";
    size?: "default" | "sm" | "lg" | "icon";
    className?: string;
}

export interface DataTableToolbarProps<TData> {
    table: Table<TData>;
    searchPlaceholder?: string;
    showCreateButton?: boolean;
    createButtonLabel?: string;
    onCreateItem?: () => void;
    extraActionsLeft?: React.ReactNode;
    actionButtons?: ToolbarActionButton[];
    filterableColumns?: {
        id: string;
        title: string;
        options: FilterOption[];
    }[];
}

export function DataTableToolbar<TData>({
    table,
    searchPlaceholder = "Search...",
    showCreateButton = false,
    createButtonLabel = "Create",
    onCreateItem,
    extraActionsLeft,
    actionButtons = [],
    filterableColumns = [],
}: Readonly<DataTableToolbarProps<TData>>) {
    // Keep the input value in sync with the table's globalFilter so it doesn't reset on remounts
    const globalFilter = (table.getState().globalFilter as string) ?? "";

    // Initialize local state with the external filter value.
    // This value is updated by the Input field and is debounced to update the table's globalFilter.
    const [searchValue, setSearchValue] = useState(globalFilter);

    // ----------------------------------------------------------------------------------
    // ⚠️ THE PREVIOUS EFFECT HAS BEEN REMOVED TO PREVENT CASCADING RENDERS:
    /*
    useEffect(() => {
        setSearchValue((prev) => (prev === globalFilter ? prev : globalFilter));
    }, [globalFilter]);
    */
    // ----------------------------------------------------------------------------------

    // Apply search after a short delay to avoid excessive filtering while typing
    useEffect(() => {
        const handler = setTimeout(() => {
            // Only update the table if the value actually changed to avoid loops
            if (globalFilter !== searchValue) {
                table.setGlobalFilter(searchValue);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [searchValue, globalFilter, table]);

    // Check if any filters are applied
    const isFiltered =
        table.getState().columnFilters.length > 0 ||
        (table.getState().globalFilter as string) !== "";

    // Handler for the reset button
    const handleReset = () => {
        table.resetColumnFilters();
        // Clear the table's global filter
        table.setGlobalFilter("");
        // Synchronously clear the local state to update the Input field immediately
        setSearchValue("");
    };

    return (
        <div className="flex items-center justify-between py-4">
            <div className="flex flex-1 items-center space-x-2">
                {extraActionsLeft}
                <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        // Update local state immediately when the user types
                        onChange={(e) => setSearchValue(e.target.value)}
                        className="pl-8 h-8 w-[150px] lg:w-[250px]"
                        autoFocus
                    />
                </div>

                {/* Render filterable columns */}
                {filterableColumns.map((column) => {
                    // Only render if the column exists in the table
                    if (!table.getColumn(column.id)) return null;

                    return (
                        <DataTableFacetedFilter
                            key={column.id}
                            column={table.getColumn(column.id)}
                            title={column.title}
                            options={column.options}
                            hideCounts={table.options.manualFiltering}
                        />
                    );
                })}

                {/* Reset filters button */}
                {isFiltered && (
                    <Button
                        variant="ghost"
                        onClick={handleReset}
                        className="h-8 px-2 lg:px-3"
                    >
                        Reset
                        <X className="h-4 w-4 ml-2" />
                    </Button>
                )}
            </div>

            <div className="flex items-center space-x-2">
                {/* Additional action buttons */}
                {actionButtons.map(({ key, label, onClick, icon, variant = "default", size = "sm", className }) => (
                    <Button key={key} onClick={onClick} variant={variant} size={size} className={className ?? "h-8"}>
                        {icon}
                        {label}
                    </Button>
                ))}
                {/* Create button */}
                {showCreateButton && onCreateItem && (
                    <Button onClick={onCreateItem} size="sm" className="h-8">
                        <Plus className="h-4 w-4 mr-2" />
                        {createButtonLabel}
                    </Button>
                )}

                {/* Column visibility options */}
                <DataTableViewOptions table={table} />
            </div>
        </div>
    );
}