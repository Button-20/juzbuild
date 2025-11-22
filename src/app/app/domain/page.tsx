"use client";

import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SidebarInset } from "@/components/ui/sidebar";
import {
  AlertCircle,
  CheckCircle2,
  Globe,
  Loader2,
  Search,
  ShoppingCart,
  Crown,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { getPlanById } from "@/constants/pricing";

interface DomainCheckResult {
  domain: string;
  available: boolean;
  isPremiumName?: boolean;
  premiumRegistrationPrice?: string;
  icannFee?: string;
}

interface CurrentDomain {
  domain: string;
  isCustomDomain: boolean;
}

export default function DomainManagementPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [currentDomain, setCurrentDomain] = useState<CurrentDomain | null>(
    null
  );
  const [searchDomain, setSearchDomain] = useState("");
  const [isChecking, setIsChecking] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [checkResult, setCheckResult] = useState<DomainCheckResult | null>(
    null
  );
  const [isLoadingCurrent, setIsLoadingCurrent] = useState(true);

  // Check user plan
  const userPlan = getPlanById(user?.selectedPlan || "starter");
  const canPurchaseDomains = user?.selectedPlan !== "starter";

  useEffect(() => {
    fetchCurrentDomain();
  }, []);

  const fetchCurrentDomain = async () => {
    try {
      setIsLoadingCurrent(true);
      const response = await fetch("/api/domain/current");
      const data = await response.json();

      if (data.success) {
        setCurrentDomain(data.domain);
      }
    } catch (error) {
      console.error("Error fetching current domain:", error);
      toast.error("Failed to load current domain");
    } finally {
      setIsLoadingCurrent(false);
    }
  };

  const handleCheckDomain = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!searchDomain.trim()) {
      toast.error("Please enter a domain name");
      return;
    }

    // Basic domain validation
    const domainRegex =
      /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/;
    if (!domainRegex.test(searchDomain)) {
      toast.error("Please enter a valid domain name (e.g., example.com)");
      return;
    }

    try {
      setIsChecking(true);
      setCheckResult(null);

      const response = await fetch("/api/domain/check", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: searchDomain }),
      });

      const data = await response.json();

      if (data.success) {
        setCheckResult(data.result);
        if (data.result.available) {
          if (canPurchaseDomains) {
            toast.success(`${searchDomain} is available!`);
          } else {
            toast.success(`${searchDomain} is available! Upgrade to Pro to purchase.`);
          }
        } else {
          toast.error(`${searchDomain} is not available`);
        }
      } else {
        throw new Error(data.error || "Failed to check domain");
      }
    } catch (error) {
      console.error("Error checking domain:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to check domain"
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handlePurchaseDomain = async () => {
    if (!checkResult?.available) {
      toast.error("Domain is not available for purchase");
      return;
    }

    // Check plan restrictions
    if (!canPurchaseDomains) {
      toast.error("Domain purchases are available for Pro and Agency plans only");
      return;
    }

    try {
      setIsPurchasing(true);

      const response = await fetch("/api/domain/purchase", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ domain: checkResult.domain }),
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Domain purchased successfully!");
        toast.success("DNS configuration in progress...");
        toast.info("DNS propagation may take 24-48 hours", {
          duration: 8000,
        });

        // Refresh current domain info
        await fetchCurrentDomain();

        // Clear search results
        setSearchDomain("");
        setCheckResult(null);
      } else {
        // Handle plan restriction errors specifically
        if (data.planRestriction) {
          toast.error(data.error);
          // Optionally redirect to settings for upgrade
          setTimeout(() => {
            if (confirm("Would you like to upgrade your plan now?")) {
              router.push("/app/settings");
            }
          }, 2000);
        } else {
          throw new Error(data.error || "Failed to purchase domain");
        }
      }
    } catch (error) {
      console.error("Error purchasing domain:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to purchase domain"
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <ProtectedRoute>
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Domain Management
              </h1>
              <p className="text-muted-foreground">
                Manage your custom domain and upgrade from .onjuzbuild.com
              </p>
            </div>
          </div>

          {/* Current Domain Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Current Domain
              </CardTitle>
              <CardDescription>
                Your website is currently accessible at this domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingCurrent ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Loading...</span>
                </div>
              ) : currentDomain ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-semibold text-lg">
                        {currentDomain.domain}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {currentDomain.isCustomDomain
                          ? "Custom Domain"
                          : "Juzbuild Subdomain"}
                      </p>
                    </div>
                    {!currentDomain.isCustomDomain && (
                      <div className="text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
                        Upgrade Available
                      </div>
                    )}
                  </div>
                  {!currentDomain.isCustomDomain && (
                    <p className="text-sm text-muted-foreground">
                      💡 Upgrade to a custom domain to enhance your brand and
                      improve SEO
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-muted-foreground">No domain found</p>
              )}
            </CardContent>
          </Card>

          {/* Upgrade Prompt for Starter Plan */}
          {!canPurchaseDomains && (
            <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-800 dark:from-amber-950/50 dark:to-orange-950/50">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-800">
                    <Crown className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <CardTitle className="text-amber-900 dark:text-amber-100">
                      Custom Domains Available with Pro & Agency Plans
                    </CardTitle>
                    <CardDescription className="text-amber-700 dark:text-amber-300">
                      Upgrade your plan to purchase and connect custom domains to your website
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Professional Branding</p>
                        <p className="text-xs text-muted-foreground">Remove .onjuzbuild.com from your URL</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Better SEO</p>
                        <p className="text-xs text-muted-foreground">Improve search engine rankings</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Trust & Credibility</p>
                        <p className="text-xs text-muted-foreground">Build customer confidence</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-sm">Easy Setup</p>
                        <p className="text-xs text-muted-foreground">Automatic DNS configuration</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 pt-2">
                    <Button 
                      onClick={() => router.push(\"/app/settings\")}
                      className=\"bg-amber-600 hover:bg-amber-700 text-white\"
                    >
                      <Crown className=\"h-4 w-4 mr-2\" />
                      Upgrade to Pro Plan
                    </Button>
                    <Button 
                      variant=\"outline\" 
                      onClick={() => router.push(\"/app/settings\")}
                      className=\"border-amber-200 text-amber-700 hover:bg-amber-50\"
                    >
                      View All Plans
                    </Button>
                  </div>
                  
                  <div className=\"text-xs text-muted-foreground border-t pt-3\">
                    <p><strong>Current Plan:</strong> {userPlan?.name} - ${userPlan?.monthlyPrice}/month</p>
                    <p><strong>Pro Plan:</strong> Includes custom domains + {userPlan && userPlan.websiteLimit < 3 ? '2 additional websites' : 'advanced features'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Domain Search Card */}
          {!currentDomain?.isCustomDomain && canPurchaseDomains && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search for Custom Domain
                </CardTitle>
                <CardDescription>
                  Check domain availability and purchase your custom domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCheckDomain} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="domain">Domain Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="domain"
                        type="text"
                        placeholder="example.com"
                        value={searchDomain}
                        onChange={(e) => setSearchDomain(e.target.value)}
                        disabled={isChecking}
                      />
                      <Button type="submit" disabled={isChecking}>
                        {isChecking ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Checking...
                          </>
                        ) : (
                          <>
                            <Search className="mr-2 h-4 w-4" />
                            Check
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter the domain name you want to check (e.g., mysite.com)
                    </p>
                  </div>

                  {/* Domain Check Results */}
                  {checkResult && (
                    <div
                      className={`rounded-lg border p-4 ${
                        checkResult.available
                          ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30"
                          : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            {checkResult.available ? (
                              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                            <p className="font-semibold text-gray-900 dark:text-gray-100">
                              {checkResult.domain}
                            </p>
                          </div>
                          <p
                            className={`text-sm ${
                              checkResult.available
                                ? "text-green-700 dark:text-green-200"
                                : "text-red-700 dark:text-red-200"
                            }`}
                          >
                            {checkResult.available
                              ? "This domain is available for purchase!"
                              : "This domain is already taken"}
                          </p>
                          {checkResult.available && (
                            <div className="space-y-1 text-sm">
                              {checkResult.isPremiumName && (
                                <p className="text-amber-700 dark:text-amber-300">
                                  ⭐ Premium Domain
                                </p>
                              )}
                              {checkResult.premiumRegistrationPrice && (
                                <p className="font-medium">
                                  Price: ${checkResult.premiumRegistrationPrice}
                                  {checkResult.icannFee &&
                                    ` (+ $${checkResult.icannFee} ICANN fee)`}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        {checkResult.available && (
                          <Button
                            onClick={handlePurchaseDomain}
                            disabled={isPurchasing}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white dark:bg-green-600 dark:hover:bg-green-700"
                          >
                            {isPurchasing ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="mr-2 h-4 w-4" />
                                Purchase
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>
          )}

          {/* Info Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Why Use a Custom Domain?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Professional brand image</p>
                <p>✓ Better SEO rankings</p>
                <p>✓ Increased trust and credibility</p>
                <p>✓ Easier to remember and share</p>
                <p>✓ Full control over your online presence</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Domain Setup Process</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>1. Purchase your custom domain</p>
                <p>2. Automatic DNS configuration</p>
                <p>3. Domain added to Vercel project</p>
                <p>
                  4.{" "}
                  <strong className="text-foreground">
                    DNS propagation: 24-48 hours
                  </strong>
                </p>
                <p>5. Your website goes live on new domain!</p>
                <p className="pt-2 text-xs italic">
                  ⏱️ Please allow 24-48 hours for DNS changes to propagate
                  globally before your custom domain becomes fully active.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarInset>
    </ProtectedRoute>
  );
}
