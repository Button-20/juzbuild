"use client";

import Footer from "@/components/Layout/Footer";
import Header from "@/components/Layout/Header";

export default function ConditionalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
