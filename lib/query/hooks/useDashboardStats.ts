
import { useApiQuery } from "@/lib/query/base/use-api-query";
import { API_ENDPOINTS } from "@/lib/api/endpoints";
import { DashboardStats } from "@/types/dashboard";

export const useDashboardStats = () => {
    return useApiQuery<DashboardStats>({
        queryKey: ["dashboard-stats"],
        url: API_ENDPOINTS.dashboard.getStats,
        retry: 1,
    });
};
