"use client"

import * as React from "react"
import {
  IconDashboard,
  IconMap,
  IconMapPin,
  IconSpeakerphone,
  IconUsers,
  IconCoin,
  IconHeart,
  IconUserCircle,
  IconSettings,
  IconFileExport,
  IconChartBar,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useSession } from "next-auth/react"
import { useCurrentRole } from "@/hooks/useCurrentRole"
import { Permission } from "@/lib/rbac"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import Link from "next/link"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const { can } = useCurrentRole()
  const user = session?.user

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: IconChartBar,
    },
    {
      title: "Constituencies",
      url: "/dashboard/constituencies",
      icon: IconMap,
    },
    {
      title: "Sub-Constituencies",
      url: "/dashboard/sub-constituencies",
      icon: IconMapPin,
    },
    {
      title: "Users",
      url: "/dashboard/users",
      icon: IconUsers,
      requiredPermission: Permission.MANAGE_USERS,
    },
    {
      title: "Campaigns",
      url: "/dashboard/campaigns",
      icon: IconSpeakerphone,
    },
    {
      title: "Donations",
      url: "/dashboard/donations",
      icon: IconCoin,
    },
    {
      title: "Donation Causes",
      url: "/dashboard/donation-causes",
      icon: IconHeart,
    },
    {
      title: "Donors",
      url: "/dashboard/donors",
      icon: IconUserCircle,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: IconSettings,
    },
    {
      title: "Data Exports",
      url: "/dashboard/exports",
      icon: IconFileExport,
    },
  ]



  // Filter nav items based on the user's role permissions
  const filteredNav = navMain.filter(
    (item) => !item.requiredPermission || can(item.requiredPermission)
  )

  const userData = {
    name: user?.name || "User",
    email: user?.email || "",
    avatar: user?.image || "", // user.image comes from next-auth session usually
  }

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/dashboard">
                <Image
                  src="/images/gis_logo.png"
                  alt="GIS Logo"
                  width={120}
                  height={40}
                  className="h-8 w-auto"
                />
                <span className="text-base font-semibold">GIS</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={filteredNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
