"use client"

import * as React from "react"
import {
  IconDashboard,
  IconInnerShadowTop,
  IconMap,
  IconMapPin,
  IconSpeakerphone,
  IconUsers,
  IconCoin,
  IconHeart,
  IconUserCircle,
} from "@tabler/icons-react"

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import { useSession } from "next-auth/react"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession()
  const user = session?.user

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: IconDashboard,
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
  ]

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
              <a href="#">
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">Acme Inc.</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
