
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DashboardStats } from "@/types/dashboard";

interface RecentDonationsProps {
    recentActivity: DashboardStats["recentActivity"];
}

export function RecentDonations({ recentActivity }: RecentDonationsProps) {
    return (
        <Card className="col-span-1">
            <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
                <CardDescription>
                    You made {recentActivity.recentDonations.length} sales this month. (Placeholder text)
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-8">
                    {recentActivity.recentDonations.map((donation) => (
                        <div key={donation.id} className="flex items-center">
                            <Avatar className="h-9 w-9">
                                <AvatarImage src="/avatars/01.png" alt="Avatar" />
                                <AvatarFallback>
                                    {donation.donor.first_name[0]}
                                    {donation.donor.last_name[0]}
                                </AvatarFallback>
                            </Avatar>
                            <div className="ml-4 space-y-1">
                                <p className="text-sm font-medium leading-none">
                                    {donation.donor.first_name} {donation.donor.last_name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    {donation.donor.email}
                                </p>
                            </div>
                            <div className="ml-auto font-medium">
                                +{new Intl.NumberFormat("en-US", {
                                    style: "currency",
                                    currency: donation.currency || "USD",
                                }).format(donation.amount)}
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
