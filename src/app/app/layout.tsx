import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { WebsiteProvider } from "@/contexts/website-context";
import React from "react";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <WebsiteProvider>
      <SidebarProvider>
        <AppSidebar variant="inset" />
        {children}
      </SidebarProvider>
    </WebsiteProvider>
  );
}
