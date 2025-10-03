import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { base, heading } from "@/constants";
import { subheading } from "@/constants/fonts";
import { AuthProvider } from "@/contexts/AuthContext";
import { cn } from "@/lib";
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
        <AuthProvider>
          <Toaster richColors theme="dark" position="top-right" />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
