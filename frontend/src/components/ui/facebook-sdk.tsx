"use client";

import { useEffect } from "react";

export function FacebookSDK() {
  useEffect(() => {
    if (typeof window !== "undefined" && window.FB) {
      window.FB.init({
        appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID,
        cookie: true,
        xfbml: true,
        version: "v18.0",
      });
    }
  }, []);

  return null;
}

declare global {
  interface Window {
    FB: any;
  }
}
