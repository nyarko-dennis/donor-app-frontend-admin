"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCampaignPerformance } from "@/lib/query/hooks/use-analytics";
import { AnalyticsFilters } from "@/lib/api/analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface CampaignPerformanceChartProps {
    filters: AnalyticsFilters;
}

export function CampaignPerformanceChart({ filters }: CampaignPerformanceChartProps) {
    const { data: performanceData, isLoading } = useCampaignPerformance(filters);

    if (isLoading) {
        return (
            <Card className="shadow-sm border-slate-200/60 h-[400px]">
                <CardHeader>
                    <CardTitle>Campaign Performance</CardTitle>
                    <CardDescription>Funds raised per campaign</CardDescription>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    // Sort by totalRaised desc
    const sortedData = [...(performanceData || [])].sort((a, b) => b.totalRaised - a.totalRaised);

    return (
        <Card className="shadow-sm border-slate-200/60">
            <CardHeader>
                <CardTitle>Campaign Performance</CardTitle>
                <CardDescription>Funds raised & donation count per campaign</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                            <XAxis type="number" hide />
                            <YAxis
                                type="category"
                                dataKey="campaign"
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                width={100}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => [`GHS ${value.toLocaleString()}`, 'Raised']}
                            />
                            <Bar dataKey="totalRaised" radius={[0, 4, 4, 0]} barSize={24}>
                                {sortedData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill="#10b981" />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
