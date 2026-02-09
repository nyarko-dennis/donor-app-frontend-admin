"use client";

import React, { useState, useEffect } from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    FilterFn,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFacetedRowModel,
    getFacetedUniqueValues,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
    Table as TableInstance
} from "@tanstack/react-table";
import { rankItem, RankingInfo } from "@tanstack/match-sorter-utils";
import { AlertCircle } from "lucide-react";

// Import UI components
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Skeleton } from '@/components/ui/skeleton';
import {
    Card,
    CardContent
} from "@/components/ui/card";
import { DataTablePagination } from "@/components/datatable/data-table-pagination";

export interface DataTableToolbarProps<TData> {
    table: TableInstance<TData>;
    onCreateItem?: () => void;
}

// Types for the generic data table
export interface GenericDataTableProps<TData> {
    data: TData[] | undefined;
    columns: ColumnDef<TData>[];
    toolbar: React.ReactElement<DataTableToolbarProps<TData>>;
    isLoading: boolean;
    isFetching?: boolean;
    error: Error | null;
    refetch?: () => void;
    totalElements?: number;
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    noResultsIcon?: React.ReactNode;
    noResultsTitle?: string;
    noResultsDescription?: string;
    globalFilterFn?: FilterFn<TData>;
    manualPagination?: boolean;
    manualSorting?: boolean;
    manualFiltering?: boolean;
    // Controlled mode (for server-side pagination/sorting)
    controlledSorting?: SortingState;
    onSortingChange?: (updater: SortingState) => void;
    controlledPagination?: { pageIndex: number; pageSize: number };
    onPaginationChange?: (updater: { pageIndex: number; pageSize: number }) => void;
    // Controlled mode for filters
    controlledColumnFilters?: ColumnFiltersState;
    onColumnFiltersChange?: (updater: ColumnFiltersState) => void;
    controlledGlobalFilter?: string;
    onGlobalFilterChange?: (updater: string) => void;
}

declare module '@tanstack/react-table' {
    interface FilterMeta {
        itemRank: RankingInfo;
    }
}

// Generic fuzzy filter function
export const createGlobalFuzzyFilter = <TData,>(columnsToSearch: string[]): FilterFn<TData> => {
    return (row, columnId, filterValue) => {
        const search = String(filterValue).toLowerCase();

        for (const colId of columnsToSearch) {
            const value = row.getValue(colId) as string | number;
            if (value !== undefined && value !== null) {
                const stringValue = typeof value === 'number' ? value.toString() : String(value);
                if (rankItem(stringValue.toLowerCase(), search).passed) {
                    return true;
                }
            }
        }
        return false;
    };
};

// Word-prefix global filter for stricter country searching
// Matches if any searched column contains a word that starts with the search term (case-insensitive).
// This avoids mid-word fuzzy hits like "Uganda" matching "South Georgia ...".
export const createGlobalWordPrefixFilter = <TData,>(columnsToSearch: string[]): FilterFn<TData> => {
    return (row, _columnId, filterValue) => {
        const raw = String(filterValue || "").trim().toLowerCase();
        if (!raw) return true; // no filter

        for (const colId of columnsToSearch) {
            const value = row.getValue(colId);
            if (value === undefined || value === null) continue;
            const text = String(value).toLowerCase();

            // If the query contains non-alphanumeric characters (e.g., '-')
            // allow a simple startsWith on the full text as a fallback. This
            // fixes cases like tracking numbers (e.g., "trk-117...") where
            // splitting on non-word chars would otherwise break the prefix match
            // exactly at the hyphen.
            const hasNonWord = /[^\p{L}\p{N}\s]/u.test(raw);
            if (hasNonWord && text.startsWith(raw)) {
                return true;
            }

            // Split on non-letters/numbers to get word boundaries
            const words = text.split(/[^\p{L}\p{N}]+/u).filter(Boolean);

            // If the search has multiple tokens, require all tokens to be found as word-prefixes
            const tokens = raw.split(/\s+/).filter(Boolean);

            const allTokensMatch = tokens.every(token => {
                // For very short tokens (1 char), allow startsWith on the whole text to keep UX acceptable
                if (token.length <= 1) {
                    return text.startsWith(token);
                }
                return words.some(w => w.startsWith(token));
            });

            if (allTokensMatch) return true;
        }
        return false;
    };
};

