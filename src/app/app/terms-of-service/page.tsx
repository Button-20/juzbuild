"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { RichTextEditor } from "@/components/blog/RichTextEditor";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SidebarInset } from "@/components/ui/sidebar";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function TermsOfServicePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [content, setContent] = useState("");

  useEffect(() => {
    fetchTermsOfService();
  }, []);

  const fetchTermsOfService = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/terms-of-service");
      const data = await response.json();

      if (data.success && data.content) {
        setContent(data.content);
      }
    } catch (error) {
      console.error("Error fetching terms of service:", error);
      toast.error("Failed to load terms of service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      toast.error("Terms of service content cannot be empty");
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch("/api/terms-of-service", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Terms of service updated successfully!");
      } else {
        throw new Error(data.error || "Failed to update");
      }
    } catch (error) {
      console.error("Error updating terms of service:", error);
      toast.error("Failed to update terms of service");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <SidebarInset>
          <SiteHeader />
          <div className="flex flex-1 items-center justify-center p-6">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </SidebarInset>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Terms of Service
              </h1>
              <p className="text-muted-foreground">
                Manage your website&apos;s terms of service content
              </p>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Terms of Service Content</CardTitle>
              <CardDescription>
                Edit your terms of service using the rich text editor below.
                This will be displayed on your website&apos;s terms of service
                page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Write your terms of service content here..."
                  label="Terms of Service Content"
                  disabled={isSaving}
                />

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
