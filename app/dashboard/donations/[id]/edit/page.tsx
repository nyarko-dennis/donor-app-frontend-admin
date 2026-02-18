"use client"

import { useParams } from "next/navigation"
import { CreateDonationWizard } from "@/components/donations/create-donation-wizard"

export default function EditDonationPage() {
    const params = useParams()
    const id = params.id as string

    return (
        <CreateDonationWizard donationId={id} />
    )
}
