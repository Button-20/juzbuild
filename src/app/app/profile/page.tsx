"use client";

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
    <div className="max-w-4xl mx-auto space-y-8 my-5">
      {/* Header */}
      <div className="relative">
        <div className="absolute top-0 left-0">
          <Link href="/app/dashboard">
            <Button variant="ghost" size="sm" className="hover:bg-accent/50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        <div className="text-center pt-16 pb-8">
          <div className="mb-6 relative">
            <UserAvatar
              size="xl"
              showUpload
              className="mx-auto ring-4 ring-background shadow-2xl"
            />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-2">
            {user.fullName}
          </h1>
          <p className="text-md text-muted-foreground mb-4">{user.email}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20">
              {titlecase(user.selectedPlan) } Plan
            </div>
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent/50 text-accent-foreground text-sm font-medium">
              {user.companyName}
            </div>
          </div>
        </div>
      </div>

      <Separator className="my-8" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">Account Information</CardTitle>
            <CardDescription>
              View your account details and business information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="space-y-3">
                <Label
                  htmlFor="fullName"
                  className="text-sm font-semibold text-foreground/80"
                >
                  Full Name
                </Label>
                <div className="p-3 rounded-lg bg-accent/30 border border-accent/50">
                  <p className="text-sm font-medium">{user.fullName}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="email"
                  className="text-sm font-semibold text-foreground/80"
                >
                  Email Address
                </Label>
                <div className="p-3 rounded-lg bg-accent/30 border border-accent/50">
                  <p className="text-sm font-medium">{user.email}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="company"
                  className="text-sm font-semibold text-foreground/80"
                >
                  Company
                </Label>
                <div className="p-3 rounded-lg bg-accent/30 border border-accent/50">
                  <p className="text-sm font-medium">{user.companyName}</p>
                </div>
              </div>
              <div className="space-y-3">
                <Label
                  htmlFor="plan"
                  className="text-sm font-semibold text-foreground/80"
                >
                  Current Plan
                </Label>
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-sm font-medium text-primary capitalize">
                    {user.selectedPlan} Plan
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <Button disabled className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Edit Account
              </Button>
              <Button variant="outline" disabled className="w-full">
                Change Password
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Additional Settings */}
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-6">
            <CardTitle className="text-xl">Preferences & Settings</CardTitle>
            <CardDescription>
              Additional settings and preferences for your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-accent/50 bg-accent/20 gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">Email Notifications</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Receive updates about your website and account
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="sm:ml-4 w-full sm:w-auto"
                >
                  Configure
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-accent/50 bg-accent/20 gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">Security Settings</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage password and two-factor authentication
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="sm:ml-4 w-full sm:w-auto"
                >
                  Manage
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-lg border border-accent/50 bg-accent/20 gap-3">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold">API Access</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    Manage API keys and integration settings
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  className="sm:ml-4 w-full sm:w-auto"
                >
                  View Keys
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
