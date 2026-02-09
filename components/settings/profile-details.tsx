
"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function ProfileDetails() {
    const { data: session } = useSession()

    // Helper to get initials
    const getInitials = (name?: string | null) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                    <Avatar className="h-20 w-20">
                        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || "User"} />
                        <AvatarFallback className="text-xl">{getInitials(session?.user?.name)}</AvatarFallback>
                    </Avatar>
                    <div className="space-y-1">
                        <h3 className="font-medium text-lg">{session?.user?.name}</h3>
                        <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
                        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary text-primary-foreground hover:bg-primary/80">
                            {session?.user?.role}
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input value={session?.user?.name || ""} disabled readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input value={session?.user?.email || ""} disabled readOnly />
                    </div>
                    <div className="space-y-2">
                        <Label>Role</Label>
                        <Input value={session?.user?.role || ""} disabled readOnly />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
