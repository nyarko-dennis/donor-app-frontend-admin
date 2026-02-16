import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface KPICardProps {
    title: string;
    value: string | number;
    trend?: string; // e.g., "+12.5%"
    icon: LucideIcon;
    trendLabel?: string; // e.g., "vs last month"
}

export function KPICard({ title, value, trend, icon: Icon, trendLabel }: KPICardProps) {
    const isPositive = trend?.startsWith('+');

    return (
        <Card className="shadow-sm border-slate-200/60 bg-white group hover:border-emerald-200 transition-all">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="p-2 bg-slate-50 group-hover:bg-emerald-50 rounded-lg transition-colors">
                        <Icon className="h-5 w-5 text-slate-400 group-hover:text-emerald-600" />
                    </div>
                    {trend && (
                        <Badge variant="secondary" className={cn(
                            "text-[10px] font-bold",
                            isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                        )}>
                            {trend}
                        </Badge>
                    )}
                </div>
                <div className="space-y-1">
                    <p className="text-sm font-medium text-slate-500">{title}</p>
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    {trendLabel && <p className="text-xs text-slate-400">{trendLabel}</p>}
                </div>
            </CardContent>
        </Card>
    );
}
