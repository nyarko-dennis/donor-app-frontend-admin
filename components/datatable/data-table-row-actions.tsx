import { Row } from "@tanstack/react-table"
import { MoreVertical } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import React from "react";

// Define a type for menu actions to make it flexible
export type RowMenuItem<T> = {
    label: string
    onClick: (row: T) => void
    icon?: React.ReactNode
    shortcut?: string
    variant?: "default" | "destructive"
}

// Define a type for submenu actions
export type RowMenuSubItem<T> = {
    label: string
    items: {
        label: string
        value: string
        onClick?: (row: T, value: string) => void
    }[]
    currentValue?: string
    onChange?: (row: T, value: string) => void
}

interface DataTableRowActionsProps<TData> {
    row: Row<TData>
    primaryActions?: RowMenuItem<TData>[]
    secondaryActions?: RowMenuItem<TData>[]
    subMenus?: RowMenuSubItem<TData>[]
}

export function DataTableRowActions<TData>({
                                               row,
                                               primaryActions = [],
                                               secondaryActions = [],
                                               subMenus = []
                                           }: DataTableRowActionsProps<TData>) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="data-[state=open]:bg-muted flex size-8"
                    size="icon"
                >
                    <MoreVertical className="size-4" />
                    <span className="sr-only">Open menu</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[160px]">
                {/* Primary actions at the top */}
                {primaryActions.map((action, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={() => action.onClick(row.original)}
                        variant={action.variant}
                        className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
                    >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                        {action.shortcut && <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                ))}

                {/* Add a separator if we have both primary actions and submenus or secondary actions */}
                {primaryActions.length > 0 && (subMenus.length > 0 || secondaryActions.length > 0) && (
                    <DropdownMenuSeparator />
                )}

                {/* Render any submenus */}
                {subMenus.map((submenu, index) => (
                    <DropdownMenuSub key={index}>
                        <DropdownMenuSubTrigger>{submenu.label}</DropdownMenuSubTrigger>
                        <DropdownMenuSubContent>
                            <DropdownMenuRadioGroup value={submenu.currentValue}>
                                {submenu.items.map((item, itemIndex) => (
                                    <DropdownMenuRadioItem
                                        key={itemIndex}
                                        value={item.value}
                                        onClick={() => {
                                            if (item.onClick) {
                                                item.onClick(row.original, item.value);
                                            } else if (submenu.onChange) {
                                                submenu.onChange(row.original, item.value);
                                            }
                                        }}
                                    >
                                        {item.label}
                                    </DropdownMenuRadioItem>
                                ))}
                            </DropdownMenuRadioGroup>
                        </DropdownMenuSubContent>
                    </DropdownMenuSub>
                ))}

                {/* Add a separator before secondary actions if we have any */}
                {secondaryActions.length > 0 && (subMenus.length > 0 || primaryActions.length > 0) && (
                    <DropdownMenuSeparator />
                )}

                {/* Secondary actions at the bottom (like destructive actions) */}
                {secondaryActions.map((action, index) => (
                    <DropdownMenuItem
                        key={index}
                        onClick={() => action.onClick(row.original)}
                        variant={action.variant}
                        className={action.variant === "destructive" ? "text-destructive focus:text-destructive" : ""}
                    >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                        {action.shortcut && <DropdownMenuShortcut>{action.shortcut}</DropdownMenuShortcut>}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}