export type PLAN = {
  id: string;
  title: string;
  desc: string;
  monthlyPrice: number;
  annuallyPrice: number;
  badge?: string;
  buttonText: string;
  features: string[];
  link: string;
  targetAudience?: string;
};

export const PLANS: PLAN[] = [
  {
    id: "starter",
    title: "Starter",
    desc: "Perfect for solo agents starting their online presence",
    targetAudience: "Solo Agents",
    monthlyPrice: 29,
    annuallyPrice: 290,
    buttonText: "Start Free Trial",
    features: [
      "Professional real estate website",
      "Unlimited property uploads",
      "Lead capture forms",
      "Basic templates",
      "Mobile responsive design",
      "SSL certificate included",
      "Email support",
    ],
    link: "/signup?plan=starter",
  },
  {
    id: "pro",
    title: "Pro",
    desc: "Advanced features for small agencies and growing businesses",
    targetAudience: "Small Agencies",
    monthlyPrice: 59,
    annuallyPrice: 590,
    badge: "Most Popular",
    buttonText: "Start Free Trial",
    features: [
      "Everything in Starter",
      "Facebook & Google ads integration",
      "Marketing automation tools",
      "Advanced branding customization",
      "Analytics & reporting dashboard",
      "CRM integration",
      "Priority email support",
      "Custom forms builder",
    ],
    link: "/signup?plan=pro",
  },
  {
    id: "agency",
    title: "Agency",
    desc: "Complete solution for growing teams and established agencies",
    targetAudience: "Growing Teams",
    monthlyPrice: 99,
    annuallyPrice: 990,
    buttonText: "Start Free Trial",
    features: [
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
    link: "/signup?plan=agency",
  },
  // {
  //     id: "enterprise",
  //     title: "Enterprise",
  //     desc: "Full-scale AI marketing solution for large organizations",
  //     monthlyPrice: 199,
  //     annuallyPrice: 2101,
  //     badge: "Custom AI Solutions",
  //     buttonText: "Contact Sales",
  //     features: [
  //         "Unlimited AI content",
  //         "Custom AI model training",
  //         "Advanced automation workflows",
  //         "Multi-brand management",
  //         "API access",
  //         "Unlimited team members",
  //         "24/7 priority support",
  //         "Dedicated success manager",
  //     ],
  //     link: "https://stripe.com/enterprise-plan-link"
  // }
];

export const PLANS_FAQ = [
  {
    id: 1,
    question: "How does the AI content generation work?",
    answer:
      "Our AI generates high-quality marketing content across various formats including social media posts, email campaigns, and blog articles, while maintaining your brand voice.",
  },
  {
    id: 2,
    question: "Can I manage multiple brands or clients?",
    answer:
      "Yes! The Scale Pro plan supports up to 5 brands, while Enterprise offers unlimited brand management capabilities.",
  },
  {
    id: 3,
    question: "Is there a discount for annual billing?",
    answer:
      "Yes, you can save 15% by choosing annual billing over monthly billing for any of our plans.",
  },
  {
    id: 4,
    question: "Do you offer special pricing for contractors?",
    answer:
      "Yes, we offer special rates for independent contractors and small construction firms. Contact our sales team for more information.",
  },
  {
    id: 5,
    question: "How does the BIM integration work?",
    answer:
      "Our Enterprise plan includes full BIM integration, allowing you to view and manage 3D models, coordinate with team members, and track changes in real-time.",
  },
  {
    id: 6,
    question: "What kind of support do you provide?",
    answer:
      "We offer email support for Starter plans, priority support for Professional plans, and 24/7 dedicated support with a personal account manager for Enterprise plans.",
  },
  {
    id: 7,
    question: "Can I upgrade or downgrade my plan?",
    answer:
      "Yes, you can change your plan at any time. If you upgrade, you'll be prorated for the remainder of your billing period. Downgrades take effect at the next billing cycle.",
  },
  {
    id: 8,
    question: "Is mobile access available?",
    answer:
      "Yes, all plans include access to our mobile app for iOS and Android, allowing you to manage projects on the go.",
  },
  {
    id: 9,
    question: "What security measures do you have in place?",
    answer:
      "We offer industry-standard security for all plans, with additional features like SSO, audit logs, and custom security policies available in the Enterprise plan.",
  },
];

export const PLANS_TABLE = [
  {
    id: 1,
    title: "Growth Starter",
    priceMonthly: "$29",
    priceYearly: "$290",
    buttonText: "Start free trial",
    usage: {
      members: "2 members",
      contentGeneration: "1,000 words/mo",
      socialChannels: "3 channels",
      brands: "1 brand",
    },
    features: [
      "Basic AI content generation",
      "Social media scheduling",
      "Content calendar",
      "Basic analytics",
      "Email marketing templates",
      "Basic automation",
      "Mobile app access",
      "Community support",
    ],
  },
  {
    id: 2,
    title: "Scale Pro",
    priceMonthly: "$79",
    priceYearly: "$790",
    buttonText: "Scale now",
    usage: {
      members: "5 members",
      contentGeneration: "10,000 words/mo",
      socialChannels: "All platforms",
      brands: "5 brands",
    },
    features: [
      "Advanced AI content generation",
      "Custom AI training",
      "Advanced automation",
      "Campaign tracking",
      "Performance analytics",
      "A/B testing",
      "Priority support",
      "API access",
      "Advanced reporting",
    ],
  },
  {
    id: 3,
    title: "Enterprise AI",
    priceMonthly: "$199",
    priceYearly: "$1990",
    buttonText: "Contact sales",
    usage: {
      members: "Unlimited",
      contentGeneration: "Unlimited",
      socialChannels: "Unlimited",
      brands: "Unlimited",
    },
    features: [
      "Custom AI solutions",
      "Enterprise automation",
      "Multi-brand management",
      "Advanced security",
      "Custom integrations",
      "Dedicated support",
      "Custom training",
      "Enterprise analytics",
      "Custom workflows",
    ],
  },
];
