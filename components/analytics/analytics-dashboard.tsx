"use client";

import React, { useState } from "react";
import {
    TrendingUp,
    Users,
    DollarSign,
    CreditCard
} from "lucide-react";

import { useAnalyticsOverview } from "@/lib/query/hooks/use-analytics";
import { AnalyticsFilters } from "@/lib/api/analytics";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { KPICard } from "@/components/analytics/kpi-card";
import { AnalyticsToolbar } from "@/components/analytics/analytics-toolbar";
import { DonationTrendsChart } from "@/components/analytics/donation-trends-chart";
import { TopDonorsList } from "@/components/analytics/top-donors-list";
import { RetentionChart } from "@/components/analytics/retention-chart";
import { CampaignPerformanceChart } from "@/components/analytics/campaign-performance-chart";
import { GeoDistributionChart } from "@/components/analytics/geo-distribution-chart";

export default function AnalyticsDashboard() {
    const [filters, setFilters] = useState<AnalyticsFilters>({
        // Default to last 30 days or similar could be set here, 
        // but AnalyticsToolbar handles initial state well too if passed.
        // Let's default to nothing implies "All Time" or backend default.
        // Ideally, we want a default range. 
        // Let's rely on the user picking or the toolbar setting a default if needed.
    });

    const { data: overview, isLoading: isOverviewLoading } = useAnalyticsOverview(filters);

    // Helper to calculate mock trend for now as API might not return it yet
    // If API returns explicit trends, we use them. 
    // For now, we'll just display the values.

    return (
        <div className="min-h-screen bg-slate-50/50 p-6 lg:p-10 space-y-8">

            <div className="max-w-7xl mx-auto">
                <AnalyticsToolbar
                    filters={filters}
                    onFilterChange={setFilters}
                />

                <Tabs defaultValue="performance" className="space-y-8">
                    <TabsList className="bg-white border border-slate-200 p-0 h-10 rounded-lg">
                        <TabsTrigger
                            value="performance"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-md px-4 h-8 my-1 ml-1"
                        >
                            Performance
                        </TabsTrigger>
                        <TabsTrigger
                            value="distribution"
                            className="data-[state=active]:bg-emerald-50 data-[state=active]:text-emerald-700 data-[state=active]:shadow-none rounded-md px-4 h-8 my-1 mr-1"
                        >
                            Distribution & Campaigns
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="performance" className="space-y-8 outline-none">
                        {/* Row 1: Key Performance Indicators */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                            <KPICard
                                title="Total Revenue"
                                value={isOverviewLoading ? "..." : `GHS ${overview?.totalRevenue.toLocaleString() ?? '0'}`}
                                trend="+12.5%"
                                icon={DollarSign}
                            />
                            <KPICard
                                title="Donations"
                                value={isOverviewLoading ? "..." : overview?.totalDonations.toLocaleString() ?? '0'}
                                trend="+8.2%"
                                icon={CreditCard}
                            />
                            <KPICard
                                title="Avg. Donation"
                                value={isOverviewLoading ? "..." : `GHS ${overview?.averageDonation.toLocaleString() ?? '0'}`}
                                trend="-2.1%"
                                icon={TrendingUp}
                            />
                            <KPICard
                                title="Active Donors"
                                value={isOverviewLoading ? "..." : overview?.totalDonors.toLocaleString() ?? '0'}
                                trend="+18.4%"
                                icon={Users}
                            />
                        </div>

                        {/* Row 2: Main Chart */}
                        <DonationTrendsChart filters={filters} />

                        {/* Row 3: Split Grid */}
                        <div className="grid gap-8 lg:grid-cols-3">
                            <TopDonorsList filters={filters} />
                            <RetentionChart filters={filters} />
                        </div>
                    </TabsContent>

                    <TabsContent value="distribution" className="space-y-8 outline-none">
                        <div className="grid gap-8 md:grid-cols-2">
                            <CampaignPerformanceChart filters={filters} />
                            <GeoDistributionChart filters={filters} />
                        </div>
                    </TabsContent>
                </Tabs>


            </div>
        </div>
    );
}
