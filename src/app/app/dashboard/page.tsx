"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { ComprehensiveAnalytics } from "@/components/comprehensive-analytics";
import WaitingList from "@/components/marketing/waiting-list";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { isLive } from "@/constants";

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
            <ComprehensiveAnalytics />
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
