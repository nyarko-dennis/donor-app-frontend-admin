"use client"

import { DonorResponseDto } from "@/types/donors"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Wallet, CreditCard, Calendar, Mail, Phone, MapPin, Building, User, Landmark } from "lucide-react"

interface DonorDetailsProps {
    donor: DonorResponseDto
}

export function DonorDetails({ donor }: DonorDetailsProps) {
    const donations = donor.donations || []

    // Stats calculation
    const totalDonated = donations.reduce((sum, d) => sum + Number(d.amount), 0)
    const totalCount = donations.length

    // Sort donations: most recent first
    const sortedDonations = [...donations].sort((a, b) => {
        const dateA = new Date(a.donation_date ?? a.created_at ?? new Date())
        const dateB = new Date(b.donation_date ?? b.created_at ?? new Date())
        return dateB.getTime() - dateA.getTime()
    })

    const getInitials = (first: string, last: string) => {
        return `${first.charAt(0)}${last.charAt(0)}`.toUpperCase()
    }

    return (
        <div className="space-y-6">
            {/* Premium Header / Banner */}
            <div className="relative overflow-hidden rounded-xl border bg-background shadow-sm">
                <div className="h-24 bg-primary/10"></div>
                <div className="px-6 pb-6">
                    <div className="relative -mt-12 flex flex-col items-center gap-4 md:flex-row md:items-end md:gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                            <AvatarImage src="" alt={`${donor.first_name} ${donor.last_name}`} />
                            <AvatarFallback className="bg-primary text-2xl font-bold text-primary-foreground">
                                {getInitials(donor.first_name, donor.last_name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 text-center md:text-left">
                            <h2 className="text-3xl font-bold tracking-tight text-foreground font-serif">
                                {donor.first_name} {donor.last_name}
                            </h2>
                            <div className="text-muted-foreground flex items-center justify-center gap-2 text-sm md:justify-start">
                                <Mail className="h-4 w-4" /> {donor.email}
                                {donor.phone && (
                                    <>
                                        <span>•</span>
                                        <Phone className="h-4 w-4" /> {donor.phone}
                                    </>
                                )}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2 min-w-[200px]">
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Joined</span>
                                <span className="font-medium text-foreground">
                                    {format(new Date(donor.created_at), "MMM yyyy")}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                <span>Status</span>
                                <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100/80">Active</Badge>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Lifetime Donated</CardTitle>
                        <Wallet className="h-4 w-4 text-primary" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-serif">GH₵ {totalDonated.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">Total across all campaigns</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Donations</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-serif">{totalCount}</div>
                        <p className="text-xs text-muted-foreground">Successful transactions</p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Last Donation</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-serif">
                            {sortedDonations.length > 0
                                ? format(new Date(sortedDonations[0].donation_date ?? sortedDonations[0].created_at!), "MMM d")
                                : "—"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {sortedDonations.length > 0 ? format(new Date(sortedDonations[0].donation_date ?? sortedDonations[0].created_at!), "yyyy") : "No donations yet"}
                        </p>
                    </CardContent>
                </Card>
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Average Gift</CardTitle>
                        <Landmark className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold font-serif">
                            GH₵ {totalCount > 0 ? Math.round(totalDonated / totalCount).toLocaleString() : "0"}
                        </div>
                        <p className="text-xs text-muted-foreground">Per transaction</p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Tabs */}
            <Tabs defaultValue="donations" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="donations">Donation History</TabsTrigger>
                    <TabsTrigger value="profile">Full Profile</TabsTrigger>
                </TabsList>

                <TabsContent value="donations" className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                            <CardDescription>A comprehensive list of all donations made by this donor.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/50 hover:bg-muted/50">
                                        <TableHead className="pl-6">Date</TableHead>
                                        <TableHead>Amount</TableHead>
                                        <TableHead>Method</TableHead>
                                        <TableHead>Cause</TableHead>
                                        <TableHead>Campaign</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {sortedDonations.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                                No donations found for this donor.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        sortedDonations.map((donation) => {
                                            const dateVal = donation.donation_date ?? donation.created_at
                                            return (
                                                <TableRow key={donation.id} className="hover:bg-muted/5">
                                                    <TableCell className="pl-6 font-medium text-muted-foreground">
                                                        {dateVal ? format(new Date(dateVal), "MMM d, yyyy") : "—"}
                                                    </TableCell>
                                                    <TableCell className="font-bold text-foreground">
                                                        GH₵ {Number(donation.amount).toLocaleString()}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="font-normal">{donation.payment_method}</Badge>
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={donation.cause?.name || donation.donation_cause}>
                                                        {donation.cause?.name || donation.donation_cause || "—"}
                                                    </TableCell>
                                                    <TableCell className="max-w-[200px] truncate" title={donation.campaign?.name}>
                                                        {donation.campaign?.name || "—"}
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="profile" className="space-y-4">
                    <Card className="shadow-sm">
                        <CardHeader>
                            <CardTitle>Contact & Constituency Information</CardTitle>
                            <CardDescription>Detailed profile information for this donor.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Contact Details</h4>
                                <div className="grid gap-4 rounded-lg border p-4 bg-muted/20">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                                            <User className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Full Name</p>
                                            <p className="text-sm text-muted-foreground">{donor.first_name} {donor.last_name}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                                            <Mail className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Email Address</p>
                                            <p className="text-sm text-muted-foreground">{donor.email}</p>
                                        </div>
                                    </div>
                                    <Separator />
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                                            <Phone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Phone Number</p>
                                            <p className="text-sm text-muted-foreground">{donor.phone || "Not provided"}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Group Affiliation</h4>
                                <div className="grid gap-4 rounded-lg border p-4 bg-muted/20 h-full content-start">
                                    <div className="flex items-center gap-4">
                                        <div className="rounded-full bg-primary/10 p-2 text-primary">
                                            <Building className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">Constituency</p>
                                            <p className="text-sm text-muted-foreground">{donor.constituency}</p>
                                        </div>
                                    </div>
                                    {donor.sub_constituency && (
                                        <>
                                            <Separator />
                                            <div className="flex items-center gap-4">
                                                <div className="rounded-full bg-primary/10 p-2 text-primary">
                                                    <MapPin className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Sub-Constituency</p>
                                                    <p className="text-sm text-muted-foreground">{donor.sub_constituency}</p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
