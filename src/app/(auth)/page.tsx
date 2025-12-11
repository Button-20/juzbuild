import Wrapper from "@/components/global/wrapper";
import Analysis from "@/components/marketing/analysis";
import ComingSoon from "@/components/marketing/coming-soon";
import Companies from "@/components/marketing/companies";
import ContactForm from "@/components/marketing/contact-form";
import CTA from "@/components/marketing/cta";
import Features from "@/components/marketing/features";
import Hero from "@/components/marketing/hero";
import Integration from "@/components/marketing/integration";
import PropertyAnalytics from "@/components/marketing/lang-support";
import Pricing from "@/components/marketing/pricing";
import { isLive } from "@/constants";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  if (!isLive) {
    return {
      title: "Juzbuild - Coming Soon",
      description:
        "We're building the future of AI-powered real estate platforms. Coming soon.",
    };
  }

  // Return default metadata for live site
  return {
    title: "Juzbuild - AI-Powered Real Estate Platform",
    description:
      "Transform how property professionals work with AI-powered automation, predictive analytics, and seamless collaboration tools.",
  };
}

const HomePage = () => {
  if (!isLive) {
    return <ComingSoon />;
  }

  return (
    <Wrapper className="py-20 relative">
      <Hero />
      <Companies />
      <Features />
      <Analysis />
      <Integration />
      <Pricing />
      <PropertyAnalytics />
      <CTA />
      <ContactForm />
    </Wrapper>
  );
};

export default HomePage;