export function GenericDataTable<TData>({
    data,
    columns,
    toolbar,
    isLoading,
    isFetching = false,
    error,
    refetch,
    totalElements = 0,
    emptyIcon,
    emptyTitle = "No data found",
    emptyDescription = "There is no data available at the moment.",
    noResultsIcon,
    noResultsTitle = "No matching results",
    noResultsDescription = "No items match your current search or filters.",
    globalFilterFn,
    manualPagination = true,
    manualSorting = true,
    manualFiltering = false,
    controlledSorting,
    onSortingChange,
    controlledPagination,
    onPaginationChange,
    controlledColumnFilters,
    onColumnFiltersChange,
    controlledGlobalFilter,
    onGlobalFilterChange,
}: GenericDataTableProps<TData>) {
    const [internalSorting, setInternalSorting] = useState<SortingState>([]);
    const [internalColumnFilters, setInternalColumnFilters] = useState<ColumnFiltersState>([]);
    const [internalGlobalFilter, setInternalGlobalFilter] = useState<string>("");
    // Compute initial visibility - hide columns with meta.hidden: true
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(() => {
        const initial: VisibilityState = {};
        columns.forEach(col => {
            const id = 'id' in col ? col.id : ('accessorKey' in col ? String(col.accessorKey) : undefined);
            if (id && col.meta && (col.meta as { hidden?: boolean }).hidden) {
                initial[id] = false;
            }
        });
        return initial;
    });
    const [internalPagination, setInternalPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const sorting = controlledSorting ?? internalSorting;
    const setSorting = (updater: SortingState | ((prev: SortingState) => SortingState)) => {
        const next = typeof updater === 'function' ? (updater as (prev: SortingState) => SortingState)(sorting) : updater;
        if (onSortingChange) onSortingChange(next);
        else setInternalSorting(next);
    };

    const columnFilters = controlledColumnFilters ?? internalColumnFilters;
    const setColumnFilters = (updater: ColumnFiltersState | ((prev: ColumnFiltersState) => ColumnFiltersState)) => {
        const next = typeof updater === 'function' ? (updater as (prev: ColumnFiltersState) => ColumnFiltersState)(columnFilters) : updater;
        if (onColumnFiltersChange) onColumnFiltersChange(next);
        else setInternalColumnFilters(next);
    };

    const globalFilter = controlledGlobalFilter ?? internalGlobalFilter;
    const setGlobalFilter = (updater: string | ((prev: string) => string)) => {
        const next = typeof updater === 'function' ? (updater as (prev: string) => string)(globalFilter) : updater;
        if (onGlobalFilterChange) onGlobalFilterChange(next);
        else setInternalGlobalFilter(next);
    };

    const pagination = controlledPagination ?? internalPagination;
    const setPagination = (updater: { pageIndex: number; pageSize: number } | ((prev: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })) => {
        const next = typeof updater === 'function' ? (updater as (prev: { pageIndex: number; pageSize: number }) => { pageIndex: number; pageSize: number })(pagination) : updater;
        if (onPaginationChange) onPaginationChange(next);
        else setInternalPagination(next);
    };

    // Reset pagination when sorting or filtering changes
    // Avoid loops: if the table is in controlled mode (parent owns pagination),
    // do NOT reset here; let the parent decide. Only reset in uncontrolled mode.
    useEffect(() => {
        const isControlled = !!controlledPagination || !!onPaginationChange;
        if (!isControlled && (sorting.length > 0 || columnFilters.length > 0 || globalFilter)) {
            setInternalPagination(prev => ({ ...prev, pageIndex: 0 }));
        }
    }, [sorting, columnFilters, globalFilter, controlledPagination, onPaginationChange]);

    // Handle 204 No Content response - when data is undefined, treat as empty
    const tableData = data || [];

    // Calculate total pages safely
    const totalPages = Math.ceil(totalElements / pagination.pageSize);

    // Initialize React Table
    const table = useReactTable({
        data: tableData,
        columns,
        state: {
            sorting,
            columnVisibility,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        onColumnVisibilityChange: setColumnVisibility,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        getFacetedRowModel: getFacetedRowModel(),
        getFacetedUniqueValues: getFacetedUniqueValues(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        filterFns: {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            fuzzy: globalFilterFn || ((_row, _id, _value) => true),
        },
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        globalFilterFn: globalFilterFn || ((_row, _id, _value) => true),
        manualPagination,
        manualSorting,
        manualFiltering,
        pageCount: manualPagination ? totalPages : undefined,
    });

    if (error) {
        return (
            <Card className="mt-6">
                <CardContent className="flex flex-col items-center justify-center py-10 gap-3 text-center">
                    <AlertCircle className="h-12 w-12 text-red-500" />
                    <h3 className="font-medium text-lg">Failed to load data.</h3>
                    <p className="text-sm text-muted-foreground">
                        {error.message || "An unknown error occurred."}
                    </p>
                    {refetch && (
                        <Button onClick={() => refetch()} className="mt-4">
                            Retry
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    }

    const showLoadingSkeleton = isLoading || isFetching;

    if (showLoadingSkeleton) {
        const skeletonRowCount = pagination.pageSize;
        const numColumns = columns.length;

        return (
            <div className="mt-6">
                <div className="flex items-center py-4">
                    <Skeleton className="h-8 w-[250px]" />
                    <div className="ml-auto flex items-center space-x-2">
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="h-8 w-[100px]" />
                        <Skeleton className="h-8 w-[120px]" />
                        <Skeleton className="h-8 w-[40px]" />
                    </div>
                </div>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                {[...Array(numColumns)].map((_, i) => (
                                    <TableHead key={i}>
                                        <Skeleton className="h-6 w-full" />
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {[...Array(skeletonRowCount)].map((_, rowIndex) => (
                                <TableRow key={rowIndex}>
                                    {[...Array(numColumns)].map((_, colIndex) => (
                                        <TableCell key={colIndex}>
                                            <Skeleton className="h-6 w-full" />
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
                <div className="mt-4 flex justify-end">
                    <Skeleton className="h-8 w-[300px]" />
                </div>
            </div>
        );
    }

    // Handle empty states
    const hasData = tableData.length > 0;
    const hasFilteredResults = table.getRowModel().rows.length > 0;
    const isFiltered = table.getState().columnFilters.length > 0 || table.getState().globalFilter !== "";

    if (!hasData || !hasFilteredResults) {
        return (
            <Card className="mt-6">
                <CardContent className="flex flex-col">
                    {toolbar && React.cloneElement(toolbar, { table })}

                    {hasData && isFiltered ? (
                        // No search results state
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className="bg-muted/30 p-4 rounded-full">
                                {noResultsIcon}
                            </div>
                            <h3 className="font-medium">{noResultsTitle}</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                {noResultsDescription}
                            </p>
                        </div>
                    ) : (
                        // No data at all state
                        <div className="flex flex-col items-center justify-center py-10 gap-3">
                            <div className="bg-muted/30 p-4 rounded-full">
                                {emptyIcon}
                            </div>
                            <h3 className="font-medium">{emptyTitle}</h3>
                            <p className="text-sm text-muted-foreground text-center max-w-md">
                                {emptyDescription}
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="mt-6">
            {toolbar && React.cloneElement(toolbar, { table })}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(
                                                header.column.columnDef.header,
                                                header.getContext()
                                            )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <div className="mt-4">
                <DataTablePagination table={table} />
            </div>
        </div>
    );
}
