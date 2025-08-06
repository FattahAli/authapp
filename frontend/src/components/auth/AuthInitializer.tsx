"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/store/auth";

export default function AuthInitializer() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    // Initialize auth state from localStorage on client side
    initialize();
  }, [initialize]);

  return null;
}
