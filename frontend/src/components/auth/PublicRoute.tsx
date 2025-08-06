"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function PublicRoute({
  children,
  redirectTo = "/users",
}: PublicRouteProps) {
  const router = useRouter();
  const { isAuthenticated, getMe, isLoading } = useAuthStore();
  const hasCheckedAuth = useRef(false);
  const hasFailedAuth = useRef(false);

  useEffect(() => {
    // Only check auth if we haven't checked before and haven't failed
    if (!hasCheckedAuth.current && !hasFailedAuth.current) {
      hasCheckedAuth.current = true;
      getMe().catch(() => {
        // If getMe fails, mark as failed to prevent further calls
        hasFailedAuth.current = true;
      });
    }
  }, [getMe]);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  // Show loading spinner only during initial auth check
  if (isLoading && !hasCheckedAuth.current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is authenticated, don't render the children (will redirect)
  if (isAuthenticated) {
    return null;
  }

  // If user is not authenticated, render the children (login/signup pages)
  return <>{children}</>;
}
