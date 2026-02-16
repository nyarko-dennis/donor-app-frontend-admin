import { useApiQuery } from "@/lib/query/base/use-api-query";
import {
    ANALYTICS_ENDPOINTS,
    AnalyticsFilters,
    AnalyticsOverview,
    CampaignPerformance,
    DonationTrend,
    GeoDistribution,
    RetentionStats,
    TopDonor
} from "@/lib/api/analytics";

// Helper to filter out undefined params
const cleanParams = (filters: AnalyticsFilters) => {
    return Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== undefined && v !== '' && v !== 'all-campaigns')
    );
};

export const useAnalyticsOverview = (filters: AnalyticsFilters) => {
    return useApiQuery<AnalyticsOverview>({
        queryKey: ['analytics', 'overview', filters],
        url: ANALYTICS_ENDPOINTS.OVERVIEW,
        params: cleanParams(filters),
    });
};

export const useDonationTrends = (filters: AnalyticsFilters) => {
    return useApiQuery<DonationTrend[]>({
        queryKey: ['analytics', 'trends', filters],
        url: ANALYTICS_ENDPOINTS.DONATION_TRENDS,
        params: cleanParams(filters),
    });
};

export const useTopDonors = (filters: AnalyticsFilters) => {
    return useApiQuery<TopDonor[]>({
        queryKey: ['analytics', 'top-donors', filters],
        url: ANALYTICS_ENDPOINTS.TOP_DONORS,
        params: cleanParams(filters),
    });
};

export const useCampaignPerformance = (filters: AnalyticsFilters) => {
    return useApiQuery<CampaignPerformance[]>({
        queryKey: ['analytics', 'campaign-performance', filters],
        url: ANALYTICS_ENDPOINTS.CAMPAIGN_PERFORMANCE,
        params: cleanParams(filters),
    });
};

export const useGeoDistribution = (filters: AnalyticsFilters) => {
    return useApiQuery<GeoDistribution[]>({
        queryKey: ['analytics', 'geo-distribution', filters],
        url: ANALYTICS_ENDPOINTS.GEO_DISTRIBUTION,
        params: cleanParams(filters),
    });
};

export const useRetentionStats = (filters: AnalyticsFilters) => {
    return useApiQuery<RetentionStats>({
        queryKey: ['analytics', 'retention', filters],
        url: ANALYTICS_ENDPOINTS.RETENTION,
        params: cleanParams(filters),
    });
};
