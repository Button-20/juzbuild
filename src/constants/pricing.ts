export interface PricingPlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  yearlyDiscount: string;
  websiteLimit: number;
  features: string[];
  popular?: boolean;
  targetAudience: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for solo agents starting their online presence",
    targetAudience: "Solo Agents",
    monthlyPrice: 29,
    yearlyPrice: 290,
    yearlyDiscount: "2 months free",
    websiteLimit: 1,
    features: [
      "1 Professional Website",
      "Unlimited property uploads",
      "Lead capture forms",
      "Basic templates",
      "Mobile responsive design",
      "SSL certificate included",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    description: "Advanced features for small agencies and growing businesses",
    targetAudience: "Small Agencies",
    monthlyPrice: 59,
    yearlyPrice: 590,
    yearlyDiscount: "2 months free",
    websiteLimit: 3,
    popular: true,
    features: [
      "Up to 3 Websites",
      "Everything in Starter",
      "Facebook & Google ads integration",
      "Marketing automation tools",
      "Advanced branding customization",
      "Analytics & reporting dashboard",
      "CRM integration",
      "Priority email support",
      "Custom forms builder",
    ],
  },
  {
    id: "agency",
    name: "Agency",
    description: "Complete solution for growing teams and established agencies",
    targetAudience: "Growing Teams",
    monthlyPrice: 99,
    yearlyPrice: 990,
    yearlyDiscount: "2 months free",
    websiteLimit: 10,
    features: [
      "Up to 10 Websites",
      "Everything in Pro",
      "Multiple team member logins",
      "Premium design templates",
      "Custom domain connection",
      "White-label solutions",
      "Advanced SEO tools",
      "Priority phone & email support",
      "Dedicated account manager",
      "API access",
    ],
  },
];

export const getPlanById = (id: string): PricingPlan | undefined => {
  return PRICING_PLANS.find((plan) => plan.id === id);
};

export const calculateYearlySavings = (
  monthlyPrice: number,
  yearlyPrice: number
): number => {
  return monthlyPrice * 12 - yearlyPrice;
};
