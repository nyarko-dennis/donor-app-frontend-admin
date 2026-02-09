
import { Metadata } from "next"
import { ProfileDetails } from "@/components/settings/profile-details"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
    title: "Settings",
    description: "Manage your account settings",
}

export default function SettingsPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
            <Tabs defaultValue="profile" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                </TabsList>
                <TabsContent value="profile" className="space-y-4">
                    <ProfileDetails />
                </TabsContent>
                <TabsContent value="security" className="space-y-4">
                    <ChangePasswordForm />
                </TabsContent>
            </Tabs>
        </div>
    )
}
