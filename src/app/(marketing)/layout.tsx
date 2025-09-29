import Footer from "@/components/marketing/footer";
import Navbar from "@/components/marketing/navbar";
import { isLive } from "@/constants";
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
    </>
  );
};

export default MarketingLayout;
