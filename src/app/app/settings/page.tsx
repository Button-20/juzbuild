"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { AccountUpgrade } from "@/components/account-upgrade";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Settings, CreditCard, User, Bell } from "lucide-react";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col p-4 lg:p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Settings className="h-6 w-6" />
                Settings
              </h1>
              <p className="text-muted-foreground">
                Manage your account settings and subscription
              </p>
            </div>

            <Separator />

            {/* Settings Grid */}
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Account Upgrade Card */}
              <div className="lg:col-span-2">
                <AccountUpgrade />
              </div>

              {/* Profile Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Profile Settings
                  </CardTitle>
                  <CardDescription>
                    Update your personal information and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Profile settings coming soon...
                  </p>
                </CardContent>
              </Card>

              {/* Billing & Payments */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Billing & Payments
                  </CardTitle>
                  <CardDescription>
                    Manage your payment methods and billing history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Payment settings coming soon...
                  </p>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>
                    Configure your notification preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Notification settings coming soon...
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
