
import { IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { DashboardSummary } from "@/types/dashboard"

interface SectionCardsProps {
  summary: DashboardSummary
}

export function SectionCards({ summary }: SectionCardsProps) {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Breakdown</CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums @[350px]/card:text-3xl">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "GHS",
            }).format(summary.totalDonations)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +12.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Values up this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Total donations received
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Donors</CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums @[350px]/card:text-3xl">
            {summary.totalDonors}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            New donors this month <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Unique contributors
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Campaigns</CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums @[350px]/card:text-3xl">
            {summary.activeCampaigns}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Campaigns running <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Current engagement</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Avg. Donation</CardDescription>
          <CardTitle className="text-2xl font-semibold tracking-tight tabular-nums @[350px]/card:text-3xl">
            {new Intl.NumberFormat("en-US", {
              style: "currency",
              currency: "GHS",
            }).format(summary.averageDonation)}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +4.5%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Steady increase <IconTrendingUp className="size-4" />
          </div>
          <div className="text-muted-foreground">Per transaction avg</div>
        </CardFooter>
      </Card>
    </div>
  )
}
