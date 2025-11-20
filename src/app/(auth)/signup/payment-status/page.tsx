"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function PaymentStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("Processing your payment...");

  const sessionId = searchParams.get("session_id");

  useEffect(() => {
    const completeSignup = async () => {
      if (!sessionId) {
        setStatus("error");
        setMessage("No payment session found. Please try again.");
        return;
      }

      // Get stored signup data from localStorage
      const pendingSignupData = localStorage.getItem("pendingSignupData");
      if (!pendingSignupData) {
        console.error("No pending signup data found");
        setStatus("error");
        setMessage("Signup data not found. Please restart the signup process.");
        return;
      }

      try {
        setMessage("Verifying payment and creating your account...");

        const signupData = JSON.parse(pendingSignupData);

        // Complete the signup process
        const response = await fetch("/api/auth/complete-signup", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            sessionId: sessionId,
            signupData: signupData,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          console.log("Signup completed:", result);

          setStatus("success");
          setMessage("Account created successfully! Creating your website...");

          // Store signup data for website creation on deployment page
          if (result.signupData) {
            localStorage.setItem(
              "websiteCreationData",
              JSON.stringify(result.signupData)
            );

            console.log(
              "✅ Signup completed successfully, redirecting to deployment page"
            );
            setMessage(
              "Account created successfully! Redirecting to website deployment..."
            );

            // Clean up old stored data
            localStorage.removeItem("pendingSignupData");

            // Redirect to deployment page - it will handle website creation
            setTimeout(() => {
              router.push("/signup/deployment");
            }, 1500);
          } else {
            // Clean up old stored data
            localStorage.removeItem("pendingSignupData");

            // Redirect to deployment page after brief delay
            setTimeout(() => {
              router.push("/signup/deployment");
            }, 2000);
          }
        } else {
          const error = await response.json();
          console.error("Signup completion failed:", error);
          setStatus("error");
          setMessage(
            error.error || "Failed to complete signup. Please contact support."
          );
        }
      } catch (error) {
        console.error("Error completing signup:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
      }
    };

    completeSignup();
  }, [sessionId, router]);

  const handleRetry = () => {
    router.push("/signup");
  };

  const handleContinue = () => {
    router.push("/signup/deployment");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <div className="text-center space-y-6">
            {/* Status Icon */}
            <div className="flex justify-center">
              {status === "loading" && (
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
              )}
              {status === "success" && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
              )}
              {status === "error" && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-600" />
                </div>
              )}
            </div>

            {/* Status Title */}
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">
                {status === "loading" && "Processing Payment"}
                {status === "success" && "Payment Successful!"}
                {status === "error" && "Payment Issue"}
              </h1>
              <p className="text-muted-foreground">{message}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {status === "success" && (
                <Button onClick={handleContinue} className="w-full" size="lg">
                  Continue to Website Setup
                </Button>
              )}

              {status === "error" && (
                <div className="space-y-2">
                  <Button onClick={handleRetry} className="w-full" size="lg">
                    Restart Signup
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      (window.location.href = "mailto:support@juzbuild.com")
                    }
                    className="w-full"
                    size="sm"
                  >
                    Contact Support
                  </Button>
                </div>
              )}

              {status === "loading" && (
                <p className="text-sm text-muted-foreground">
                  This may take a few moments...
                </p>
              )}
            </div>

            {/* Progress Indicator for Success */}
            {status === "success" && (
              <div className="bg-muted rounded-lg p-3">
                <div className="text-xs text-muted-foreground mb-1">
                  Next Steps:
                </div>
                <div className="text-sm space-y-1">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Payment confirmed
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-3 h-3 mr-2" />
                    Account created
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin mr-2"></div>
                    Website setup...
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading payment status...</p>
          </div>
        </div>
      }
    >
      <PaymentStatusContent />
    </Suspense>
  );
}
