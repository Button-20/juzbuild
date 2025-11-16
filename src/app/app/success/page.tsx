"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ExternalLink, Settings, BarChart3 } from "lucide-react";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const domainName = searchParams.get("domainName");
  const websiteName = searchParams.get("websiteName");
  const websiteUrl = searchParams.get("websiteUrl");

  const handleViewWebsite = () => {
    if (websiteUrl) {
      window.open(websiteUrl, "_blank");
    } else if (domainName) {
      window.open(`https://${domainName}`, "_blank");
    }
  };

  const handleGoToDashboard = () => {
    router.push("/app/dashboard");
  };

  const handleManageWebsite = () => {
    router.push("/app/dashboard");
  };

  return (
    <ProtectedRoute>
      <SidebarInset>
      <SiteHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-4xl font-bold text-foreground mb-4">
              🎉 Your Website is Live!
            </h1>
            <p className="text-xl text-muted-foreground mb-2">
              Congratulations! {websiteName || "Your website"} has been
              successfully deployed.
            </p>
            {domainName && (
              <p className="text-lg text-primary font-medium">{domainName}</p>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <ExternalLink className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">View Your Website</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Check out your new website and see how it looks to visitors.
                </p>
                <Button
                  onClick={handleViewWebsite}
                  className="w-full"
                  disabled={!websiteUrl && !domainName}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Visit Website
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Settings className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Manage Your Website</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Add properties, customize settings, and manage your content.
                </p>
                <Button
                  variant="outline"
                  onClick={handleManageWebsite}
                  className="w-full"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                What's Next?
              </h3>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🏠</span>
                  </div>
                  <h4 className="font-medium mb-2">Add Properties</h4>
                  <p className="text-sm text-muted-foreground">
                    Start adding your property listings to showcase to potential
                    clients.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h4 className="font-medium mb-2">Customize Design</h4>
                  <p className="text-sm text-muted-foreground">
                    Personalize your website's appearance and branding to match
                    your style.
                  </p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h4 className="font-medium mb-2">Track Performance</h4>
                  <p className="text-sm text-muted-foreground">
                    Monitor your website's performance and lead generation
                    analytics.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center">
            <Button onClick={handleGoToDashboard} size="lg">
              Get Started with Your Dashboard
            </Button>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}

export default function AppSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">Loading success page...</p>
          </div>
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
