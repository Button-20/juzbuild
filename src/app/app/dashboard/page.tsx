"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import WaitingList from "@/components/marketing/waiting-list";
import { SectionCards } from "@/components/section-cards";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { isLive } from "@/constants";

import data from "./data.json";

export default function Page() {
  // Redirect to waitlist if app is not live
  if (!isLive) {
    return <WaitingList />;
  }
  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
