import { loadStripe } from "@stripe/stripe-js";

// Make sure to add your publishable key here
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  console.warn(
    "Missing NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY environment variable"
  );
}

// Singleton pattern for stripe instance
let stripePromise: Promise<any> | null = null;

const getStripe = () => {
  if (!stripePromise) {
    stripePromise = loadStripe(stripePublishableKey!);
  }
  return stripePromise;
};

export default getStripe;

export const STRIPE_PAYMENT_METHODS = {
  card: "card",
  // Add other payment methods as needed
} as const;

export const STRIPE_CURRENCIES = {
  USD: "usd",
  EUR: "eur",
  GBP: "gbp",
} as const;

// Price IDs for different plans (these would come from your Stripe dashboard)
export const STRIPE_PRICE_IDS = {
  starter: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_STARTER_MONTHLY_PRICE_ID,
    yearly: process.env.NEXT_PUBLIC_STRIPE_STARTER_YEARLY_PRICE_ID,
  },
  pro: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_PRO_MONTHLY_PRICE_ID,
    yearly: process.env.NEXT_PUBLIC_STRIPE_PRO_YEARLY_PRICE_ID,
  },
  agency: {
    monthly: process.env.NEXT_PUBLIC_STRIPE_AGENCY_MONTHLY_PRICE_ID,
    yearly: process.env.NEXT_PUBLIC_STRIPE_AGENCY_YEARLY_PRICE_ID,
  },
} as const;
