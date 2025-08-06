"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleOAuthCallback } from "@/lib/supabase";
import { useAuthStore } from "@/store/auth";
import { OAuthProvider } from "@/types";
import toast from "react-hot-toast";

export default function AuthCallbackPage() {
  const router = useRouter();
  const { oauthLogin } = useAuthStore();
  const [isProcessing, setIsProcessing] = useState(true);
  const [hasShownToast, setHasShownToast] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const processCallback = async () => {
      try {
        setIsProcessing(true);
        console.log("Processing OAuth callback...");

        const { session } = await handleOAuthCallback();
        console.log("Supabase session:", session);
        console.log("Session user:", session?.user);
        console.log(
          "Session access token:",
          session?.access_token?.substring(0, 50) + "..."
        );

        if (!isMounted) return;

        if (session?.user) {
          // Extract user data from Supabase session
          const userData = {
            id: session.user.id,
            email: session.user.email!,
            name: session.user.user_metadata?.full_name || session.user.email!,
            picture: session.user.user_metadata?.avatar_url,
          };

          console.log("Extracted user data:", userData);

          // Convert Supabase session to our OAuth format
          const accessToken = session.access_token;
          console.log("Access token length:", accessToken?.length);

          try {
            // Use our existing OAuth login flow
            const response = await oauthLogin(
              OAuthProvider.GOOGLE,
              accessToken,
              {
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
              }
            );

            if (!isMounted) return;

            console.log("OAuth login successful");
            console.log("Response:", response);
            console.log("Response isNewUser:", response.isNewUser);
            console.log("Response user:", response.user);

            // Only show success toast if we haven't shown an error toast
            if (!hasShownToast) {
              console.log("Showing success toast");
              toast.success("Google login successful!");
              setHasShownToast(true);
              console.log("Success toast shown");
            }

            // Check if user is new and redirect accordingly
            const isNewUser = response.isNewUser;
            console.log("Is new user:", isNewUser);

            // Use a more reliable navigation method
            setTimeout(() => {
              if (!isMounted) return;

              const redirectPath = isNewUser ? "/profile" : "/users";
              console.log(`Starting navigation to ${redirectPath}`);
              try {
                // Try router.push first
                router.push(redirectPath);
                console.log("Router navigation successful");
              } catch (routerError) {
                console.error("Router error:", routerError);
                // Fallback to window.location
                try {
                  window.location.href = redirectPath;
                  console.log("Window location navigation successful");
                } catch (locationError) {
                  console.error("Location error:", locationError);
                  // Last resort - try to navigate programmatically
                  window.history.pushState({}, "", redirectPath);
                  window.location.reload();
                }
              }
            }, 500); 
          } catch (oauthError: any) {
            if (!isMounted) return;

            console.error("OAuth login error:", oauthError);

            if (!hasShownToast) {
              if (oauthError.response?.status === 409) {
                const errorData = oauthError.response?.data;

                if (errorData?.requiresPassword) {
                  toast.error(
                    "Email already registered. Please use your password to sign in."
                  );
                } else if (errorData?.existingProvider) {
                  const errorMessage =
                    errorData.message ||
                    "Email already associated with another account";
                  toast.error(errorMessage);
                } else {
                  const errorMessage =
                    errorData?.message ||
                    "Email already associated with another account";
                  toast.error(errorMessage);
                }
              } else {
                toast.error("OAuth login failed");
              }
              setHasShownToast(true);
            }

            // Navigate to login on error
            setTimeout(() => {
              if (!isMounted) return;

              try {
                router.push("/login");
              } catch (navigationError) {
                console.error("Navigation error:", navigationError);
                window.location.href = "/login";
              }
            }, 1000);
          }
        } else {
          if (!isMounted) return;

          console.error("No session or user found");
          if (!hasShownToast) {
            toast.error("Authentication failed");
            setHasShownToast(true);
          }
          setTimeout(() => {
            if (!isMounted) return;

            try {
              router.push("/login");
            } catch (navigationError) {
              console.error("Navigation error:", navigationError);
              window.location.href = "/login";
            }
          }, 1000);
        }
      } catch (error) {
        if (!isMounted) return;

        console.error("OAuth callback error:", error);
        if (!hasShownToast) {
          toast.error("Authentication failed");
          setHasShownToast(true);
        }
        setTimeout(() => {
          if (!isMounted) return;

          try {
            router.push("/login");
          } catch (navigationError) {
            console.error("Navigation error:", navigationError);
            window.location.href = "/login";
          }
        }, 1000);
      } finally {
        if (isMounted) {
          setIsProcessing(false);
        }
      }
    };

    processCallback();

    return () => {
      isMounted = false;
    };
  }, [router, oauthLogin, hasShownToast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-white text-lg">
          {isProcessing ? "Processing authentication..." : "Redirecting..."}
        </p>
      </div>
    </div>
  );
}
