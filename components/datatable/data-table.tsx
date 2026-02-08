"use client";

import React from 'react';
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    FilterFn,
    Table,
} from "@tanstack/react-table";
import { Package } from "lucide-react";

import { GenericDataTable, DataTableToolbarProps } from "@/components/datatable/generic-data-table";
import { useDataTable } from "@/lib/query/hooks/shared/useDataTable";
import { PaginationParams } from "@/types/pagination";

export interface DataTableProps<TData, TParams extends PaginationParams = PaginationParams> {
    columns: ColumnDef<TData>[];
    useQueryHook: (params: TParams) => ReturnType<typeof useDataTable<TData, TParams>>["queryResult"];
    initialParams: TParams;
    toolbar: React.ComponentType<DataTableToolbarProps<TData>>;
    emptyIcon?: React.ReactNode;
    emptyTitle?: string;
    emptyDescription?: string;
    noResultsIcon?: React.ReactNode;
    noResultsTitle?: string;
    noResultsDescription?: string;
    globalFilterFn?: FilterFn<TData>;
    onCreateItem?: () => void;
    manualPagination?: boolean;
    manualSorting?: boolean;
    manualFiltering?: boolean;
}

export function DataTable<TData, TParams extends PaginationParams = PaginationParams>({
    columns,
    useQueryHook,
    initialParams,
    toolbar: ToolbarComponent,
    emptyIcon = <Package className="h-10 w-10 text-muted-foreground/70" />,
    emptyTitle = "No data found",
    emptyDescription = "There is no data available at the moment.",
    noResultsIcon = <Package className="h-10 w-10 text-muted-foreground/70" />,
    noResultsTitle = "No matching results",
    noResultsDescription = "No items match your current search or filters.",
    globalFilterFn,
    onCreateItem,
    manualPagination = true,
    manualSorting = true,
    manualFiltering = true, // ⚠️ Changed from false to true for server-side filtering
}: DataTableProps<TData, TParams>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]); // ⚠️ Moved up
    const [globalFilter, setGlobalFilter] = React.useState<string>(""); // ⚠️ Moved up
    const [columnVisibility] = React.useState<VisibilityState>({});

    // Build server sort params from TanStack sorting state
    const sortParams = React.useMemo(() => {
        if (!manualSorting) return undefined;
        if (!sorting || sorting.length === 0) return undefined;
        return sorting.map((s) => `${s.id},${s.desc ? "desc" : "asc"}`);
    }, [sorting, manualSorting]);

    // ⚠️ New: Build server filter params from TanStack columnFilters state
    const filterParams = React.useMemo(() => {
        if (!manualFiltering || columnFilters.length === 0) return undefined;

        const params: Record<string, string> = {};
        columnFilters.forEach((filter) => {
            // TanStack filters are usually arrays when using multi-select/faceted filters
            const value = Array.isArray(filter.value)
                ? (filter.value as string[]).map((v) => String(v)).join(',') // e.g., ['Admin', 'Viewer'] -> 'Admin,Viewer'
                : String(filter.value);

            // Use the column ID as the filter key
            params[filter.id] = value;
        });

        return params;
    }, [columnFilters, manualFiltering]);

    const {
        pagination,
        setPagination,
        tableData,
        totalElements,
        isLoading,
        isFetching,
        error,
        refetch
    } = useDataTable<TData, TParams>(
        useQueryHook,
        initialParams,
        // ⚠️ Updated: Pass filterParams along with sortParams
        {
            sort: sortParams,
            search: globalFilter,
            ...filterParams
        } as unknown as Partial<TParams>
    );

    // Removed redeclarations of columnFilters and globalFilter
    //    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    //    const [globalFilter, setGlobalFilter] = React.useState<string>("");
    //    const [columnVisibility] = React.useState<VisibilityState>({});

    React.useEffect(() => {
        if (sorting.length > 0 || columnFilters.length > 0 || globalFilter) {
            setPagination(prev => ({ ...prev, pageIndex: 0 }));
        }
    }, [sorting, columnFilters, globalFilter, setPagination]);

    return (
        <GenericDataTable
            data={tableData}
            columns={columns}
            toolbar={
                <ToolbarComponent
                    table={{
                        getState: () => ({
                            sorting,
                            columnFilters,
                            globalFilter,
                            columnVisibility,
                            pagination: { pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }
                        }),
                        setGlobalFilter,
                        resetColumnFilters: () => setColumnFilters([]),
                        getColumn: () => undefined, // Will be set by GenericDataTable
                    } as unknown as Table<TData>}
                    onCreateItem={onCreateItem}
                />
            }
            isLoading={isLoading}
            isFetching={isFetching}
            error={error}
            refetch={refetch}
            totalElements={totalElements}
            emptyIcon={emptyIcon}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            noResultsIcon={noResultsIcon}
            noResultsTitle={noResultsTitle}
            noResultsDescription={noResultsDescription}
            globalFilterFn={globalFilterFn}
            manualPagination={manualPagination}
            manualSorting={manualSorting}
            manualFiltering={manualFiltering}
            controlledSorting={sorting}
            onSortingChange={setSorting}
            controlledPagination={{ pageIndex: pagination.pageIndex, pageSize: pagination.pageSize }}
            onPaginationChange={(updater) => setPagination(updater)}
            controlledColumnFilters={columnFilters}
            onColumnFiltersChange={setColumnFilters}
            controlledGlobalFilter={globalFilter}
            onGlobalFilterChange={setGlobalFilter}
        />
    );
}