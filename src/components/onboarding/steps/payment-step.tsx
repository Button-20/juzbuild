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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PRICING_PLANS } from "@/constants/pricing";
import { WizardStepProps } from "@/types/onboarding";
import { ArrowLeft, Check, CreditCard, Lock } from "lucide-react";

export default function PaymentStep({
  data,
  updateData,
  errors,
  onNext,
  onBack,
  isSubmitting,
  isStepValid,
}: WizardStepProps) {
  const selectedPlan =
    PRICING_PLANS.find((plan) => plan.id === data.selectedPlan) ||
    PRICING_PLANS[0];
  const isYearly = data.billingCycle === "yearly";
  const price = isYearly ? selectedPlan.yearlyPrice : selectedPlan.monthlyPrice;
  const displayPrice = isYearly
    ? Math.round(selectedPlan.yearlyPrice / 12)
    : selectedPlan.monthlyPrice;

  const handlePlanChange = (planId: string) => {
    updateData({ selectedPlan: planId as any });
  };

  const handleBillingChange = (cycle: string) => {
    updateData({ billingCycle: cycle as any });
  };

  const handlePaymentMethodChange = (field: string, value: string) => {
    // Apply field-specific validation and limits
    let processedValue = value;

    if (field === "cvv") {
      // Limit CVC to 4 digits maximum and only allow numbers
      processedValue = value.replace(/\D/g, "").slice(0, 4);
    }

    updateData({
      paymentMethod: {
        cardNumber: "",
        expiryDate: "",
        cvv: "",
        cardholderName: "",
        ...data.paymentMethod,
        [field]: processedValue,
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Plan Selection */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Choose Your Plan</h3>
          <p className="text-sm text-muted-foreground">
            Select the perfect plan for your real estate business
          </p>
        </div>

        <RadioGroup
          value={data.selectedPlan || "pro"}
          onValueChange={handlePlanChange}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {PRICING_PLANS.map((plan) => (
            <Card
              key={plan.id}
              className={`relative cursor-pointer transition-all ${
                data.selectedPlan === plan.id
                  ? "ring-2 ring-primary border-primary"
                  : "hover:border-primary/50"
              } ${plan.popular ? "border-primary" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2 left-1/2 -translate-x-1/2 text-nowrap">
                  Most Popular
                </Badge>
              )}

              <CardHeader className="text-center pb-2">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={plan.id} id={plan.id} />
                  <Label htmlFor={plan.id} className="cursor-pointer">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                  </Label>
                </div>
                <CardDescription className="text-sm">
                  {plan.targetAudience}
                </CardDescription>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="text-center mb-4">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-3xl font-bold">
                      $
                      {isYearly
                        ? Math.round(plan.yearlyPrice / 12)
                        : plan.monthlyPrice}
                    </span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  {isYearly && (
                    <div className="text-xs text-primary mt-1">
                      Billed yearly (${plan.yearlyPrice}) • Save 2 months
                    </div>
                  )}
                </div>

                <ul className="space-y-2 text-sm">
                  {plan.features.slice(0, 4).map((feature, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                  {plan.features.length > 4 && (
                    <li className="text-muted-foreground text-xs">
                      +{plan.features.length - 4} more features
                    </li>
                  )}
                </ul>
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
        {errors.selectedPlan && (
          <p className="text-destructive text-sm">{errors.selectedPlan}</p>
        )}
      </div>

      {/* Billing Cycle */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Billing Cycle</h3>
          <p className="text-sm text-muted-foreground">
            Choose how you'd like to be billed
          </p>
        </div>

        <RadioGroup
          value={data.billingCycle || "monthly"}
          onValueChange={handleBillingChange}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <Card
            className={`cursor-pointer transition-all ${
              data.billingCycle === "monthly"
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="monthly" id="monthly" />
                <div className="flex-1">
                  <Label
                    htmlFor="monthly"
                    className="cursor-pointer font-medium"
                  >
                    Monthly Billing
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Pay month-to-month, cancel anytime
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    ${selectedPlan.monthlyPrice}/mo
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all ${
              data.billingCycle === "yearly"
                ? "ring-2 ring-primary"
                : "hover:border-primary/50"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <RadioGroupItem value="yearly" id="yearly" />
                <div className="flex-1">
                  <Label
                    htmlFor="yearly"
                    className="cursor-pointer font-medium"
                  >
                    Yearly Billing
                    <Badge variant="secondary" className="ml-2">
                      Save 17%
                    </Badge>
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get 2 months free with annual payment
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-bold">
                    ${Math.round(selectedPlan.yearlyPrice / 12)}/mo
                  </div>
                  <div className="text-xs text-muted-foreground">
                    ${selectedPlan.yearlyPrice}/year
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
        {errors.billingCycle && (
          <p className="text-destructive text-sm">{errors.billingCycle}</p>
        )}
      </div>

      {/* Payment Information */}
      <div className="space-y-6">
        <div className="border-l-4 border-primary pl-4">
          <h3 className="text-lg font-semibold mb-1">Payment Information</h3>
          <p className="text-sm text-muted-foreground">
            Secure payment processing with Stripe
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Credit Card Details
            </CardTitle>
            <CardDescription>
              Your payment information is encrypted and secure
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Cardholder Name */}
            <div className="space-y-2">
              <Label htmlFor="cardholderName">Cardholder Name *</Label>
              <Input
                id="cardholderName"
                placeholder="John Doe"
                value={data.paymentMethod?.cardholderName || ""}
                onChange={(e) =>
                  handlePaymentMethodChange("cardholderName", e.target.value)
                }
                className={errors.cardholderName ? "border-destructive" : ""}
              />
              {errors.cardholderName && (
                <p className="text-destructive text-sm">
                  {errors.cardholderName}
                </p>
              )}
            </div>

            {/* Card Number */}
            <div className="space-y-2">
              <Label htmlFor="cardNumber">Card Number *</Label>
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                value={data.paymentMethod?.cardNumber || ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                  value = value.replace(/(\d{4})(?=\d)/g, "$1 "); // Add space every 4 digits
                  handlePaymentMethodChange("cardNumber", value);
                }}
                onKeyDown={(e) => {
                  // Allow backspace, delete, tab, escape, enter
                  if (
                    [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                    // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                    (e.keyCode === 65 && e.ctrlKey === true) ||
                    (e.keyCode === 67 && e.ctrlKey === true) ||
                    (e.keyCode === 86 && e.ctrlKey === true) ||
                    (e.keyCode === 88 && e.ctrlKey === true)
                  ) {
                    return;
                  }
                  // Ensure that it is a number and stop the keypress
                  if (
                    (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                    (e.keyCode < 96 || e.keyCode > 105)
                  ) {
                    e.preventDefault();
                  }
                }}
                className={errors.cardNumber ? "border-destructive" : ""}
              />
              {errors.cardNumber && (
                <p className="text-destructive text-sm">{errors.cardNumber}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Expiry Date *</Label>
                <Input
                  id="expiryDate"
                  placeholder="MM/YY"
                  maxLength={5}
                  value={data.paymentMethod?.expiryDate || ""}
                  onChange={(e) => {
                    let value = e.target.value.replace(/\D/g, ""); // Remove non-digits
                    if (value.length >= 2) {
                      value =
                        value.substring(0, 2) + "/" + value.substring(2, 4);
                    }
                    handlePaymentMethodChange("expiryDate", value);
                  }}
                  onKeyDown={(e) => {
                    // Allow backspace, delete, tab, escape, enter
                    if (
                      [8, 9, 27, 13, 46].indexOf(e.keyCode) !== -1 ||
                      // Allow Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X
                      (e.keyCode === 65 && e.ctrlKey === true) ||
                      (e.keyCode === 67 && e.ctrlKey === true) ||
                      (e.keyCode === 86 && e.ctrlKey === true) ||
                      (e.keyCode === 88 && e.ctrlKey === true)
                    ) {
                      return;
                    }
                    // Ensure that it is a number and stop the keypress
                    if (
                      (e.shiftKey || e.keyCode < 48 || e.keyCode > 57) &&
                      (e.keyCode < 96 || e.keyCode > 105)
                    ) {
                      e.preventDefault();
                    }
                  }}
                  className={errors.expiryDate ? "border-destructive" : ""}
                />
                {errors.expiryDate && (
                  <p className="text-destructive text-sm">
                    {errors.expiryDate}
                  </p>
                )}
              </div>

              {/* CVC */}
              <div className="space-y-2">
                <Label htmlFor="cvv">CVC *</Label>
                <Input
                  id="cvv"
                  placeholder="123"
                  value={data.paymentMethod?.cvv || ""}
                  onChange={(e) =>
                    handlePaymentMethodChange("cvv", e.target.value)
                  }
                  className={errors.cvv ? "border-destructive" : ""}
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
                {errors.cvv && (
                  <p className="text-destructive text-sm">{errors.cvv}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span>{selectedPlan.name} Plan</span>
                <span>${displayPrice}/month</span>
              </div>
              {isYearly && (
                <>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Billed annually</span>
                    <span>${selectedPlan.yearlyPrice}/year</span>
                  </div>
                  <div className="flex justify-between text-sm text-primary">
                    <span>Annual savings</span>
                    <span>
                      -$
                      {selectedPlan.monthlyPrice * 12 -
                        selectedPlan.yearlyPrice}
                    </span>
                  </div>
                </>
              )}
              <hr />
              <div className="flex justify-between font-bold">
                <span>Total {isYearly ? "(First year)" : "(Monthly)"}</span>
                <span>
                  $
                  {isYearly
                    ? selectedPlan.yearlyPrice
                    : selectedPlan.monthlyPrice}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Terms Agreement */}
      <div className="space-y-4">
        <div className="flex items-start space-x-3">
          <Checkbox
            id="agreeToTerms"
            checked={data.agreeToTerms || false}
            onCheckedChange={(checked) =>
              updateData({ agreeToTerms: checked as boolean })
            }
            className={errors.agreeToTerms ? "border-destructive" : ""}
          />
          <div className="grid gap-1.5 leading-none">
            <Label
              htmlFor="agreeToTerms"
              className="text-sm font-normal cursor-pointer"
            >
              I agree to the{" "}
              <a
                href="/terms"
                target="_blank"
                className="text-primary hover:underline"
              >
                Terms & Conditions
              </a>{" "}
              and{" "}
              <a
                href="/privacy"
                target="_blank"
                className="text-primary hover:underline"
              >
                Privacy Policy
              </a>
            </Label>
          </div>
        </div>
        {errors.agreeToTerms && (
          <p className="text-destructive text-sm">{errors.agreeToTerms}</p>
        )}
      </div>

      {/* 14-day trial notice */}
      <div className="bg-muted/30 p-4 rounded-lg border border-border">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-medium text-sm">14-Day Free Trial</h4>
            <p className="text-sm text-muted-foreground mt-1">
              Start your free trial today. Your card won't be charged until the
              trial period ends. Cancel anytime during the trial with no fees.
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-6 border-t">
        <Button variant="outline" onClick={onBack} size="lg" className="px-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          onClick={onNext}
          size="lg"
          className="px-8"
          disabled={!isStepValid || isSubmitting}
        >
          {isSubmitting ? "Creating Account..." : "Start Free Trial"}
        </Button>
      </div>
    </div>
  );
}
