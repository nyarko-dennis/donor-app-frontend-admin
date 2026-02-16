"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useGeoDistribution } from "@/lib/query/hooks/use-analytics";
import { AnalyticsFilters } from "@/lib/api/analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface GeoDistributionChartProps {
    filters: AnalyticsFilters;
}

export function GeoDistributionChart({ filters }: GeoDistributionChartProps) {
    const { data: geoData, isLoading } = useGeoDistribution(filters);

    // Process data to merge Sub-Constituency for unique segments
    const chartData = useMemo(() => {
        if (!geoData) return [];

        return geoData.map(item => {
            const isUnknownSub = !item.subConstituency || item.subConstituency === "Unknown";
            // If subConstituency is Unknown, just use the parent name. Otherwise, combine them.
            const label = isUnknownSub
                ? item.constituency
                : `${item.constituency} (${item.subConstituency})`;

            return {
                ...item,
                segmentLabel: label
            };
        }).sort((a, b) => b.totalAmount - a.totalAmount).slice(0, 10); // Keep top 10 to avoid crowding
    }, [geoData]);

    if (isLoading) {
        return (
            <Card className="shadow-sm border-slate-200/60 h-[420px] flex flex-col">
                <CardHeader>
                    <CardTitle>Geographic Breakdown</CardTitle>
                    <CardDescription>Top performing donor segments</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <Skeleton className="h-[250px] w-full" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-slate-200/60 h-[420px] flex flex-col">
            <CardHeader className="flex-none pb-2">
                <CardTitle>Geographic Breakdown</CardTitle>
                <CardDescription>Top performing donor segments</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-0 pt-4">
                <div className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 50 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                            <XAxis
                                dataKey="segmentLabel"
                                tick={{ fontSize: 11, fill: "#64748b" }}
                                interval={0}
                                angle={-45}
                                textAnchor="end"
                                height={70}
                                // Truncate long labels like "Students (Lower Secondary)" on the axis so they fit
                                tickFormatter={(val) => val.length > 18 ? val.substring(0, 16) + '...' : val}
                            />

                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                width={65} // Fixed width to prevent chart jumping
                                tickFormatter={(val) => {
                                    if (val >= 1000000) return `GH₵${(val / 1000000).toFixed(1)}M`;
                                    if (val >= 1000) return `GH₵${(val / 1000).toFixed(0)}k`;
                                    return `GH₵${val}`;
                                }}
                            />

                            <Tooltip
                                cursor={{ fill: '#f8fafc' }}
                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                                formatter={(value: number) => [`GHS ${value.toLocaleString()}`, 'Total Amount']}
                                // Show the full un-truncated name in the tooltip on hover
                                labelFormatter={(label) => <span className="font-semibold text-slate-800">{label}</span>}
                            />

                            <Bar dataKey="totalAmount" radius={[4, 4, 0, 0]} barSize={32}>
                                {chartData.map((entry, index) => (
                                    // Make the #1 performing segment solid emerald, and the rest a slightly softer emerald
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#34d399'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}