"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import axios from "axios"
import AuthPageWrapper from "@/components/auth-page-wrapper"
import { Button } from "@/components/ui/button"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

export default function Setup2faPage() {
    const { data: session, status } = useSession()
    const router = useRouter()

    const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
    const [code, setCode] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (status === "unauthenticated") {
            router.push("/login")
        }

        if (session?.accessToken && !qrCodeUrl) {
            fetchQrCode()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status])

    const fetchQrCode = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const response = await axios.get(`${backendUrl}/auth/2fa/generate`, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            });
            setQrCodeUrl(response.data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to generate QR code");
        }
    }

    const onEnable = async () => {
        if (code.length < 6) return;
        setIsLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            await axios.post(`${backendUrl}/auth/2fa/turn-on`, {
                code
            }, {
                headers: {
                    Authorization: `Bearer ${session?.accessToken}`
                }
            });

            toast.success("2FA enabled successfully");
            router.push("/dashboard");
        } catch (error) {
            console.error(error);
            toast.error("Invalid code or failed to enable 2FA");
        } finally {
            setIsLoading(false);
        }
    }

    if (status === "loading" || !qrCodeUrl) {
        return (
            <AuthPageWrapper title="Setup 2FA" description="Loading...">
                <div className="flex justify-center p-8">
                    <Spinner className="h-8 w-8" />
                </div>
            </AuthPageWrapper>
        )
    }

    return (
        <AuthPageWrapper title="Setup 2FA" description="Scan the QR code with your authenticator app.">
            <div className="flex flex-col items-center gap-6">
                <div className="border p-2 rounded-lg bg-white">
                    <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
                </div>

                <div className="w-full space-y-2">
                    <Label htmlFor="code" className="text-center block">Enter 6-digit code</Label>
                    <div className="flex justify-center">
                        <InputOTP
                            maxLength={6}
                            value={code}
                            onChange={setCode}
                        >
                            <InputOTPGroup>
                                <InputOTPSlot index={0} />
                                <InputOTPSlot index={1} />
                                <InputOTPSlot index={2} />
                                <InputOTPSlot index={3} />
                                <InputOTPSlot index={4} />
                                <InputOTPSlot index={5} />
                            </InputOTPGroup>
                        </InputOTP>
                    </div>
                </div>

                <Button onClick={onEnable} className="w-full" disabled={isLoading || code.length < 6}>
                    {isLoading && <Spinner className="mr-2" />}
                    {isLoading ? "Enabling..." : "Enable 2FA"}
                </Button>

                <Button variant="ghost" onClick={() => router.push("/dashboard")} className="w-full">
                    Skip for now
                </Button>
            </div>
        </AuthPageWrapper>
    )
}
