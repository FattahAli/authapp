"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    google: any;
  }
}

export function GoogleOAuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: (response: any) => {
          console.log("Google OAuth response:", response);
        },
      });
    }
  }, []);

  return <>{children}</>;
}
