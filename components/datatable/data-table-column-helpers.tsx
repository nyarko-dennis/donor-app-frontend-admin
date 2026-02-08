"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Eye, Pencil, Trash } from "lucide-react";
import { SimpleColumnHeader } from "@/components/datatable/data-table-column-header";
import { DataTableRowActions, RowMenuItem } from "@/components/datatable/data-table-row-actions";

/**
 * Creates a standard text column with optional sorting
 */
export function createTextColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => string,
    enableSorting = true,
    className = "",
    cellRenderer?: (value: string, row: TData) => React.ReactNode
): ColumnDef<TData> {
    return {
        accessorKey: accessorFn ? undefined : id as string,
        accessorFn: accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const value = accessorFn
                ? accessorFn(row.original)
                : row.getValue(id as string) as string;

            if (cellRenderer) {
                return <>{cellRenderer(value ?? "", row.original)}</>
            }
            return <div className={className}>{value}</div>;
        },
        enableSorting,
    };
}

/**
 * Creates a column for truncated text (like descriptions)
 */
export function createTruncatedTextColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => string,
    maxWidth = "200px"
): ColumnDef<TData> {
    return {
        accessorKey: accessorFn ? undefined : id as string,
        accessorFn: accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const raw = accessorFn
                ? accessorFn(row.original)
                : (row.getValue(id as string) as string | null | undefined);
            const value = (raw ?? "").toString();
            const display = value.length > 50 ? value.slice(0, 50) + "..." : value;
            return (
                <div className={`truncate text-muted-foreground`} style={{ maxWidth }}>
                    {display || "-"}
                </div>
            );
        },
    };
}

/**
 * Creates a column for numeric values
 */
export function createNumberColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => number,
    formatter?: (value: number) => string
): ColumnDef<TData> {
    return {
        accessorKey: accessorFn ? undefined : id as string,
        accessorFn: accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const value = accessorFn
                ? accessorFn(row.original)
                : row.getValue(id as string) as number;
            return <div className="text-right font-medium">
                {formatter ? formatter(value) : value}
            </div>;
        },
    };
}

/**
 * Creates a column for date values
 */
export function createDateColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => string | Date,
    dateFormat: Intl.DateTimeFormatOptions = {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    },
    includeTime: boolean = false
): ColumnDef<TData> {
    return {
        accessorKey: accessorFn ? undefined : id as string,
        accessorFn: accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const rawValue = accessorFn
                ? accessorFn(row.original)
                : row.getValue(id as string);

            if (!rawValue) return <div>-</div>;

            // Parse the date - handle both Date objects and ISO strings
            let date: Date;
            if (rawValue instanceof Date) {
                date = rawValue;
            } else {
                const dateString = rawValue as string;
                // Only append 'Z' if the string doesn't already have timezone info
                const hasTimezone = dateString.includes('Z') || dateString.includes('+') || dateString.includes('-', 10);
                date = new Date(hasTimezone ? dateString : dateString + 'Z');
            }

            // Check if date is valid
            if (isNaN(date.getTime())) {
                console.error('Invalid date value:', rawValue);
                return <div>-</div>;
            }

            const baseOptions: Intl.DateTimeFormatOptions = { ...dateFormat };
            const options: Intl.DateTimeFormatOptions = includeTime
                ? { ...baseOptions, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }
                : baseOptions;
            const formatted = new Intl.DateTimeFormat(undefined, options).format(date);
            return <div>{formatted}</div>;
        },
    };
}

/**
 * Creates a column for boolean values with optional custom rendering
 */
export function createBooleanColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => boolean,
    renderer?: (value: boolean) => React.ReactNode
): ColumnDef<TData> {
    return {
        accessorKey: accessorFn ? undefined : id as string,
        accessorFn: accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const value = accessorFn
                ? accessorFn(row.original)
                : row.getValue(id as string) as boolean;

            if (renderer) {
                return renderer(value);
            }

            return <div>{value ? "Yes" : "No"}</div>;
        },
    };
}

/**
 * Creates a boolean badge column
 */
export function createBooleanBadgeColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => boolean,
    labels: { true?: string; false?: string } = { true: "Active", false: "Inactive" }
): ColumnDef<TData> {
    return {
        accessorKey: accessorFn ? undefined : (id as string),
        accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const value = accessorFn
                ? accessorFn(row.original)
                : Boolean(row.getValue(id as string));

            const isTrue = !!value;
            const label = isTrue ? (labels.true ?? "Yes") : (labels.false ?? "No");
            const className = isTrue
                ? "inline-flex items-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 px-2 py-0.5 text-xs font-medium"
                : "inline-flex items-center rounded-full bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 px-2 py-0.5 text-xs font-medium";

            return <span className={className}>{label}</span>;
        },
    };
}


