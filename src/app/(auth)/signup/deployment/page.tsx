"use client";

import Container from "@/components/global/container";
import WaitingList from "@/components/marketing/waiting-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { isLive } from "@/constants";
import {
  CheckCircle,
  Clock,
  CloudUpload,
  Database,
  ExternalLink,
  Eye,
  Globe,
  RefreshCw,
  Settings,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface DeploymentStatus {
  success: boolean;
  status: "pending" | "in-progress" | "completed" | "failed";
  currentStep?: string;
  progress?: number;
  jobId?: string;
  websiteUrl?: string;
  aliasUrl?: string; // Add the alias URL property
  estimatedCompletion?: string;
  steps?: {
    name: string;
    status: "pending" | "in-progress" | "completed" | "failed";
    timestamp?: string;
  }[];
}

export default function DeploymentPage() {
  const searchParams = useSearchParams();
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus>({
    success: true,
    status: "in-progress",
    currentStep: "Initializing website creation...",
    progress: 15,
    estimatedCompletion: "5-8 minutes",
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [companyName, setCompanyName] = useState<string>("");
  const [domainName, setDomainName] = useState<string>("");
  const [isCreatingWebsite, setIsCreatingWebsite] = useState(false);
  const [creationAttempted, setCreationAttempted] = useState(false);

  // Get jobId from URL params or result data
  const jobId = searchParams.get("jobId");
  const websiteName = searchParams.get("websiteName") || "your website";
  const urlDomainName = searchParams.get("domainName");

  // Clear any stuck session locks on page load (for debugging)
  const existingLock = sessionStorage.getItem("website-creation-lock");
  if (existingLock) {
    const lockTime = parseInt(existingLock);
    const timeDiff = Date.now() - lockTime;
    if (timeDiff > 30000) {
      // Clear locks older than 30 seconds
      sessionStorage.removeItem("website-creation-lock");
    }
  }

  // Redirect to waitlist if app is not live
  if (!isLive) {
    return <WaitingList />;
  }

  // Create website if we have creation data but no jobId
  const createWebsite = async (retryCount = 0) => {
    // Prevent duplicate website creation with multiple checks
    if (isCreatingWebsite || creationAttempted) {
      return;
    }

    // Check sessionStorage for creation lock (survives page refreshes)
    const creationLock = sessionStorage.getItem("website-creation-lock");
    if (creationLock) {
      const lockTime = parseInt(creationLock);
      const timeDiff = Date.now() - lockTime;
      if (timeDiff < 60000) {
        // 1 minute lock

        return;
      } else {
        // Lock expired, remove it
        sessionStorage.removeItem("website-creation-lock");
      }
    }

    // First check if we have jobId from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlJobId = urlParams.get("jobId");
    const urlWebsiteName = urlParams.get("websiteName");
    const urlDomainName = urlParams.get("domainName");

    if (urlJobId) {
      // Update company info if provided in URL
      if (urlWebsiteName) {
        setCompanyName(decodeURIComponent(urlWebsiteName));
      }
      if (urlDomainName) {
        setDomainName(decodeURIComponent(urlDomainName));
      }

      // Store jobId for persistence and clean up creation data
      localStorage.setItem("currentJobId", urlJobId);
      localStorage.removeItem("websiteCreationData");

      // Start status polling immediately
      setDeploymentStatus((prev) => ({
        ...prev,
        currentStep: "Website creation in progress...",
        progress: 30,
        jobId: urlJobId,
        status: "in-progress",
      }));

      return;
    }

    const websiteCreationData = localStorage.getItem("websiteCreationData");

    // If we already have a jobId, don't create another website
    if (jobId) {
      return;
    }

    // Try to use stored signup data, or fallback to creating with minimal data
    let signupData;
    if (websiteCreationData) {
      signupData = JSON.parse(websiteCreationData);
    } else {
      // Fallback: check if user has an active session and needs website creation

      try {
        const userResponse = await fetch("/api/auth/me", {
          credentials: "include",
        });
        if (!userResponse.ok) {
          return;
        }
        const userData = await userResponse.json();

        // Use user data to create minimal website configuration
        signupData = {
          companyName: userData.companyName || "My Company",
          domainName: userData.domainName || "mywebsite",
          selectedTheme: "homely",
          brandColors: ["#3B82F6", "#EF4444", "#10B981", "#F3F4F6"],
          propertyTypes: ["house"],
          includedPages: ["home", "about", "contact"],
          tagline: userData.tagline || "Welcome to our website",
          aboutSection: "About our company",
          leadCaptureMethods: ["email"],
          preferredContactMethod: ["email"],
        };
      } catch (error) {
        console.error(
          "❌ Failed to get user data for fallback creation:",
          error
        );
        return;
      }
    }

    const maxRetries = 3;
    const retryDelay = 2000; // 2 seconds

    try {
      // Set multiple flags and locks to prevent duplicate calls
      setIsCreatingWebsite(true);
      setCreationAttempted(true);
      sessionStorage.setItem("website-creation-lock", Date.now().toString());

      const signupData = JSON.parse(websiteCreationData || "{}");

      setDeploymentStatus((prev) => ({
        ...prev,
        currentStep:
          retryCount > 0
            ? `Retrying website creation (${retryCount + 1}/${
                maxRetries + 1
              })...`
            : "Creating your website...",
        progress: 20,
      }));

      const websiteData = {
        companyName: signupData.companyName,
        domainName: signupData.domainName,
        selectedTheme: signupData.selectedTheme || "homely",
        brandColors: signupData.brandColors || [],
        propertyTypes: signupData.propertyTypes || [],
        includedPages: signupData.includedPages || [],
        tagline: signupData.tagline,
        aboutSection: signupData.aboutSection,
        leadCaptureMethods: signupData.leadCaptureMethods || [],
        preferredContactMethod: signupData.preferredContactMethod || [],
        geminiApiKey: signupData.geminiApiKey,
      };

      const response = await fetch("/api/websites", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify(websiteData),
      });

      if (response.ok) {
        const result = await response.json();

        // Update URL with jobId to continue tracking
        const jobId = result.website?.jobId || result.jobId;

        if (jobId) {
          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("jobId", jobId);
          newUrl.searchParams.set("websiteName", signupData.companyName);
          newUrl.searchParams.set("domainName", signupData.domainName);

          window.history.replaceState({}, "", newUrl.toString());

          // Clean up creation data since we now have a job
          localStorage.removeItem("websiteCreationData");
        } else {
          console.error("❌ No jobId received in website creation response");
        }

        setDeploymentStatus((prev) => ({
          ...prev,
          jobId: jobId,
          currentStep: "Website creation in progress...",
          progress: 30,
        }));

        // Clear all flags and locks since creation was successful
        setIsCreatingWebsite(false);
        sessionStorage.removeItem("website-creation-lock");
        // Keep creationAttempted as true to prevent further attempts
      } else if (response.status === 409) {
        // Website already exists - this is actually OK, get the existing job info
        const error = await response.json();

        if (error.existingWebsite?.jobId) {
          // Use the existing website's jobId
          const existingJobId = error.existingWebsite.jobId;

          const newUrl = new URL(window.location.href);
          newUrl.searchParams.set("jobId", existingJobId);
          newUrl.searchParams.set("websiteName", signupData.companyName);
          newUrl.searchParams.set("domainName", signupData.domainName);

          window.history.replaceState({}, "", newUrl.toString());

          setDeploymentStatus((prev) => ({
            ...prev,
            jobId: existingJobId,
            currentStep: "Resuming existing website deployment...",
            progress: 50,
            status: "in-progress", // Explicitly set status to in-progress
          }));

          // Clean up creation data
          localStorage.removeItem("websiteCreationData");
        } else {
          // If no jobId, we might need to create a new deployment job
          // For now, let's try to get user data and create a fresh deployment
        }

        // Clear the flag - we handled the conflict
        setIsCreatingWebsite(false);
        sessionStorage.removeItem("website-creation-lock");
        // Keep creationAttempted as true since we handled the existing website
      } else {
        const error = await response.json();
        console.error("Website creation failed:", error);

        // If unauthorized and we haven't exhausted retries, try again
        // But don't retry on 409 conflicts (website already exists)
        if (response.status === 401 && retryCount < maxRetries) {
          setIsCreatingWebsite(false); // Clear flag before retry
          setTimeout(() => createWebsite(retryCount + 1), retryDelay);
          return;
        }

        // Don't retry on 409 - it means website already exists
        if (response.status === 409) {
          setIsCreatingWebsite(false);
          return;
        }

        setDeploymentStatus((prev) => ({
          ...prev,
          status: "failed",
          currentStep: `Creation failed: ${error.message || "Unknown error"}`,
        }));

        // Clear the flag on failure too
        setIsCreatingWebsite(false);
      }
    } catch (error) {
      console.error("Error creating website:", error);

      // If network error and we haven't exhausted retries, try again
      if (retryCount < maxRetries) {
        setIsCreatingWebsite(false); // Clear flag before retry
        setTimeout(() => createWebsite(retryCount + 1), retryDelay);
        return;
      }

      setDeploymentStatus((prev) => ({
        ...prev,
        status: "failed",
        currentStep: "Failed to start website creation",
      }));

      // Clear the flag on error too
      setIsCreatingWebsite(false);
    }
  };

  // Check deployment status
  const checkStatus = async () => {
    if (!jobId) {
      return;
    }

    setIsChecking(true);
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      const data = await response.json();

      if (data.success) {
        // The job status is nested under data.status
        const jobStatus = data.status;
        setDeploymentStatus((prev) => ({
          ...prev,
          ...jobStatus,
          success: true,
          lastChecked: new Date().toISOString(),
        }));
      } else {
        console.error("Job status API returned error:", data);
      }
    } catch (error) {
      console.error("Failed to check status:", error);
    } finally {
      setIsChecking(false);
      setLastChecked(new Date());
    }
  };

  // Auto-refresh status every 30 seconds
  useEffect(() => {
    if (
      jobId &&
      deploymentStatus.status !== "completed" &&
      deploymentStatus.status !== "failed"
    ) {
      const interval = setInterval(checkStatus, 3000);
      return () => clearInterval(interval);
    }
  }, [jobId, deploymentStatus.status]);

  // Cleanup on component unmount - but keep creation lock for page refreshes
  useEffect(() => {
    return () => {
      // Only clear in-memory flags, keep sessionStorage lock
      setIsCreatingWebsite(false);
    };
  }, []);

  // Initial status check or website creation
  useEffect(() => {
    if (jobId) {
      checkStatus();
    } else if (!isCreatingWebsite && !creationAttempted) {
      // Only create if no jobId and no creation in progress or attempted
      const creationLock = sessionStorage.getItem("website-creation-lock");
      const websiteCreationData = localStorage.getItem("websiteCreationData");

      if (!creationLock && websiteCreationData) {
        createWebsite();
      } else if (!websiteCreationData) {
      } else if (creationLock) {
      }
    } else {
    }
  }, [jobId, isCreatingWebsite, creationAttempted]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600";
      case "in-progress":
        return "text-blue-600";
      case "failed":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case "in-progress":
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case "failed":
        return <ExternalLink className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-600" />;
    }
  };

  const stepIcons = {
    "Database Setup": Database,
    "Google Analytics": Zap,
    "Template Configuration": Settings,
    "GitHub Repository": CloudUpload,
    "Vercel Deployment": Zap,
    "Domain Configuration": Globe,
    "Final Testing": Eye,
  };

  const stepEstimates = {
    "Database Setup": "~10 sec",
    "Google Analytics": "~15 sec",
    "Template Configuration": "~20 sec",
    "GitHub Repository": "~8 sec",
    "Vercel Deployment": "~3-4 min",
    "Domain Configuration": "~10 sec",
    "Final Testing": "~5 sec",
  };

  // Use actual steps from API response, fallback to estimated steps
  const displaySteps = deploymentStatus.steps || [
    { name: "Database Setup", status: "pending" as const },
    { name: "Google Analytics", status: "pending" as const },
    { name: "Template Configuration", status: "pending" as const },
    { name: "GitHub Repository", status: "pending" as const },
    { name: "Vercel Deployment", status: "pending" as const },
    { name: "Domain Configuration", status: "pending" as const },
    { name: "Final Testing", status: "pending" as const },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-background/50 py-12 px-4">
      <Container className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
            {deploymentStatus.status === "completed" ? (
              <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
            ) : (
              <RefreshCw className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
            )}
          </div>

          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            {deploymentStatus.status === "completed"
              ? "Website Ready!"
              : "Building Your Website"}
          </h1>

          <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
            {deploymentStatus.status === "completed"
              ? `${websiteName} has been successfully deployed and is ready to use!`
              : `We're creating ${websiteName} with your selected theme and configuration. This usually takes ${deploymentStatus.estimatedCompletion}.`}
          </p>

          {deploymentStatus.status === "completed" &&
            (deploymentStatus.websiteUrl || deploymentStatus.aliasUrl) && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a
                  href={(() => {
                    // Priority: Use domain from response first (e.g., devtraco.onjuzbuild.com)
                    // This is the custom domain configured on Namecheap + Vercel
                    let url =
                      domainName || urlDomainName
                        ? `${domainName || urlDomainName}.onjuzbuild.com`
                        : deploymentStatus.websiteUrl ||
                          deploymentStatus.aliasUrl;

                    // Return empty string if no URL is available
                    if (!url) return "";

                    // Clean up malformed URLs that might have localhost prefix
                    if (url.includes("localhost:3000/signup/")) {
                      url = url.split("localhost:3000/signup/")[1];
                    }

                    // Ensure it has https protocol
                    if (
                      !url.startsWith("http://") &&
                      !url.startsWith("https://")
                    ) {
                      url = `https://${url}`;
                    }

                    // Convert http to https for security
                    if (url.startsWith("http://")) {
                      url = url.replace("http://", "https://");
                    }

                    return url;
                  })()}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="px-8">
                    <Globe className="w-4 h-4 mr-2" />
                    View Your Website
                  </Button>
                </a>
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8"
                  onClick={() => (window.location.href = "/app/dashboard")}
                >
                  Go to Dashboard
                </Button>
              </div>
            )}
        </div>

        {/* Status Card */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(deploymentStatus.status)}
                <div>
                  <CardTitle
                    className={getStatusColor(deploymentStatus.status)}
                  >
                    {deploymentStatus.status === "completed"
                      ? "Deployment Complete"
                      : deploymentStatus.status === "failed"
                      ? "Deployment Failed"
                      : deploymentStatus.currentStep || "Processing..."}
                  </CardTitle>
                  <CardDescription>
                    {deploymentStatus.status === "completed"
                      ? "Your website is live and ready to use"
                      : `Estimated completion: ${deploymentStatus.estimatedCompletion}`}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {jobId && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={checkStatus}
                    disabled={isChecking}
                  >
                    {isChecking ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Refresh
                  </Button>
                )}
                <Badge
                  variant={
                    deploymentStatus.status === "completed"
                      ? "default"
                      : "secondary"
                  }
                >
                  {deploymentStatus.status.charAt(0).toUpperCase() +
                    deploymentStatus.status.slice(1)}
                </Badge>
              </div>
            </div>
          </CardHeader>

          {deploymentStatus.status !== "completed" && (
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${deploymentStatus.progress || 0}%` }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {deploymentStatus.progress || 0}% Complete
              </p>
              {deploymentStatus.estimatedCompletion && (
                <p className="text-xs text-muted-foreground text-center mt-1">
                  Estimated completion: {deploymentStatus.estimatedCompletion}
                </p>
              )}
            </CardContent>
          )}
        </Card>

        {/* Deployment Steps */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Deployment Process</CardTitle>
            <CardDescription>
              Here's what happens during the website creation process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {displaySteps.map((step, index) => {
                const StepIcon =
                  stepIcons[step.name as keyof typeof stepIcons] || Settings;
                const isCompleted = step.status === "completed";
                const isCurrent = step.status === "in-progress";
                const isFailed = step.status === "failed";
                const estimated =
                  stepEstimates[step.name as keyof typeof stepEstimates] ||
                  "1-2 min";

                return (
                  <div
                    key={step.name}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isCompleted
                          ? "bg-green-100 text-green-600"
                          : isCurrent
                          ? "bg-blue-100 text-blue-600"
                          : isFailed
                          ? "bg-red-100 text-red-600"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : isCurrent ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : isFailed ? (
                        <ExternalLink className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{step.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {isCompleted
                          ? `Completed ${
                              step.timestamp
                                ? new Date(step.timestamp).toLocaleTimeString()
                                : ""
                            }`
                          : isCurrent
                          ? "In progress..."
                          : isFailed
                          ? "Failed"
                          : `Est. ${estimated}`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">What's Being Created</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">
                  Custom real estate website with Homely theme
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Property listing functionality</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Lead capture forms</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">Professional business pages</span>
              </div>
              {(domainName || urlDomainName) && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">
                    Custom domain: {domainName || urlDomainName}.onjuzbuild.com
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Next Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">
                  Access your dashboard to manage properties
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Upload your property listings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Customize your website content</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                <span className="text-sm">Connect your marketing tools</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center">
          <div className="text-sm text-muted-foreground mb-4">
            {lastChecked && (
              <p>Last updated: {lastChecked.toLocaleTimeString()}</p>
            )}
            {jobId && (
              <p className="mt-1">
                Job ID:{" "}
                <code className="text-xs bg-muted px-1 py-0.5 rounded">
                  {jobId}
                </code>
              </p>
            )}
          </div>

          <p className="text-sm text-muted-foreground">
            Need help? Contact our support team at{" "}
            <a
              href="mailto:support@juzbuild.com"
              className="text-primary hover:underline"
            >
              support@juzbuild.com
            </a>
          </p>
        </div>
      </Container>
    </div>
  );
}
