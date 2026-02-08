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
import { Spinner } from "@/components/ui/spinner"

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email"),
})

type FormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormData>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: FormData) => {
        setIsLoading(true)
        try {
            const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            await axios.post(`${backendUrl}/auth/forgot-password`, {
                email: data.email
            });

            // We always show success even if email doesn't exist for security
            setIsSubmitted(true)
            toast.success("Password reset email sent")
        } catch (error) {
            // Only show error if it's a network error or something unexpected
            console.error(error)
            toast.error("Failed to send request. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (isSubmitted) {
        return (
            <AuthPageWrapper title="Check your email" description="If an account exists, we've sent you a password reset link.">
                <div className="flex flex-col gap-4">
                    <Button asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </AuthPageWrapper>
        )
    }

    return (
        <AuthPageWrapper title="Forgot Password" description="Enter your email to receive a password reset link.">
            <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            {...register("email")}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-xs">{errors.email.message}</p>
                        )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading && <Spinner className="mr-2" />}
                        {isLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                    <Button variant="ghost" asChild className="w-full">
                        <Link href="/login">Back to Login</Link>
                    </Button>
                </div>
            </form>
        </AuthPageWrapper>
    )
}
