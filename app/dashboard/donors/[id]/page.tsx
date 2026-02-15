"use client"

import { useParams, useRouter } from "next/navigation"
import { useDonor } from "@/lib/query/hooks/useDonors"
import { DonorDetails } from "@/components/donors/donor-details"
import { Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DonorViewPage() {
    const params = useParams()
    const router = useRouter()
    const id = params.id as string

    const { data: donor, isLoading, error } = useDonor(id)

    if (isLoading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (error || !donor) {
        return (
            <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4">
                <p className="text-muted-foreground">Failed to load donor details.</p>
                <Button variant="outline" onClick={() => router.push("/dashboard/donors")}>
                    Go Back
                </Button>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => router.push("/dashboard/donors")}>
                    <ArrowLeft className="h-4 w-4" />
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Donor Details</h1>
            </div>

            <DonorDetails donor={donor} />
        </div>
    )
}
