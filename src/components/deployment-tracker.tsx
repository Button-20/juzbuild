"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2,
  Globe,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { useJobStatus } from "@/hooks/useJobStatus";

interface DeploymentTrackerProps {
  websiteId: string;
  jobId?: string;
  websiteName: string;
  onComplete?: (websiteUrl: string) => void;
}

export function DeploymentTracker({
  websiteId,
  jobId,
  websiteName,
  onComplete,
}: DeploymentTrackerProps) {
  const { status, loading, error } = useJobStatus(jobId || null, !!jobId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Debug logging
  console.log("DeploymentTracker props:", { websiteId, jobId, websiteName });
  console.log("Job status:", { status, loading, error });

  useEffect(() => {
    if (status?.status === "completed" && status.websiteUrl && onComplete) {
      onComplete(status.websiteUrl);
    }
  }, [status, onComplete]);

  const getStatusColor = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "failed":
        return "bg-red-500";
      default:
        return "bg-gray-300";
    }
  };

  const getStatusIcon = (stepStatus: string) => {
    switch (stepStatus) {
      case "completed":
        return <CheckCircle className="h-4 w-4" />;
      case "in-progress":
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const refreshStatus = async () => {
    setIsRefreshing(true);
    // The useJobStatus hook will automatically refresh
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  if (!jobId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Website Creation
          </CardTitle>
          <CardDescription>Waiting for deployment to start...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Initializing...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Deploying {websiteName}
            </CardTitle>
            <CardDescription>
              {status?.message || "Creating your website..."}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshStatus}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
              />
            </Button>
            {status?.status && (
              <Badge
                variant={
                  status.status === "completed"
                    ? "default"
                    : status.status === "failed"
                    ? "destructive"
                    : "secondary"
                }
              >
                {status.status}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Bar */}
        {(status && typeof status.progress === "number") ||
        (jobId && !status && !error) ? (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{status ? Math.round(status.progress) : 0}%</span>
            </div>
            <Progress
              value={status ? Math.round(status.progress) : 0}
              className="h-2"
            />
            {(status?.estimatedCompletion || (!status && jobId)) && (
              <p className="text-xs text-muted-foreground">
                Estimated completion:{" "}
                {status?.estimatedCompletion || "5-8 minutes"}
              </p>
            )}
          </div>
        ) : null}

        {/* Current Step */}
        {status?.currentStep && (
          <div className="flex items-center gap-2 p-3 bg-blue-950/20 rounded-lg">
            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
            <span className="text-sm font-medium">{status.currentStep}</span>
          </div>
        )}

        {/* Steps Progress */}
        {status?.steps && status.steps.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Deployment Steps</h4>
            <div className="space-y-2">
              {status.steps.map((step, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-2 rounded-lg"
                >
                  <div
                    className={`w-2 h-2 rounded-full ${getStatusColor(
                      step.status
                    )}`}
                  />
                  <div className="flex items-center gap-2 flex-1">
                    {getStatusIcon(step.status)}
                    <span className="text-sm">{step.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Success State */}
        {status?.status === "completed" && status.websiteUrl && (
          <div className="p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <h4 className="font-medium text-green-800 dark:text-green-200">
                Website Deployed Successfully!
              </h4>
            </div>
            <p className="text-sm text-green-700 dark:text-green-300 mb-3">
              Your website is now live and accessible to visitors.
            </p>
            <Button asChild size="sm" className="w-full">
              <a
                href={status.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                View Live Website
              </a>
            </Button>
          </div>
        )}

        {/* Error State */}
        {(status?.status === "failed" || error) && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <h4 className="font-medium text-destructive">
                Deployment Failed
              </h4>
            </div>
            <p className="text-sm text-destructive/80">
              {status?.error || error || "An error occurred during deployment"}
            </p>
          </div>
        )}

        {/* Loading State */}
        {(loading && !status) || (!status && !error) ? (
          <div className="flex items-center justify-center py-8 space-y-4">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-blue-500" />
              <p className="text-sm text-muted-foreground">
                Connecting to deployment service...
              </p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
