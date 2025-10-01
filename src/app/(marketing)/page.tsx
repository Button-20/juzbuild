import Wrapper from "@/components/global/wrapper";
import Analysis from "@/components/marketing/analysis";
import Companies from "@/components/marketing/companies";
import CTA from "@/components/marketing/cta";
import Features from "@/components/marketing/features";
import Hero from "@/components/marketing/hero";
import Integration from "@/components/marketing/integration";
import LanguageSupport from "@/components/marketing/lang-support";
import Pricing from "@/components/marketing/pricing";
import WaitingList from "@/components/marketing/waiting-list";
import { isLive } from "@/constants";
import { generateWaitlistMetadata } from "@/utils/waitlist-metadata";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  if (!isLive) {
    return generateWaitlistMetadata();
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
    return <WaitingList />;
  }

  return (
    <Wrapper className="py-20 relative">
      <Hero />
      <Companies />
      <Features />
      <Analysis />
      <Integration />
      <Pricing />
      <LanguageSupport />
      <CTA />
    </Wrapper>
  );
};

export default HomePage;
