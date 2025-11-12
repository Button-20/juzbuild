"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

export function NavAds({
  items,
  title = "Advertising",
}: {
  items: {
    name: string;
    url: string;
    icon: LucideIcon;
  }[];
  title?: string;
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => {
          const isActive =
            pathname === item.url || pathname.startsWith(item.url);

          return (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton asChild isActive={isActive} disabled>
                <div className="flex items-center justify-between gap-2 cursor-not-allowed opacity-75">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <item.icon className="h-4 w-4 flex-shrink-0" />
                    <span className="truncate text-sm">{item.name}</span>
                  </div>
                  <Badge
                    variant="secondary"
                    className="flex-shrink-0 text-xs whitespace-nowrap"
                  >
                    Coming Soon
                  </Badge>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
