import { Metadata } from "next";

/**
 * Get the base URL from environment variable
 * Uses environment variable as headers() is not reliable at build time
 */
function getBaseUrl(): string {
  // For server-side metadata generation, use environment variable
  // The environment should be configured for each deployment environment
  return process.env.NEXT_PUBLIC_APP_URL || "https://juzbuild.com";
}

export const generateWaitlistMetadata = (): Metadata => {
  const baseUrl = getBaseUrl();

  return {
    title:
      "Join the Exclusive Waitlist | Juzbuild - AI-Powered Real Estate Platform",
    description:
      "Be among the first to experience revolutionary AI-powered tools that will transform how real estate professionals work. Join thousands of property professionals waiting for early access to Juzbuild.",
    keywords: [
      "real estate waitlist",
      "AI real estate platform early access",
      "property management software beta",
      "real estate automation waitlist",
      "property professionals early access",
      "real estate AI tools preview",
      "property lead management beta",
      "real estate SaaS waitlist",
      "Juzbuild early access",
      "property analytics preview",
    ],
    openGraph: {
      title: "Join the Exclusive Waitlist | Juzbuild - AI Real Estate Platform",
      description:
        "Be among the first to experience revolutionary AI-powered tools for real estate professionals. Join our exclusive waitlist for early access.",
      url: `${baseUrl}`,
      siteName: "Juzbuild",
      images: [
        {
          url: `${baseUrl}/images/og-waitlist.jpg`,
          width: 1200,
          height: 630,
          alt: "Juzbuild - AI-Powered Real Estate Platform Waitlist",
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "Join the Exclusive Waitlist | Juzbuild - AI Real Estate Platform",
      description:
        "Be among the first to experience revolutionary AI-powered tools for real estate professionals. Join our exclusive waitlist for early access.",
      images: [`${baseUrl}/images/og-waitlist.jpg`],
      creator: "@juzbuild",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    alternates: {
      canonical: baseUrl,
    },
    other: {
      "application-name": "Juzbuild",
      "apple-mobile-web-app-title": "Juzbuild Waitlist",
      "apple-mobile-web-app-capable": "yes",
      "apple-mobile-web-app-status-bar-style": "default",
      "format-detection": "telephone=no",
    },
  };
};
