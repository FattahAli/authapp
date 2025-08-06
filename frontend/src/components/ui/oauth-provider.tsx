"use client";

import { useEffect } from "react";

export function OAuthProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Google OAuth
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          // Handle Google OAuth response
          console.log("Google OAuth response:", response);
        },
      });
    }
  }, []);

  return <>{children}</>;
}
