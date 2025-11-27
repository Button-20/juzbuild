import { Metadata } from "next";

interface MetadataProps {
  title?: string;
  description?: string;
  icons?: Metadata["icons"];
  noIndex?: boolean;
  keywords?: string[];
  author?: string;
  twitterHandle?: string;
  type?: "website" | "article" | "profile";
  locale?: string;
  alternates?: Record<string, string>;
  publishedTime?: string;
  modifiedTime?: string;
}

/**
 * Get the base URL from request headers or environment variable
 * Uses environment variable as headers() is not reliable at build time
 */
function getBaseUrl(): string {
  // For server-side metadata generation, use environment variable
  // The environment should be configured for each deployment environment
  return process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
}

export const generateMetadata = ({
  title = `Juzbuild - AI-Powered Real Estate Platform`,
  description = `Juzbuild is an AI-powered real estate platform that transforms how property professionals work. Join thousands on our exclusive waitlist for early access to intelligent automation, predictive analytics, and seamless collaboration tools.`,
  icons = [
    {
      rel: "icon",
      url: "/icons/icon-dark.png",
      media: "(prefers-color-scheme: light)",
    },
    {
      rel: "icon",
      url: "/icons/icon.png",
      media: "(prefers-color-scheme: dark)",
    },
  ],
  noIndex = false,
  keywords = [
    "AI real estate platform",
    "property management software",
    "real estate automation",
    "property analytics",
    "real estate CRM",
    "property lead management",
    "real estate AI tools",
    "property collaboration",
    "real estate workflow",
    "property professionals",
    "real estate SaaS",
    "property management AI",
  ],
  author = process.env.NEXT_PUBLIC_AUTHOR_NAME,
  type = "website",
}: MetadataProps = {}): Metadata => {
  const metadataBase = new URL(getBaseUrl());

  return {
    metadataBase,
    title: {
      template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME}`,
      default: title,
    },
    description,
    keywords,
    authors: [{ name: author }],
    creator: author,
    publisher: process.env.NEXT_PUBLIC_APP_NAME,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    icons,
  };
};
