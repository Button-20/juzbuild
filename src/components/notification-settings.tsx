"use client";

import { useState, useEffect } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Bell,
  Mail,
  Smartphone,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface NotificationPreferences {
  email: {
    newLeads: boolean;
    propertyInquiries: boolean;
    billingUpdates: boolean;
    systemAlerts: boolean;
    weeklyReports: boolean;
  };
  push: {
    newLeads: boolean;
    propertyInquiries: boolean;
    systemAlerts: boolean;
    urgentNotifications: boolean;
  };
  frequency: {
    emailDigest: "immediate" | "daily" | "weekly" | "never";
    leadNotifications: "immediate" | "hourly" | "daily";
  };
}

const defaultPreferences: NotificationPreferences = {
  email: {
    newLeads: true,
    propertyInquiries: true,
    billingUpdates: true,
    systemAlerts: true,
    weeklyReports: false,
  },
  push: {
    newLeads: true,
    propertyInquiries: true,
    systemAlerts: false,
    urgentNotifications: true,
  },
  frequency: {
    emailDigest: "daily",
    leadNotifications: "immediate",
  },
};

export function NotificationSettings() {
  const [preferences, setPreferences] =
    useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences");
      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({ ...defaultPreferences, ...data.preferences });
        }
      }
    } catch (error) {
      console.error("Failed to load notification preferences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ preferences }),
      });

      if (response.ok) {
        toast.success("Notification preferences saved");
      } else {
        throw new Error("Failed to save preferences");
      }
    } catch (error) {
      toast.error("Failed to save notification preferences");
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateEmailPreference = (
    key: keyof NotificationPreferences["email"],
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      email: { ...prev.email, [key]: value },
    }));
  };

  const updatePushPreference = (
    key: keyof NotificationPreferences["push"],
    value: boolean
  ) => {
    setPreferences((prev) => ({
      ...prev,
      push: { ...prev.push, [key]: value },
    }));
  };

  const updateFrequencyPreference = (
    key: keyof NotificationPreferences["frequency"],
    value: string
  ) => {
    setPreferences((prev) => ({
      ...prev,
      frequency: { ...prev.frequency, [key]: value as any },
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading preferences...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Mail className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Email Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-leads" className="text-sm font-medium">
                New Leads
              </Label>
              <p className="text-xs text-muted-foreground">
                Get notified when someone submits a contact form
              </p>
            </div>
            <Switch
              id="email-leads"
              checked={preferences.email.newLeads}
              onCheckedChange={(value) =>
                updateEmailPreference("newLeads", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-inquiries" className="text-sm font-medium">
                Property Inquiries
              </Label>
              <p className="text-xs text-muted-foreground">
                Notifications for property-specific inquiries
              </p>
            </div>
            <Switch
              id="email-inquiries"
              checked={preferences.email.propertyInquiries}
              onCheckedChange={(value) =>
                updateEmailPreference("propertyInquiries", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-billing" className="text-sm font-medium">
                Billing Updates
              </Label>
              <p className="text-xs text-muted-foreground">
                Payment confirmations, invoice reminders
              </p>
            </div>
            <Switch
              id="email-billing"
              checked={preferences.email.billingUpdates}
              onCheckedChange={(value) =>
                updateEmailPreference("billingUpdates", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-system" className="text-sm font-medium">
                System Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Important system updates and maintenance
              </p>
            </div>
            <Switch
              id="email-system"
              checked={preferences.email.systemAlerts}
              onCheckedChange={(value) =>
                updateEmailPreference("systemAlerts", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-reports" className="text-sm font-medium">
                Weekly Reports
              </Label>
              <p className="text-xs text-muted-foreground">
                Analytics and performance summaries
              </p>
            </div>
            <Switch
              id="email-reports"
              checked={preferences.email.weeklyReports}
              onCheckedChange={(value) =>
                updateEmailPreference("weeklyReports", value)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Push Notifications */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Smartphone className="h-5 w-5 text-green-600" />
          <h3 className="text-lg font-semibold">Push Notifications</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-leads" className="text-sm font-medium">
                New Leads
              </Label>
              <p className="text-xs text-muted-foreground">
                Instant notifications for new leads
              </p>
            </div>
            <Switch
              id="push-leads"
              checked={preferences.push.newLeads}
              onCheckedChange={(value) =>
                updatePushPreference("newLeads", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-inquiries" className="text-sm font-medium">
                Property Inquiries
              </Label>
              <p className="text-xs text-muted-foreground">
                Real-time property inquiry notifications
              </p>
            </div>
            <Switch
              id="push-inquiries"
              checked={preferences.push.propertyInquiries}
              onCheckedChange={(value) =>
                updatePushPreference("propertyInquiries", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-system" className="text-sm font-medium">
                System Alerts
              </Label>
              <p className="text-xs text-muted-foreground">
                Critical system notifications
              </p>
            </div>
            <Switch
              id="push-system"
              checked={preferences.push.systemAlerts}
              onCheckedChange={(value) =>
                updatePushPreference("systemAlerts", value)
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="push-urgent" className="text-sm font-medium">
                Urgent Notifications
              </Label>
              <p className="text-xs text-muted-foreground">
                High-priority alerts only
              </p>
            </div>
            <Switch
              id="push-urgent"
              checked={preferences.push.urgentNotifications}
              onCheckedChange={(value) =>
                updatePushPreference("urgentNotifications", value)
              }
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Frequency Settings */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Bell className="h-5 w-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Notification Frequency</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Email Digest</Label>
              <p className="text-xs text-muted-foreground">
                How often to receive email summaries
              </p>
            </div>
            <select
              className="px-3 py-2 text-sm border rounded-md bg-background"
              value={preferences.frequency.emailDigest}
              onChange={(e) =>
                updateFrequencyPreference("emailDigest", e.target.value)
              }
            >
              <option value="immediate">Immediate</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="never">Never</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm font-medium">Lead Notifications</Label>
              <p className="text-xs text-muted-foreground">
                Frequency for lead-related alerts
              </p>
            </div>
            <select
              className="px-3 py-2 text-sm border rounded-md bg-background"
              value={preferences.frequency.leadNotifications}
              onChange={(e) =>
                updateFrequencyPreference("leadNotifications", e.target.value)
              }
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily Summary</option>
            </select>
          </div>
        </div>
      </div>

      <Separator />

      {/* Save Button */}
      <div className="flex items-center justify-between pt-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-4 w-4" />
          <span>Changes are saved automatically when you toggle settings</span>
        </div>
        <Button
          onClick={savePreferences}
          disabled={isSaving}
          className="min-w-[120px]"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Saving...
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
