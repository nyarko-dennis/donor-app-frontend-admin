import { axiosInstance } from "@/lib/api/apiClient";
import { toast } from "sonner";

export interface ExportFilters {
    [key: string]: any;
}

export const triggerExport = async (
    entity: 'donations' | 'donors' | 'campaigns',
    format: 'csv' | 'xlsx',
    filters: ExportFilters
) => {
    try {
        const processedFilters = Object.entries(filters).reduce((acc, [key, value]) => {
            acc[key] = Array.isArray(value) ? value.join(',') : value;
            return acc;
        }, {} as Record<string, any>);

        const response = await axiosInstance.post(
            '/exports',
            {
                entity,
                format,
                filters: processedFilters,
            },
            {
                responseType: 'blob', // IMPORTANT: This tells axios to treat the response as binary data
            }
        );

        // Create a Blob from the Stream
        const file = new Blob([response.data], {
            type: format === 'xlsx'
                ? 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                : 'text/csv'
        });

        // Build a URL from the file
        const fileURL = URL.createObjectURL(file);

        // Create a temporary anchor tag to trigger download
        const fileLink = document.createElement('a');
        fileLink.href = fileURL;

        // Suggest a filename
        const extension = format;
        fileLink.download = `${entity}_export_${new Date().toISOString()}.${extension}`;

        document.body.appendChild(fileLink);
        fileLink.click();

        // Cleanup
        document.body.removeChild(fileLink);
        URL.revokeObjectURL(fileURL);

        toast.success(`Export started for ${entity}`);
    } catch (error) {
        console.error('Export failed:', error);
        toast.error("Failed to export data. Please try again.");
    }
};
