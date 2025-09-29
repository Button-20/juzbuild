import { Toaster } from "@/components/ui/sonner";
import { base, heading } from "@/constants";
import { subheading } from "@/constants/fonts";
import { cn } from "@/lib";
import "@/styles/globals.css";
import { generateMetadata } from "@/utils";

export const metadata = generateMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className=" scroll-smooth">
      <body
        className={cn(
          "min-h-screen bg-background text-foreground antialiased font-heading overflow-x-hidden !scrollbar-hide",
          base.variable,
          heading.variable,
          subheading.variable
        )}
      >
        <Toaster richColors theme="dark" position="top-right" />
        {children}
      </body>
    </html>
  );
}
