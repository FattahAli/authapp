"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { OAuthButtons } from "@/components/ui/oauth-buttons";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import PublicRoute from "@/components/auth/PublicRoute";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [error, setError] = useState("");
  const { theme } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError("");
      await login(data.email, data.password);
      toast.success("Login successful!");
      router.push("/users");
    } catch (error: any) {
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      toast.error(message);
    }
  };

  const handleOAuthSuccess = () => {
    router.push("/users");
  };

  const handleOAuthError = (error: string) => {
    setError(error);
  };

  return (
    <PublicRoute>
      <div
        className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 ${
          theme === "dark" ? "bg-slate-900" : "bg-gray-50"
        }`}
      >
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h2
              className={`mt-6 text-3xl font-extrabold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Sign in to your account
            </h2>
            <p
              className={`mt-2 text-sm ${
                theme === "dark" ? "text-slate-400" : "text-gray-600"
              }`}
            >
              Or{" "}
              <Link
                href="/signup"
                className={`font-medium ${
                  theme === "dark"
                    ? "text-blue-400 hover:text-blue-300"
                    : "text-blue-600 hover:text-blue-500"
                }`}
              >
                create a new account
              </Link>
            </p>
          </div>

          <Card
            className={`${
              theme === "dark"
                ? "bg-slate-800 border-slate-700"
                : "bg-white border-gray-200"
            }`}
          >
            <CardHeader>
              <CardTitle
                className={theme === "dark" ? "text-white" : "text-gray-900"}
              >
                Login
              </CardTitle>
              <CardDescription
                className={
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                }
              >
                Enter your credentials to access your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* OAuth Buttons */}
              <OAuthButtons
                onSuccess={handleOAuthSuccess}
                onError={handleOAuthError}
              />

              {/* Divider */}
              <div className="relative">
                <div
                  className={`absolute inset-0 flex items-center ${
                    theme === "dark" ? "border-slate-600" : "border-gray-300"
                  }`}
                >
                  <span
                    className={`w-full border-t ${
                      theme === "dark" ? "border-slate-600" : "border-gray-300"
                    }`}
                  />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span
                    className={`px-2 ${
                      theme === "dark"
                        ? "bg-slate-800 text-slate-400"
                        : "bg-white text-gray-500"
                    }`}
                  >
                    Or continue with
                  </span>
                </div>
              </div>

              {/* Email/Password Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label
                    htmlFor="email"
                    className={
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }
                  >
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    {...register("email")}
                    className={`${
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    } ${errors.email ? "border-red-500" : ""}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-400">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="password"
                    className={
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }
                  >
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    {...register("password")}
                    className={`${
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    } ${errors.password ? "border-red-500" : ""}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-400">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {error && (
                  <div className="text-sm text-red-400 bg-red-900/20 p-3 rounded-md border border-red-800">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign in"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}