/**
 * Creates an actions column with standard view, edit, delete actions
 */
export function createActionsColumn<TData>(
    onView?: (row: TData) => void,
    onEdit?: (row: TData) => void,
    onDelete?: (row: TData) => void,
    additionalActions?: (row: TData) => RowMenuItem<TData>[],
    labels?: { view?: string; edit?: string; delete?: string }
): ColumnDef<TData> {
    return {
        id: "actions",
        cell: ({ row }) => {
            const item = row.original;
            const primaryActions: RowMenuItem<TData>[] = [];

            const viewLabel = labels?.view ?? "View";
            const editLabel = labels?.edit ?? "Edit";
            const deleteLabel = labels?.delete ?? "Delete";

            if (onView) {
                primaryActions.push({
                    label: viewLabel,
                    onClick: () => onView(item),
                    icon: <Eye className="mr-2 h-4 w-4" />,
                });
            }

            if (onEdit) {
                primaryActions.push({
                    label: editLabel,
                    onClick: () => onEdit(item),
                    icon: <Pencil className="mr-2 h-4 w-4" />,
                });
            }

            if (onDelete) {
                primaryActions.push({
                    label: deleteLabel,
                    onClick: () => onDelete(item),
                    variant: "destructive",
                    icon: <Trash className="mr-2 h-4 w-4" />,
                });
            }

            // Add any additional actions
            if (additionalActions) {
                primaryActions.push(...additionalActions(item));
            }

            return <DataTableRowActions row={row} primaryActions={primaryActions} />;
        },
        enableHiding: false,
    };
}

/**
 * Creates an avatar column for displaying user initials
 */
export function createAvatarColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => { name: string; email?: string }[],
    maxVisible: number = 3
): ColumnDef<TData> {
    // Generate initials from name
    const getInitials = (name: string): string => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Generate a consistent color based on the name
    const getColorClass = (name: string): string => {
        const colors = [
            'bg-purple-500 text-white',
            'bg-blue-500 text-white',
            'bg-green-500 text-white',
            'bg-yellow-500 text-white',
            'bg-pink-500 text-white',
            'bg-indigo-500 text-white',
            'bg-red-500 text-white',
            'bg-teal-500 text-white',
        ];
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        return colors[hash % colors.length];
    };

    return {
        accessorKey: accessorFn ? undefined : id as string,
        accessorFn: accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const users = accessorFn
                ? accessorFn(row.original)
                : (row.getValue(id as string) as { name: string; email?: string }[] | null);

            if (!users || users.length === 0) {
                return <div className="text-muted-foreground">-</div>;
            }

            const visibleUsers = users.slice(0, maxVisible);
            const remainingCount = users.length - maxVisible;

            return (
                <div className="flex items-center -space-x-2">
                    {visibleUsers.map((user, index) => (
                        <div
                            key={index}
                            className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 text-xs font-medium ${getColorClass(user.name)}`}
                            title={user.email ? `${user.name} (${user.email})` : user.name}
                        >
                            {getInitials(user.name)}
                        </div>
                    ))}
                    {remainingCount > 0 && (
                        <div
                            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 text-xs font-medium text-gray-600 dark:text-gray-300"
                            title={`+${remainingCount} more`}
                        >
                            +{remainingCount}
                        </div>
                    )}
                </div>
            );
        },
    };
}

/**
 * Creates a status badge column
 */
export function createStatusColumn<TData>(
    id: keyof TData | string,
    header: string,
    accessorFn?: (row: TData) => string,
): ColumnDef<TData> {
    return {
        accessorKey: accessorFn ? undefined : (id as string),
        accessorFn,
        id: id as string,
        header: ({ column }) => <SimpleColumnHeader column={column} title={header} />,
        cell: ({ row }) => {
            const value = accessorFn
                ? accessorFn(row.original)
                : (row.getValue(id as string) as string);

            if (!value) return <div>-</div>;

            let colorClass = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";

            const normalizedValue = value.toLowerCase();

            if (normalizedValue === "active" || normalizedValue === "published" || normalizedValue === "completed") {
                colorClass = "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
            } else if (normalizedValue === "inactive" || normalizedValue === "archived" || normalizedValue === "cancelled") {
                colorClass = "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
            } else if (normalizedValue === "pending" || normalizedValue === "planned" || normalizedValue === "draft") {
                colorClass = "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
            }

            return (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
                    {value}
                </span>
            );
        },
    };
}