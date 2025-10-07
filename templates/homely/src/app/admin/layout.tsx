import AdminAuthGuard from "@/components/Auth/AdminAuthGuard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard - Real Estate Agency",
  description: "Admin dashboard for managing real estate properties",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">{children}</div>
    </AdminAuthGuard>
  );
}
