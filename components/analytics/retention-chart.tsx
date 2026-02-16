"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { PieChart as PieChartIcon } from "lucide-react";
import { useRetentionStats } from "@/lib/query/hooks/use-analytics";
import { AnalyticsFilters } from "@/lib/api/analytics";

interface RetentionChartProps {
    filters: AnalyticsFilters;
}

export function RetentionChart({ filters }: RetentionChartProps) {
    const { data: stats, isLoading } = useRetentionStats(filters);

    const data = [
        { name: 'Returning', value: stats?.returningDonors || 0, color: '#10b981' },
        { name: 'New', value: stats?.oneTimeDonors || 0, color: '#34d399' },
    ];

    const total = (stats?.returningDonors || 0) + (stats?.oneTimeDonors || 0);
    const retentionRate = total > 0 ? Math.round(((stats?.returningDonors || 0) / total) * 100) : 0;

    if (isLoading) {
        return (
            <Card className="shadow-sm border-emerald-800 bg-emerald-900 text-white h-[420px] flex items-center justify-center">
                <div className="text-emerald-200">Loading retention data...</div>
            </Card>
        )
    }

    return (
        // Matched height to TopDonorsList
        <Card className="shadow-sm border-emerald-800 bg-emerald-900 text-white flex flex-col h-[420px]">
            <CardHeader className="flex-none pb-2">
                <CardTitle className="text-lg text-emerald-50 flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Donor Retention
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between space-y-0">
                <div className="py-2 flex justify-center relative flex-1 min-h-0">
                    <div className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="70%"
                                    outerRadius="90%"
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ color: '#000', fontWeight: 'bold' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    {/* Centered Percentage fixed */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="text-3xl font-bold text-white">{retentionRate}%</span>
                        <span className="text-[10px] text-emerald-300 uppercase tracking-widest mt-1">Retained</span>
                    </div>
                </div>

                <div className="space-y-4 pt-4 mt-auto">
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-200 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#10b981]" /> Returning Donors
                            </span>
                            <span className="font-semibold">{stats?.returningDonors || 0}</span>
                        </div>
                        <Separator className="bg-emerald-800/50" />
                        <div className="flex justify-between items-center text-sm">
                            <span className="text-emerald-200 flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#34d399]" /> New Donors
                            </span>
                            <span className="font-semibold">{stats?.oneTimeDonors || 0}</span>
                        </div>
                    </div>
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-semibold border-none shadow-none">
                        View Retention Cohorts
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}