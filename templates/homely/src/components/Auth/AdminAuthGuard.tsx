"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminAuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function AdminAuthGuard({
  children,
  fallback,
}: AdminAuthGuardProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      return; // Still loading
    }

    if (!session) {
      // Not authenticated, redirect to signin with callback
      const callbackUrl = encodeURIComponent(window.location.pathname);
      router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
      return;
    }

    if (session.user?.role !== "admin") {
      // Not authorized as admin, redirect to home
      router.push("/");
      return;
    }

    // User is authenticated and authorized
    setIsAuthorized(true);
  }, [session, status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8 p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">
              Checking authentication...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!session || session.user?.role !== "admin") {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="max-w-md w-full space-y-8 p-8">
            <div className="text-center">
              <div className="animate-pulse">
                <div className="h-12 w-12 bg-gray-300 rounded-full mx-auto mb-4"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto"></div>
              </div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                Redirecting...
              </p>
            </div>
          </div>
        </div>
      )
    );
  }

  return isAuthorized ? <>{children}</> : null;
}
