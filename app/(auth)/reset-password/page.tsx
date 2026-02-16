"use client"

import { Suspense, useState } from "react"
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
import { Spinner } from "@/components/ui/spinner"
import { Eye, EyeOff } from "lucide-react"

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

type FormData = z.infer<typeof resetPasswordSchema>

function ResetPasswordForm() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    required
                                    {...register("password")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.password && (
                                <p className="text-red-500 text-xs">{errors.password.message}</p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    required
                                    {...register("confirmPassword")}
                                />
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <Eye className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </Button>
                            </div>
                            {errors.confirmPassword && (
                                <p className="text-red-500 text-xs">{errors.confirmPassword.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Spinner className="mr-2" />}
                            {isLoading ? "Resetting..." : "Reset Password"}
                        </Button>
                    </div>
                </form>
            )}
        </AuthPageWrapper>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={
            <AuthPageWrapper title="Reset Password" description="Loading...">
                <div className="flex justify-center p-8">
                    <Spinner />
                </div>
            </AuthPageWrapper>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
