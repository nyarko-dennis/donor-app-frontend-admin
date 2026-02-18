export interface AnalyticsOverview {
    totalRevenue: number;
    totalDonations: number;
    averageDonation: number;
    totalDonors: number;
}

export interface DonationTrend {
    date: string; // YYYY-MM-DD
    amount: number;
}

export interface TopDonor {
    id: string;
    name: string;
    email: string;
    totalAmount: number;
    donationCount: number;
}

export interface CampaignPerformance {
    campaign: string;
    totalRaised: number;
    donationCount: number;
}

export interface GeoDistribution {
    constituency: string;
    subConstituency: string;
    totalAmount: number;
    donationCount: number;
}

export interface RetentionStats {
    oneTimeDonors: number;
    returningDonors: number; // 2+ donations
    totalActiveDonors: number;
}

export interface AnalyticsFilters {
    startDate?: string;
    endDate?: string;
    campaignId?: string | string[];
    constituencyId?: string | string[];
}

export const ANALYTICS_ENDPOINTS = {
    OVERVIEW: '/analytics/overview',
    DONATION_TRENDS: '/analytics/donations-over-time',
    TOP_DONORS: '/analytics/top-donors',
    CAMPAIGN_PERFORMANCE: '/analytics/campaign-performance',
    GEO_DISTRIBUTION: '/analytics/geo-distribution',
    RETENTION: '/analytics/retention',
};
