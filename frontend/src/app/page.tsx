"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, getMe, isLoading, initialize } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state from localStorage first
    initialize();
    setIsInitialized(true);
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      const checkAuth = async () => {
        try {
          await getMe();
        } catch (error) {
          console.error("Auth check failed:", error);
        }
      };

      checkAuth();
    }
  }, [isInitialized, isLoading, getMe]);

  useEffect(() => {
    if (isInitialized && !isLoading) {
      if (isAuthenticated) {
        router.push("/users");
      } else {
        router.push("/login");
      }
    }
  }, [isAuthenticated, isLoading, isInitialized, router]);

  if (isLoading || !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return null;
}
