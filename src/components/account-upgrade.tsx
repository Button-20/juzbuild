"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { PRICING_PLANS, getPlanById } from "@/constants/pricing";
import { ArrowUp, Check, Crown, Zap } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function AccountUpgrade() {
  const { user } = useAuth();
  const [isUpgrading, setIsUpgrading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>("");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const currentPlan = getPlanById(user?.selectedPlan || "starter");
  const availableUpgrades = PRICING_PLANS.filter(
    (plan) => plan.id !== user?.selectedPlan
  );

  const handleUpgrade = async (planId: string) => {
    setIsUpgrading(true);
    try {
      // TODO: Implement Stripe subscription upgrade
      toast.success(`Upgrading to ${planId} plan...`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Refresh user data after upgrade
      // This would typically update the user's plan in the database
      toast.success("Plan upgraded successfully!");
    } catch (error) {
      console.error("Upgrade error:", error);
      toast.error("Failed to upgrade plan. Please try again.");
    } finally {
      setIsUpgrading(false);
    }
  };

  const formatPrice = (plan: any, cycle: "monthly" | "yearly") => {
    const price = cycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice / 12;
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
                <h4 className="font-medium">
                  {currentPlan?.name || "Starter"}
                </h4>
                <p className="text-sm text-muted-foreground">
                  {currentPlan?.description}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">
                  {formatPrice(currentPlan || PRICING_PLANS[0], billingCycle)}
                </p>
                <p className="text-xs text-muted-foreground">
                  billed {billingCycle}
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