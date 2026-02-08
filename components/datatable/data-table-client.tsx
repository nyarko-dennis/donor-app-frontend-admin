"use client";
import React from "react";
import { ColumnDef, FilterFn } from "@tanstack/react-table";
import { GenericDataTable, DataTableToolbarProps } from "@/components/datatable/generic-data-table";

export interface DataTableClientProps<TData> {
  columns: ColumnDef<TData>[];
  useQueryHook: () => {
    data?: TData[];
    isLoading: boolean;
    isFetching: boolean;
    error: Error | null;
    refetch?: () => void;
  };
  toolbar: React.ComponentType<DataTableToolbarProps<TData>>;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptyDescription?: string;
  noResultsIcon?: React.ReactNode;
  noResultsTitle?: string;
  noResultsDescription?: string;
  globalFilterFn?: FilterFn<TData>;
  onCreateItem?: () => void;
}

export function DataTableClient<TData>({
  columns,
  useQueryHook,
  toolbar: ToolbarComponent,
  emptyIcon,
  emptyTitle = "No data found",
  emptyDescription = "There is no data available at the moment.",
  noResultsIcon,
  noResultsTitle = "No matching results",
  noResultsDescription = "No items match your current search or filters.",
  globalFilterFn,
  onCreateItem,
}: DataTableClientProps<TData>) {
  const { data, isLoading, isFetching, error, refetch } = useQueryHook();

  return (
    <GenericDataTable
      data={data ?? []}
      columns={columns}
      toolbar={
          <ToolbarComponent
              table={undefined as unknown as DataTableToolbarProps<TData>["table"]}
              onCreateItem={onCreateItem}
          />
      }
      isLoading={isLoading}
      isFetching={isFetching}
      error={error}
      refetch={refetch}
      totalElements={data?.length ?? 0}
      emptyIcon={emptyIcon}
      emptyTitle={emptyTitle}
      emptyDescription={emptyDescription}
      noResultsIcon={noResultsIcon}
      noResultsTitle={noResultsTitle}
      noResultsDescription={noResultsDescription}
      globalFilterFn={globalFilterFn}
      manualPagination={false}
      manualSorting={false}
      manualFiltering={false}
    />
  );
}
