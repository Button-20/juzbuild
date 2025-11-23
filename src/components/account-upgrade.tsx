"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { PRICING_PLANS, getPlanById } from "@/constants/pricing";
import { useAuth } from "@/contexts/AuthContext";
import {
  ArrowUp,
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AccountUpgrade() {
  const { user, refreshAuth } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const currentPlan = getPlanById(user?.selectedPlan || "starter");
  const availableUpgrades = PRICING_PLANS.filter(
    (plan) => plan.id !== user?.selectedPlan
  );
  const hasActiveSubscription =
    user?.stripeCustomerId && user?.subscriptionStatus === "active";

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      // Create Stripe checkout session
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planId,
          billingCycle,
          isSignup: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session");
      }

      // Redirect to Stripe checkout using the modern approach
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received from server");
      }
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start upgrade process. Please try again."
      );
    } finally {
      setIsUpgrading(false);
    }
  };

  const handleBillingPortal = async () => {
    if (!hasActiveSubscription) {
      toast.error("No active subscription found");
      return;
    }

    setIsLoadingPortal(true);
    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to access billing portal");
      }

      // Redirect to Stripe customer portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Billing portal error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to access billing portal. Please try again."
      );
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const formatPrice = (plan: any, cycle: "monthly" | "yearly") => {
    const price =
      cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice / 12;
    return `$${Math.round(price)}/${cycle === "monthly" ? "mo" : "mo"}`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-primary" />
              Account Plan
            </CardTitle>
            <CardDescription>
              Manage your subscription and upgrade your account
            </CardDescription>
          </div>
          <Badge variant="outline" className="capitalize">
            {currentPlan?.name || "Starter"} Plan
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Plan Info */}
          <div className="rounded-lg border p-4 bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-medium">
                    {currentPlan?.name || "Starter"}
                  </h4>
                  {hasActiveSubscription && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-green-50 text-green-700 border-green-200"
                    >
                      Active Subscription
                    </Badge>
                  )}
                  {user?.subscriptionStatus === "past_due" && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-yellow-50 text-yellow-700 border-yellow-200"
                    >
                      Payment Due
                    </Badge>
                  )}
                  {user?.subscriptionStatus === "canceled" && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-red-50 text-red-700 border-red-200"
                    >
                      Canceled
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.description}
                </p>
                {user?.billingCycle && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Billed {user.billingCycle}
                  </p>
                )}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(
                    currentPlan || PRICING_PLANS[0],
                    (user?.billingCycle as "monthly" | "yearly") || billingCycle
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.billingCycle
                    ? `billed ${user.billingCycle}`
                    : `estimated ${billingCycle}`}
                </p>
              </div>
            </div>

            {/* Current Plan Features */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(currentPlan?.features || []).slice(0, 4).map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <Check className="h-3 w-3 text-green-600" />
                  {feature}
                </div>
              ))}
            </div>

            {/* Billing Management */}
            {hasActiveSubscription && (
              <>
                <Separator className="my-3" />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Manage billing & payment methods</span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBillingPortal}
                    disabled={isLoadingPortal}
                  >
                    {isLoadingPortal ? (
                      "Loading..."
                    ) : (
                      <>
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Billing Portal
                      </>
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Upgrade Options */}
          {availableUpgrades.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <ArrowUp className="h-4 w-4" />
                Available Upgrades
              </h4>

              <div className="grid gap-3">
                {availableUpgrades.map((plan) => (
                  <div
                    key={plan.id}
                    className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h5 className="font-medium">{plan.name}</h5>
                          {plan.popular && (
                            <Badge variant="default" className="text-xs">
                              Most Popular
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {plan.description}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-lg font-bold">
                            {formatPrice(plan, billingCycle)}
                          </span>
                          {billingCycle === "yearly" && (
                            <Badge variant="outline" className="text-xs">
                              {plan.yearlyDiscount}
                            </Badge>
                          )}
                        </div>
                      </div>

                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedPlan(plan.id)}
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Upgrade
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>
                              Upgrade to {plan.name} Plan
                            </DialogTitle>
                            <DialogDescription>
                              Review the plan details and confirm your upgrade
                            </DialogDescription>
                          </DialogHeader>

                          <div className="space-y-4">
                            {/* Billing Cycle Toggle */}
                            <div className="flex items-center justify-center gap-2 p-1 bg-muted rounded-lg mx-auto w-fit">
                              <Button
                                variant={
                                  billingCycle === "monthly"
                                    ? "default"
                                    : "ghost"
                                }
                                size="sm"
                                onClick={() => setBillingCycle("monthly")}
                              >
                                Monthly
                              </Button>
                              <Button
                                variant={
                                  billingCycle === "yearly"
                                    ? "default"
                                    : "ghost"
                                }
                                size="sm"
                                onClick={() => setBillingCycle("yearly")}
                              >
                                Yearly
                                <Badge
                                  variant={
                                    billingCycle === "yearly"
                                      ? "secondary"
                                      : "default"
                                  }
                                  className="ml-2 text-xs"
                                >
                                  Save 17%
                                </Badge>
                              </Button>
                            </div>

                            {/* Plan Comparison */}
                            <div className="border rounded-lg p-4">
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium">
                                  {plan.name} Plan
                                </h4>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">
                                    {formatPrice(plan, billingCycle)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {billingCycle === "yearly"
                                      ? `$${plan.yearlyPrice}/year`
                                      : `$${plan.monthlyPrice}/month`}
                                  </p>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 gap-2">
                                {plan.features.map((feature, idx) => (
                                  <div
                                    key={idx}
                                    className="flex items-center gap-2 text-sm"
                                  >
                                    <Check className="h-3 w-3 text-green-600" />
                                    {feature}
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Upgrade Action */}
                            <div className="flex gap-2 pt-4">
                              <Button
                                onClick={() => handleUpgrade(plan.id)}
                                disabled={isUpgrading}
                                className="flex-1"
                              >
                                {isUpgrading
                                  ? "Processing..."
                                  : `Upgrade to ${plan.name}`}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
