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
import { Settings, CreditCard, Bell } from "lucide-react";
import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { getPlanById } from "@/constants/pricing";
import { NotificationSettings } from "@/components/notification-settings";

export default function SettingsPage() {
  const searchParams = useSearchParams();

  // Handle success/error messages from payment flow
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    const canceled = searchParams.get("canceled");
    const status = searchParams.get("status");
    const planId = searchParams.get("plan");

    if (success === "upgrade" && planId) {
      const plan = getPlanById(planId);
      toast.success(`Successfully upgraded to ${plan?.name || planId} plan!`, {
        description: "Your new features are now available.",
        duration: 5000,
      });
    } else if (error) {
      switch (error) {
        case "missing_session":
        case "invalid_session":
          toast.error("Payment verification failed", {
            description:
              "Please try again or contact support if the issue persists.",
          });
          break;
        case "processing_failed":
          toast.error("Payment processing error", {
            description:
              "There was an issue processing your payment. Please check your billing portal.",
          });
          break;
        default:
          toast.error("Payment error", {
            description: "An unexpected error occurred. Please try again.",
          });
      }
    } else if (canceled === "true") {
      toast.info("Payment canceled", {
        description: "Your upgrade was canceled. You can try again anytime.",
      });
    } else if (status === "processing") {
      toast.info("Payment processing", {
        description:
          "Your payment is being processed. You'll receive a confirmation shortly.",
      });
    }

    // Clean up URL parameters
    if (success || error || canceled || status) {
      const url = new URL(window.location.href);
      url.searchParams.delete("success");
      url.searchParams.delete("error");
      url.searchParams.delete("canceled");
      url.searchParams.delete("status");
      url.searchParams.delete("plan");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

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
                  <div className="text-sm text-muted-foreground">
                    <p className="mb-3">
                      Access your billing portal to manage payment methods, view
                      invoices, and update billing information.
                    </p>
                    <div className="bg-gray-900 border border-gray-700 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="text-blue-400 mt-0.5">
                          <svg
                            className="h-5 w-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <div className="text-gray-100">
                          <p className="font-semibold text-white mb-1">
                            Billing Portal Access
                          </p>
                          <p className="text-sm text-gray-300 leading-relaxed">
                            Use the "Billing Portal" button in your Account Plan
                            section above to access Stripe's secure billing
                            portal for payment management.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Notifications */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Choose what notifications you want to receive and how
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <NotificationSettings />
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
