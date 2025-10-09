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

  // Get jobId from URL params or result data
  const jobId = searchParams.get("jobId");
  const websiteName = searchParams.get("websiteName") || "your website";
  const domainName = searchParams.get("domainName");

  // Redirect to waitlist if app is not live
  if (!isLive) {
    return <WaitingList />;
  }

  // Check deployment status
  const checkStatus = async () => {
    if (!jobId) return;

    setIsChecking(true);
    try {
      const response = await fetch(`/api/workflow/status/${jobId}`);
      const data = await response.json();

      if (data.success) {
        console.log("Deployment status update:", data);
        setDeploymentStatus((prev) => ({
          ...prev,
          ...data,
          lastChecked: new Date().toISOString(),
        }));
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
      const interval = setInterval(checkStatus, 30000);
      return () => clearInterval(interval);
    }
  }, [jobId, deploymentStatus.status]);

  // Initial status check
  useEffect(() => {
    if (jobId) {
      checkStatus();
    }
  }, [jobId]);

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
    "Template Configuration": Settings,
    "GitHub Repository": CloudUpload,
    "Vercel Deployment": Zap,
    "Domain Configuration": Globe,
    "Final Testing": Eye,
  };

  const stepEstimates = {
    "Database Setup": "1-2 min",
    "Template Configuration": "1-2 min",
    "GitHub Repository": "30 sec",
    "Vercel Deployment": "2-3 min",
    "Domain Configuration": "1-2 min",
    "Final Testing": "30 sec",
  };

  // Use actual steps from API response, fallback to estimated steps
  const displaySteps = deploymentStatus.steps || [
    { name: "Database Setup", status: "pending" as const },
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
            deploymentStatus.websiteUrl && (
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <a
                  href={(() => {
                    let url = deploymentStatus.websiteUrl;
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
                <Link href="/app/dashboard">
                  <Button variant="outline" size="lg" className="px-8">
                    Go to Dashboard
                  </Button>
                </Link>
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

          {deploymentStatus.progress &&
            deploymentStatus.status !== "completed" && (
              <CardContent>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${deploymentStatus.progress}%` }}
                  />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {deploymentStatus.progress}% Complete
                </p>
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
              {domainName && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm">
                    Custom domain: {domainName}.onjuzbuild.com
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
