"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import axios from "axios"
import AuthPageWrapper from "@/components/auth-page-wrapper"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type FormData = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const onSubmit = async (data: FormData) => {
        if (!token) {
            toast.error("Invalid or missing token")
            return
        }

        setIsLoading(true)
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            await axios.post(`${backendUrl}/auth/reset-password`, {
                token,
                newPassword: data.password
            });

            setIsSuccess(true)
            toast.success("Password reset successfully")
            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (error) {
            console.error(error)
            toast.error("Failed to reset password. The link may have expired.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <AuthPageWrapper title="Password Reset" description="Your password has been successfully updated.">
                <div className="flex flex-col gap-4">
                    <p className="text-center text-sm">Redirecting to login...</p>
                    <Button asChild className="w-full">
                        <Link href="/login">Go to Login</Link>
                    </Button>
                </div>
            </AuthPageWrapper>
        )
    }

    return (
        <AuthPageWrapper title="Reset Password" description="Enter your new password below.">
            {!token ? (
                <div className="text-center text-red-500">
                    Invalid request. Token is missing.
                </div>
            ) : (
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid gap-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">New Password</Label>
                            <Input
                                id="password"
                                type="password"
                                required
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-red-500 text-xs">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                required
                                {...register("confirmPassword")}
                            />
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageWrapper>
    )
}
