"use client";

import {
  ArrowUpCircleIcon,
  Bell,
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
import { useEffect, useState } from "react";

import { NavBlog } from "@/components/nav-documents";
import { NavAds } from "@/components/nav-ads";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
import { NavUser } from "@/components/nav-user";
import NotificationBell from "@/components/dashboard/notification-bell";
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
      title: "Notifications",
      url: "/app/notifications",
      icon: Bell,
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
  const [adsItems, setAdsItems] = useState<
    Array<{ name: string; url: string; icon: any }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSelectedAds = async () => {
      try {
        const response = await fetch("/api/auth/me");
        if (response.ok) {
          const { user } = await response.json();
          console.log("User from /api/auth/me:", user);
          console.log("adsConnections:", user?.adsConnections);

          // Get adsConnections from user profile
          const selectedAds = user?.adsConnections || [];
          console.log("Selected ads:", selectedAds);

          // Map selected ads to sidebar items with icons
          const items = selectedAds.map((platformId: string) => {
            let platformName = "";
            let icon: any = null;

            if (platformId === "facebook") {
              platformName = "Facebook Ads";
              const { Facebook } = require("lucide-react");
              icon = Facebook;
            } else if (platformId === "google") {
              platformName = "Google Ads";
              const { Search } = require("lucide-react");
              icon = Search;
            } else if (platformId === "instagram") {
              platformName = "Instagram Ads";
              const { Camera } = require("lucide-react");
              icon = Camera;
            }

            return {
              name: platformName,
              url: `/app/ads/${platformId}`,
              icon,
            };
          });

          console.log("Mapped ads items:", items);
          setAdsItems(items);
        }
      } catch (error) {
        console.error("Failed to fetch selected ads:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedAds();
  }, []);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center justify-between w-full">
              <SidebarMenuButton
                asChild
                className="data-[slot=sidebar-menu-button]:!p-1.5 flex-1"
              >
                <Link href="/app/dashboard">
                  <ArrowUpCircleIcon className="h-5 w-5" />
                  <span className="text-base font-semibold">Juzbuild</span>
                </Link>
              </SidebarMenuButton>
              <div className="pr-2">
                <NotificationBell />
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        {!isLoading && adsItems.length > 0 && (
          <NavAds items={adsItems} title="Advertising" />
        )}
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
