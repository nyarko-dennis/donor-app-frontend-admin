"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useCreateUserMutation, useUpdateUserMutation } from "@/lib/query/mutations/useUserMutations"
import { UserFormValues, userSchema } from "@/schemas/users"
import { UserResponseDto, UserRole } from "@/types/users"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Field,
    FieldLabel,
    FieldContent,
    FieldError,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"

interface UserDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    user: UserResponseDto | null
}

export function UserDialog({
    open,
    onOpenChange,
    user,
}: Readonly<UserDialogProps>) {
    const createMutation = useCreateUserMutation()
    const updateMutation = useUpdateUserMutation()
    const isEditing = !!user

    const {
        register,
        control,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<UserFormValues>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            first_name: "",
            last_name: "",
            email: "",
            password: "",
            role: UserRole.STAKEHOLDER,
        },
    })

    useEffect(() => {
        if (user) {
            reset({
                first_name: user.first_name,
                last_name: user.last_name,
                email: user.email,
                password: "", // Password is not editable
                role: user.role,
            })
        } else {
            reset({
                first_name: "",
                last_name: "",
                email: "",
                password: "",
                role: UserRole.STAKEHOLDER,
            })
        }
    }, [user, reset, open])

    const onSubmit = (values: UserFormValues) => {
        if (user) {
            // Exclude password from update
            const { password, ...updateData } = values
            updateMutation.mutate(
                { id: user.id, data: updateData },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        reset()
                    },
                }
            )
        } else {
            if (!values.password) {
                // Should be caught by schema if referenced correctly, but double check
                return
            }
            createMutation.mutate(
                { ...values, password: values.password as string },
                {
                    onSuccess: () => {
                        onOpenChange(false)
                        reset()
                    },
                }
            )
        }
    }

    const isLoading = createMutation.isPending || updateMutation.isPending

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>
                        {user ? "Edit User" : "Create User"}
                    </DialogTitle>
                    <DialogDescription>
                        {user
                            ? "Update user details."
                            : "Add a new user to the system."}
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="first_name">First Name</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="first_name"
                                    placeholder="John"
                                    {...register("first_name")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.first_name]} />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="last_name">Last Name</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="last_name"
                                    placeholder="Doe"
                                    {...register("last_name")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.last_name]} />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <FieldContent>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john.doe@example.com"
                                {...register("email")}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.email]} />
                    </Field>

                    {!isEditing && (
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <FieldContent>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="******"
                                    {...register("password")}
                                />
                            </FieldContent>
                            <FieldError errors={[errors.password]} />
                        </Field>
                    )}

                    <Field>
                        <FieldLabel htmlFor="role">Role</FieldLabel>
                        <FieldContent>
                            <Controller
                                control={control}
                                name="role"
                                render={({ field }) => (
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <SelectTrigger id="role">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {Object.values(UserRole).map((role) => (
                                                <SelectItem key={role} value={role}>
                                                    {role.replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </FieldContent>
                        <FieldError errors={[errors.role]} />
                    </Field>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Spinner className="mr-2" />}
                            {isLoading ? "Saving..." : "Save"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
