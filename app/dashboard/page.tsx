
"use client"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { ChartBarInteractive } from "@/components/chart-bar-interactive"
import { ChartPieInteractive } from "@/components/chart-pie-interactive"
import { DashboardTable } from "@/components/dashboard/dashboard-table"
import { SectionCards } from "@/components/section-cards"
import { useDashboardStats } from "@/lib/query/hooks/useDashboardStats"
import { Spinner } from "@/components/ui/spinner"

export default function Page() {
  const { data: stats, isLoading, isError } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center p-8">
        <Spinner />
      </div>
    )
  }

  // Fallback for initial development before backend is ready, or if error
  const displayedStats = stats || {
    summary: {
      totalDonations: 0,
      totalDonors: 0,
      activeCampaigns: 0,
      averageDonation: 0
    },
    charts: {
      donationTrends: [],
      donationsByCampaign: [],
      donorsByConstituency: [],
      paymentMethods: []
    },
    recentActivity: {
      recentDonations: []
    }
  };

  return (
    <>
      <SectionCards summary={displayedStats.summary} />
      <div className="px-4 lg:px-6 space-y-4">
        <ChartAreaInteractive data={displayedStats.charts.donationTrends} />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <ChartBarInteractive data={displayedStats.charts.donationsByCampaign} />
          </div>
          <div className="col-span-3">
            <ChartPieInteractive data={displayedStats.charts.donorsByConstituency} />
          </div>
        </div>
      </div>
      <DashboardTable data={displayedStats.recentActivity.recentDonations} />
    </>
  )
}
