"use client";

import {
  ArrowUpCircleIcon,
  BarChartIcon,
  ClipboardListIcon,
  FileTextIcon,
  FolderIcon,
  GlobeIcon,
  HelpCircleIcon,
  InfoIcon,
  LayoutDashboardIcon,
  ScrollTextIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TagIcon,
  UsersIcon,
} from "lucide-react";
import * as React from "react";

import { NavBlog } from "@/components/nav-documents";
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
      title: "Domain",
      url: "/app/domain",
      icon: GlobeIcon,
    },
    {
      title: "Leads",
      url: "/app/leads",
      icon: UsersIcon,
    },
    {
      title: "Analytics",
      url: "/app/analytics",
      icon: BarChartIcon,
    },
    {
      title: "Properties",
      url: "/app/properties",
      icon: FolderIcon,
    },
    {
      title: "Property Types",
      url: "/app/property-types",
      icon: TagIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/app/settings",
      icon: SettingsIcon,
    },
    {
      title: "Profile",
      url: "/app/profile",
      icon: UsersIcon,
    },
    {
      title: "Get Help",
      url: "/app/help",
      icon: HelpCircleIcon,
    },
  ],
  blog: [
    {
      name: "Posts",
      url: "/app/blog/posts",
      icon: FileTextIcon,
    },
    {
      name: "Authors",
      url: "/app/blog/authors",
      icon: UsersIcon,
    },
  ],
  content: [
    {
      name: "About Page",
      url: "/app/about",
      icon: InfoIcon,
    },
    {
      name: "Testimonials",
      url: "/app/testimonials",
      icon: ClipboardListIcon,
    },
    {
      name: "FAQs",
      url: "/app/faqs",
      icon: HelpCircleIcon,
    },
  ],
  legal: [
    {
      name: "Privacy Policy",
      url: "/app/privacy-policy",
      icon: ShieldCheckIcon,
    },
    {
      name: "Terms of Service",
      url: "/app/terms-of-service",
      icon: ScrollTextIcon,
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
        <NavBlog items={data.content} title="Content" />
        <NavBlog items={data.blog} title="Blog" />
        <NavBlog items={data.legal} title="Legal" />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
