"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SidebarInset } from "@/components/ui/sidebar";
import UserAvatar from "@/components/ui/user-avatar";
import { useAuth } from "@/contexts/AuthContext";
import { titlecase } from "@/utils/helpers";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
        <div className="max-w-6xl mx-auto space-y-8 p-6">
          {/* Header with Background */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 border border-primary/20">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))]" />

            {/* Back Button */}
            <div className="absolute top-6 left-6 z-10">
              <Link href="/app/dashboard">
                <Button
                  variant="secondary"
                  size="sm"
                  className="bg-background/80 backdrop-blur-sm hover:bg-background/90 border border-border/50 shadow-lg"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>

            {/* Profile Header Content */}
            <div className="relative text-center px-6 py-16 md:py-20">
              <div className="mb-8 relative">
                <div className="absolute inset-0 rounded-full bg-primary/20 blur-3xl scale-150 opacity-30" />
                <UserAvatar
                  size="xl"
                  showUpload
                  className="mx-auto ring-4 ring-background/50 shadow-2xl relative z-10 backdrop-blur-sm"
                />
              </div>

              <div className="space-y-4 max-w-2xl mx-auto">
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground/70 bg-clip-text text-transparent">
                  {user.fullName}
                </h1>
                <p className="text-lg text-muted-foreground/80 font-medium">
                  {user.email}
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-primary/15 text-primary text-sm font-semibold border border-primary/30 backdrop-blur-sm shadow-lg">
                    <div className="w-2 h-2 bg-primary rounded-full mr-3 animate-pulse" />
                    {titlecase(user.selectedPlan)} Plan
                  </div>
                  <div className="inline-flex items-center px-6 py-3 rounded-full bg-background/60 text-foreground text-sm font-semibold border border-border/50 backdrop-blur-sm shadow-lg">
                    <div className="w-2 h-2 bg-accent rounded-full mr-3" />
                    {user.companyName}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Account Information */}
            <Card className="lg:col-span-2 border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
              <CardHeader className="pb-8 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Save className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold">
                      Account Information
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Your personal and business details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="group">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Full Name
                      </Label>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 transition-all duration-200 hover:border-accent/50 hover:shadow-md">
                        <p className="font-semibold text-foreground">
                          {user.fullName}
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Company
                      </Label>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 transition-all duration-200 hover:border-accent/50 hover:shadow-md">
                        <p className="font-semibold text-foreground">
                          {user.companyName}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="group">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Email Address
                      </Label>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 border border-accent/30 transition-all duration-200 hover:border-accent/50 hover:shadow-md">
                        <p className="font-semibold text-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="group">
                      <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
                        Current Plan
                      </Label>
                      <div className="p-4 rounded-xl bg-gradient-to-r from-primary/15 to-primary/5 border border-primary/30 transition-all duration-200 hover:border-primary/50 hover:shadow-md">
                        <p className="font-semibold text-primary">
                          {titlecase(user.selectedPlan)} Plan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-8" />

                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    disabled
                    className="flex-1 h-12 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Edit Account
                  </Button>
                  <Button
                    variant="outline"
                    disabled
                    className="flex-1 h-12 border-2 hover:bg-accent/50 shadow-lg"
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions & Settings */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6 bg-gradient-to-r from-accent/5 to-primary/5 rounded-t-lg border-b border-border/50">
                  <CardTitle className="text-lg font-bold">
                    Quick Stats
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Your account overview
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/20">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Account Status
                      </p>
                      <p className="text-lg font-bold text-green-600">Active</p>
                    </div>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Plan Type
                      </p>
                      <p className="text-lg font-bold text-blue-600">
                        {titlecase(user.selectedPlan)}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  </div>
                </CardContent>
              </Card>

              {/* Settings */}
              <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
                <CardHeader className="pb-6 bg-gradient-to-r from-primary/5 to-accent/5 rounded-t-lg border-b border-border/50">
                  <CardTitle className="text-lg font-bold">Settings</CardTitle>
                  <CardDescription className="text-sm">
                    Manage your preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  <div className="group p-4 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5 hover:border-accent/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">
                          Email Notifications
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Website and account updates
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-xs"
                      >
                        Configure
                      </Button>
                    </div>
                  </div>

                  <div className="group p-4 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5 hover:border-accent/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">Security</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Password & 2FA settings
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-xs"
                      >
                        Manage
                      </Button>
                    </div>
                  </div>

                  <div className="group p-4 rounded-xl border border-accent/30 bg-gradient-to-r from-accent/10 to-accent/5 hover:border-accent/50 hover:shadow-md transition-all duration-200">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm">API Access</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Integration settings
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled
                        className="text-xs"
                      >
                        View Keys
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
