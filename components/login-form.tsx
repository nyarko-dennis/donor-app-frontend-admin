"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { toast } from "sonner"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
  code: z.string().optional(),
})

type FormData = z.infer<typeof loginSchema>

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"
  const [isLoading, setIsLoading] = useState(false)
  const [showTwoFactor, setShowTwoFactor] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      code: "",
    },
  })

  // Watch values to persist them
  const email = watch("email")

  const onSubmit = async (data: FormData) => {
    setIsLoading(true)
    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
        code: data.code, // will be empty string initially
      })



      if (result?.error) {
        if (result.error === "2FA_REQUIRED") {
          setShowTwoFactor(true)
          toast.message("Two-factor authentication required", {
            description: "Please enter the code from your authenticator app."
          })
          setIsLoading(false)
          return
        }

        toast.error("Invalid credentials")
        setIsLoading(false)
        return
      }

      toast.success("Logged in successfully")
      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      toast.error("Something went wrong")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-2xl font-bold">
              {showTwoFactor ? "Two-Factor Authentication" : "Login to your account"}
            </h1>
            <p className="text-muted-foreground text-sm text-balance">
              {showTwoFactor
                ? "Enter the 6-digit code from your authenticator app."
                : "Enter your email below to login to your account"}
            </p>
          </div>

          <div className="grid gap-6">
            {!showTwoFactor ? (
              <>
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
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <Link
                      href="/forgot-password"
                      className="ml-auto text-sm underline-offset-4 hover:underline"
                    >
                      Forgot your password?
                    </Link>
                  </div>
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
              </>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4">
                <InputOTP
                  maxLength={6}
                  value={watch("code")}
                  onChange={(value) => setValue("code", value)}
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
                {/* Hidden inputs to keep form data valid for submission */}
                <input type="hidden" {...register("email")} />
                <input type="hidden" {...register("password")} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Spinner className="mr-2" />}
              {isLoading ? "Verifying..." : (showTwoFactor ? "Verify" : "Login")}
            </Button>

            {showTwoFactor && (
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setShowTwoFactor(false)}
                disabled={isLoading}
              >
                Back to Login
              </Button>
            )}
          </div>


        </div>
      </form>
    </div>
  )
}
