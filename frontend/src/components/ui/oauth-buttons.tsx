"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { OAuthProvider } from "@/types";
import { useAuthStore } from "@/store/auth";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import toast from "react-hot-toast";
import { useTheme } from "@/contexts/theme-context";
import { AccountSelectionModal } from "./account-selection-modal";
import { signInWithGoogle } from "@/lib/supabase";

declare global {
  interface Window {
    google: any;
  }
}

interface OAuthButtonsProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export function OAuthButtons({ onSuccess, onError }: OAuthButtonsProps) {
  const { oauthLogin, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] =
    useState<OAuthProvider | null>(null);
  const [userData, setUserData] = useState<any>(null);

  const handleGoogleLogin = async () => {
    try {
      // Use Supabase OAuth instead of direct Google OAuth
      await signInWithGoogle();
      // The redirect will happen automatically
    } catch (error: any) {
      const message = error.message || "Google login failed";
      toast.error(message);
      onError?.(message);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      // For now, use demo mode for Facebook
      const demoUserData = {
        id: `simple_facebook_auth_${Date.now()}`,
        email: `demo.facebook${Date.now()}@example.com`,
        name: `Demo Facebook User ${Date.now() % 1000}`,
        picture: `https://ui-avatars.com/api/?name=F${
          Date.now() % 1000
        }&background=1877f2&color=ffffff&size=150`,
      };
      setUserData(demoUserData);
      setSelectedProvider(OAuthProvider.FACEBOOK);
      setModalOpen(true);
    } catch (error: any) {
      const message = error.message || "Facebook login failed";
      toast.error(message);
      onError?.(message);
    }
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedProvider(null);
    setUserData(null);
  };

  const handleModalSuccess = () => {
    onSuccess?.();
  };

  return (
    <>
      <div className="space-y-3">
        <Button
          type="button"
          variant="outline"
          className={`w-full ${
            theme === "dark"
              ? "bg-white text-gray-700 hover:bg-gray-100 hover:text-gray-800 border-gray-300"
              : "bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-800 border-gray-300"
          }`}
          onClick={handleGoogleLogin}
          disabled={isLoading}
        >
          <FcGoogle className="mr-2 h-5 w-5" />
          Continue with Google
        </Button>

        <Button
          type="button"
          variant="outline"
          className="w-full bg-blue-600 text-white hover:bg-blue-700 border-blue-600"
          onClick={handleFacebookLogin}
          disabled={isLoading}
        >
          <FaFacebook className="mr-2 h-5 w-5" />
          Continue with Facebook
        </Button>
      </div>

      {modalOpen && selectedProvider && userData && (
        <AccountSelectionModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
          provider={selectedProvider}
          userData={userData}
        />
      )}
    </>
  );
}
