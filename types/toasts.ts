import React from "react";

export type ApiToastOptions = {
    title?: React.ReactNode;
    description?: React.ReactNode;
    action?: {
        label: string;
        onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
    };
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center'; // Use the string literal union directly
    duration?: number;
    icon?: React.ReactNode;
};