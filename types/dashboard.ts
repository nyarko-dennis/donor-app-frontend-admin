
import { DonationResponseDto } from "./donations"

export interface DashboardSummary {
    totalDonations: number
    totalDonors: number
    activeCampaigns: number
    averageDonation: number
}

export interface ChartDataPoint {
    date: string
    amount: number
}

export interface DashboardCharts {
    donationTrends: ChartDataPoint[]
    donationsByCampaign: Array<{ label: string; value: number }>
    donorsByConstituency: Array<{ label: string; value: number }>
    paymentMethods: Array<{ label: string; value: number }>
}

export interface DashboardStats {
    summary: DashboardSummary
    charts: DashboardCharts
    recentActivity: {
        recentDonations: DonationResponseDto[]
    }
}
