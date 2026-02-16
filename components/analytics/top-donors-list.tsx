"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useTopDonors } from "@/lib/query/hooks/use-analytics";
import { AnalyticsFilters } from "@/lib/api/analytics";
import { Skeleton } from "@/components/ui/skeleton";

interface TopDonorsListProps {
    filters: AnalyticsFilters;
}

export function TopDonorsList({ filters }: TopDonorsListProps) {
    const { data: donors, isLoading } = useTopDonors(filters);

    if (isLoading) {
        return (
            <Card className="lg:col-span-2 shadow-sm border-slate-200/60 h-[420px] flex flex-col">
                <CardHeader className="flex-none">
                    <CardTitle className="text-lg">Top Benefactors</CardTitle>
                    <CardDescription>Highest contributors in the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 space-y-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-[200px]" />
                                    <Skeleton className="h-3 w-[150px]" />
                                </div>
                            </div>
                            <Skeleton className="h-4 w-[100px]" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        )
    }

    return (
        // Added flex flex-col and h-[420px] to constrain the card
        <Card className="lg:col-span-2 shadow-sm border-slate-200/60 flex flex-col h-[420px]">
            <CardHeader className="flex-none pb-4 border-b border-slate-50 mb-4">
                <CardTitle className="text-lg">Top Benefactors</CardTitle>
                <CardDescription>Highest contributors in the selected period.</CardDescription>
            </CardHeader>

            {/* Added flex-1 and overflow-y-auto for internal scrolling */}
            <CardContent className="flex-1 overflow-y-auto pr-4 space-y-5 pb-6 custom-scrollbar">
                {donors?.map((donor, i) => (
                    <div key={i} className="flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 border border-slate-100">
                                <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold">
                                    {donor.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-semibold text-slate-900 group-hover:text-emerald-600 transition-colors">
                                    {donor.name}
                                </p>
                                <p className="text-xs text-slate-500">{donor.email}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                                GHS {donor.totalAmount.toLocaleString()}
                            </p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter mt-0.5">
                                {donor.donationCount} Donations
                            </p>
                        </div>
                    </div>
                ))}
                {!donors?.length && (
                    <div className="text-center py-8 text-slate-500">No donors found for this period.</div>
                )}

                {donors && donors.length > 0 && (
                    <div className="pt-2">
                        <Button variant="ghost" className="w-full text-slate-500 text-sm hover:bg-slate-50 hover:text-emerald-600">
                            View Full Leaderboard
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}