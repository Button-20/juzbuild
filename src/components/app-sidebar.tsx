"use client";

import {
  ArrowUpCircleIcon,
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  FileCodeIcon,
  FileIcon,
  FolderIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { NavDocuments } from "@/components/nav-documents";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/app/dashboard",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Properties",
      url: "/app/properties",
      icon: FolderIcon,
    },
    {
      title: "Analytics",
      url: "/app/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Leads",
      url: "/app/leads",
      icon: UsersIcon,
    },
    {
      title: "Website",
      url: "/app/website",
      icon: FileCodeIcon,
    },
  ],
  navSecondary: [
    {
      title: "Profile",
      url: "/app/profile",
      icon: UsersIcon,
    },
    {
      title: "Settings",
      url: "/app/settings",
      icon: SettingsIcon,
    },
    {
      title: "Get Help",
      url: "/app/help",
      icon: HelpCircleIcon,
    },
  ],
  documents: [
    {
      name: "Property Library",
      url: "/app/library",
      icon: DatabaseIcon,
    },
    {
      name: "Reports",
      url: "/app/reports",
      icon: ClipboardListIcon,
    },
    {
      name: "Templates",
      url: "/app/templates",
      icon: FileIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/app/dashboard">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">Juzbuild</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
