"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface UseAdminAuthReturn {
  isAdmin: boolean;
  isLoading: boolean;
  session: any;
  redirectToSignin: () => void;
}

export function useAdminAuth(): UseAdminAuthReturn {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session) {
      setIsAdmin(false);
      return;
    }

    setIsAdmin(session.user?.role === "admin");
  }, [session, status]);

  const redirectToSignin = () => {
    const callbackUrl = encodeURIComponent(window.location.pathname);
    router.push(`/auth/signin?callbackUrl=${callbackUrl}`);
  };

  return {
    isAdmin,
    isLoading: status === "loading",
    session,
    redirectToSignin,
  };
}

// Higher-order component for admin route protection
export function withAdminAuth<T extends object>(
  Component: React.ComponentType<T>
) {
  return function AdminProtectedComponent(props: T) {
    const { isAdmin, isLoading, redirectToSignin } = useAdminAuth();

    useEffect(() => {
      if (!isLoading && !isAdmin) {
        redirectToSignin();
      }
    }, [isAdmin, isLoading, redirectToSignin]);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    if (!isAdmin) {
      return null; // Component will redirect
    }

    return <Component {...props} />;
  };
}
