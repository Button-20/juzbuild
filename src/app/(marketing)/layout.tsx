import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import { isLive } from "@/constants";
import Script from "next/script";
import React from "react";

interface Props {
  children: React.ReactNode;
}

const MarketingLayout = ({ children }: Props) => {
  return (
    <>
      <Navbar />
      <main className="mx-auto w-full z-40 relative">{children}</main>
      {isLive && <Footer />}

      {/* Schema.org structured data for waitlist */}
      {!isLive && (
        <Script
          id="waitlist-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebPage",
              name: "Join the Exclusive Waitlist | Juzbuild",
              description:
                "Be among the first to experience revolutionary AI-powered tools that will transform how real estate professionals work.",
              url:
                process.env.NEXT_PUBLIC_APP_URL ||
                "https://juzbuild-app.vercel.app",
              mainEntity: {
                "@type": "Organization",
                name: "Juzbuild",
                description: "AI-Powered Real Estate Platform",
                url:
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://juzbuild-app.vercel.app",
                logo: `${
                  process.env.NEXT_PUBLIC_APP_URL ||
                  "https://juzbuild-app.vercel.app"
                }/icons/logo.svg`,
                contactPoint: {
                  "@type": "ContactPoint",
                  email: "hello@juzbuild-ai.com",
                  contactType: "Customer Service",
                },
              },
              offers: {
                "@type": "Offer",
                name: "Early Access to Juzbuild",
                description:
                  "Join our exclusive waitlist for early access to AI-powered real estate tools",
                category: "Software",
                availability: "https://schema.org/PreOrder",
              },
              audience: {
                "@type": "BusinessAudience",
                audienceType: "Real Estate Professionals",
              },
            }),
          }}
        />
      )}
    </>
  );
};

export default MarketingLayout;
