import { Suspense } from "react";
import AnalyticsDashboard from "@/components/analytics/analytics-dashboard";

export default function AnalyticsPage() {
    return (
        <Suspense fallback={<div>Loading Analytics...</div>}>
            <AnalyticsDashboard />
        </Suspense>
    );
}
