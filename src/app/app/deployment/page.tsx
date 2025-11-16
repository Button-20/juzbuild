"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset } from "@/components/ui/sidebar";
import { DeploymentTracker } from "@/components/deployment-tracker";
import { useJobStatus } from "@/hooks/useJobStatus";

function DeploymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isRedirectingToSuccess, setIsRedirectingToSuccess] = useState(false);

  const jobId = searchParams.get("jobId");
  const domainName = searchParams.get("domainName");
  const websiteName = searchParams.get("websiteName");

  const { status, loading, error } = useJobStatus(jobId, !!jobId);

  // Redirect to success page when deployment is complete
  useEffect(() => {
    if (status?.status === "completed" && !isRedirectingToSuccess) {
      setIsRedirectingToSuccess(true);

      const successParams = new URLSearchParams();
      if (domainName) successParams.set("domainName", domainName);
      if (websiteName) successParams.set("websiteName", websiteName);
      if (status.websiteUrl) successParams.set("websiteUrl", status.websiteUrl);

      const successUrl = `/app/success${
        successParams.toString() ? `?${successParams.toString()}` : ""
      }`;

      console.log("Deployment completed, redirecting to success:", successUrl);
      router.push(successUrl);
    }
  }, [status, domainName, websiteName, router, isRedirectingToSuccess]);

  // Redirect to dashboard if no jobId
  useEffect(() => {
    if (!jobId && !loading) {
      console.log("No jobId found, redirecting to dashboard");
      router.push("/app/dashboard");
    }
  }, [jobId, loading, router]);

  if (!jobId) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">
            No deployment job found. Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <SidebarInset>
      <SiteHeader />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Website Deployment
            </h1>
            <p className="text-muted-foreground">
              We're creating your website. This usually takes a few minutes.
            </p>
          </div>

          <DeploymentTracker
            websiteId={jobId}
            jobId={jobId}
            websiteName={websiteName || "Your Website"}
          />

          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground">
              You'll be automatically redirected when your website is ready.
            </p>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}

export default function DeploymentPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <p className="text-muted-foreground">
              Loading deployment status...
            </p>
          </div>
        </div>
      }
    >
      <DeploymentPageContent />
    </Suspense>
  );
}
