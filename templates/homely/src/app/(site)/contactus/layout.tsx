import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | Homely",
  description:
    "Get in touch with our expert real estate team. We're here to help you find your dream home or sell your property with personalized guidance and market expertise.",
};

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
