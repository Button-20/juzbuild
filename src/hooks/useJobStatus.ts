"use client";

import { useState, useEffect } from "react";

interface JobStatus {
  status: "pending" | "processing" | "completed" | "failed";
  message: string;
  progress: number;
  currentStep?: string;
  estimatedCompletion?: string;
  steps?: Array<{
    name: string;
    status: "pending" | "in-progress" | "completed" | "failed";
  }>;
  websiteUrl?: string;
  error?: string;
}

export function useJobStatus(jobId: string | null, enabled: boolean = true) {
  const [status, setStatus] = useState<JobStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!jobId || !enabled) {
      console.log("useJobStatus: Not polling", { jobId, enabled });
      return;
    }

    console.log("useJobStatus: Starting polling for jobId:", jobId);

    const pollJobStatus = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log(`useJobStatus: Fetching status for jobId: ${jobId}`);

        const response = await fetch(`/api/jobs/${jobId}`);

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // The job status is nested under data.status
            const jobStatus = data.status;
            setStatus(jobStatus);

            // Stop polling if job is completed or failed
            if (
              jobStatus.status === "completed" ||
              jobStatus.status === "failed"
            ) {
              return false; // Stop polling
            }
          } else {
            setError(data.message || "Failed to fetch job status");
          }
        } else {
          setError("Failed to fetch job status");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }

      return true; // Continue polling
    };

    // Initial fetch
    pollJobStatus();

    // Set up polling interval
    const pollInterval = setInterval(async () => {
      const shouldContinue = await pollJobStatus();
      if (!shouldContinue) {
        clearInterval(pollInterval);
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(pollInterval);
    };
  }, [jobId, enabled]);

  return { status, loading, error };
}
