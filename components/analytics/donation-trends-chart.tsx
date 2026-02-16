"use client";

import {
    Area,
    AreaChart,
    CartesianGrid,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useDonationTrends } from "@/lib/query/hooks/use-analytics";
import { AnalyticsFilters } from "@/lib/api/analytics";

interface DonationTrendsChartProps {
    filters: AnalyticsFilters;
}

export function DonationTrendsChart({ filters }: DonationTrendsChartProps) {
    const { data: trendData, isLoading } = useDonationTrends(filters);

    if (isLoading) {
        return (
            <Card className="shadow-sm border-slate-200/60 h-[450px] flex items-center justify-center">
                <div className="text-slate-400">Loading chart data...</div>
            </Card>
        );
    }

    return (
        <Card className="shadow-sm border-slate-200/60 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between bg-white border-b border-slate-50 py-6">
                <div>
                    <CardTitle className="text-lg font-semibold">Donation Trends</CardTitle>
                    <CardDescription>Daily contribution volume over time</CardDescription>
                </div>
                <Badge variant="outline" className="text-emerald-600 border-emerald-100 bg-emerald-50">
                    Live
                </Badge>
            </CardHeader>
            <CardContent className="pt-8 px-2">
                <div className="h-[350px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trendData || []}>
                            <defs>
                                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                            <XAxis
                                dataKey="date"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                dy={10}
                                tickFormatter={(value) => new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fontSize: 12, fill: "#64748b" }}
                                width={80} // Give it fixed space so it doesn't jump
                                tickFormatter={(value) => {
                                    if (value >= 1000000) return `GH₵${(value / 1000000).toFixed(1)}M`;
                                    if (value >= 1000) return `GH₵${(value / 1000).toFixed(0)}k`;
                                    return `GH₵${value}`;
                                }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: "12px",
                                    border: "none",
                                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1)",
                                }}
                                formatter={(value: number) => [`GHS ${value.toLocaleString()}`, "Amount"]}
                                labelFormatter={(label) => new Date(label).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            />
                            <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#10b981"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorAmount)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
