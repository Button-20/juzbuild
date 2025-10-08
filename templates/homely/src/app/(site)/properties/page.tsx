import PropertiesListing from "@/components/Properties/PropertyList";
import HeroSub from "@/components/shared/HeroSub";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Property List | Homely",
};

const page = () => {
  return (
    <>
      <HeroSub
        title="Discover inspiring designed homes."
        description="Experience elegance and comfort with our exclusive luxury  villas, designed for sophisticated living."
        badge="Properties"
      />
      <PropertiesListing />
    </>
  );
};

export default page;
