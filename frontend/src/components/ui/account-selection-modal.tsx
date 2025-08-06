"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { OAuthProvider, Gender } from "@/types";
import { useAuthStore } from "@/store/auth";
import { useTheme } from "@/contexts/theme-context";
import { User, Camera } from "lucide-react";
import toast from "react-hot-toast";

interface AccountSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  provider: OAuthProvider;
  userData: {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };
}

export function AccountSelectionModal({
  isOpen,
  onClose,
  onSuccess,
  provider,
  userData,
}: AccountSelectionModalProps) {
  const { oauthLogin, isLoading } = useAuthStore();
  const { theme } = useTheme();
  const [isNewUser, setIsNewUser] = useState(false);
  const [isCheckingUser, setIsCheckingUser] = useState(true);
  const [userExists, setUserExists] = useState(false);
  const [formData, setFormData] = useState({
    name: userData.name,
    gender: Gender.PREFER_NOT_TO_SAY,
    age: "",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    userData.picture || null
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setIsNewUser(false);
      setIsCheckingUser(false);
    }
  }, [isOpen]);

  const handleExistingUser = async () => {
    try {
      const accessToken = userData.id; // This will be the Google JWT token
      const response = await oauthLogin(provider, accessToken);

      if (response.isNewUser) {
        toast.success(
          `${provider} login successful! Please complete your profile.`
        );
        onClose();
        // Redirect to profile page for new users
        window.location.href = "/profile";
      } else {
        toast.success(`${provider} login successful!`);
        onClose();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("OAuth login error:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Login failed";

      // Check if the error indicates user doesn't exist
      if (
        error.response?.status === 404 &&
        error.response?.data?.requiresNewAccount
      ) {
        setIsNewUser(true);
        toast("Account not found. Please create a new account.");
      } else if (error.response?.status === 409) {
        const errorData = error.response?.data;

        if (errorData?.requiresPassword) {
          // Email exists with password, redirect to login
          toast.error(
            "Email already registered. Please use your password to sign in."
          );
          onClose();
        } else if (errorData?.existingProvider) {
          // Email associated with different OAuth provider
          toast.error(errorMessage);
          onClose();
        } else {
          // Other 409 errors
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleNewUser = async () => {
    try {
      if (!formData.name.trim()) {
        toast.error("Name is required");
        return;
      }

      if (!formData.age || parseInt(formData.age) < 1) {
        toast.error("Please enter a valid age");
        return;
      }

      // Create new user with custom data
      const accessToken = userData.id; // Use the real OAuth token
      const userDataToSend = {
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
      };

      const response = await oauthLogin(provider, accessToken, userDataToSend);

      if (response.isNewUser) {
        toast.success(
          "Account created successfully! Please complete your profile."
        );
        onClose();
        // Redirect to profile page for new users
        window.location.href = "/profile";
      } else {
        toast.success("Account created successfully!");
        onClose();
        onSuccess?.();
      }
    } catch (error: any) {
      console.error("Account creation error:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Account creation failed";

      if (error.response?.status === 409) {
        const errorData = error.response?.data;

        if (errorData?.requiresPassword) {
          // Email exists with password, redirect to login
          toast.error(
            "Email already registered. Please use your password to sign in."
          );
          onClose();
        } else if (errorData?.existingProvider) {
          // Email associated with different OAuth provider
          toast.error(errorMessage);
          onClose();
        } else {
          // Other 409 errors
          toast.error(errorMessage);
        }
      } else {
        toast.error(errorMessage);
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className={`${
          theme === "dark"
            ? "bg-slate-800 border-slate-700"
            : "bg-white border-gray-200"
        }`}
      >
        <DialogHeader>
          <DialogTitle
            className={theme === "dark" ? "text-white" : "text-gray-900"}
          >
            {isNewUser ? "Create New Account" : "Sign In or Create Account"}
          </DialogTitle>
          <DialogDescription
            className={theme === "dark" ? "text-slate-400" : "text-gray-600"}
          >
            {isNewUser
              ? "Please complete your profile information"
              : `Welcome! Choose how you'd like to proceed with ${userData.email}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Info Display */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-slate-100 dark:bg-slate-700">
            <Avatar className="h-16 w-16">
              <AvatarImage src={previewUrl || undefined} />
              <AvatarFallback className="text-lg bg-indigo-600 text-white">
                {userData.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3
                className={`font-medium ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {userData.name}
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-slate-300" : "text-gray-600"
                }`}
              >
                {userData.email}
              </p>
              <p
                className={`text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-gray-500"
                }`}
              >
                {provider} Account
              </p>
            </div>
          </div>

          {isNewUser ? (
            /* New User Form */
            <div className="space-y-4">
              <div className="space-y-2">
                <Label
                  className={theme === "dark" ? "text-white" : "text-gray-700"}
                >
                  Profile Picture
                </Label>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={previewUrl || undefined} />
                    <AvatarFallback className="text-lg bg-indigo-600 text-white">
                      {formData.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className={`cursor-pointer ${
                        theme === "dark"
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      }`}
                    />
                    <p
                      className={`text-sm mt-1 ${
                        theme === "dark" ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      Upload a profile picture (optional)
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="name"
                  className={theme === "dark" ? "text-white" : "text-gray-700"}
                >
                  Full Name
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className={`${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="age"
                  className={theme === "dark" ? "text-white" : "text-gray-700"}
                >
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) =>
                    setFormData({ ...formData, age: e.target.value })
                  }
                  className={`${
                    theme === "dark"
                      ? "bg-slate-700 border-slate-600 text-white"
                      : "bg-white border-gray-300 text-gray-900"
                  }`}
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="gender"
                  className={theme === "dark" ? "text-white" : "text-gray-700"}
                >
                  Gender
                </Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) =>
                    setFormData({ ...formData, gender: value as Gender })
                  }
                >
                  <SelectTrigger
                    className={`${
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white"
                        : "bg-white border-gray-300 text-gray-900"
                    }`}
                  >
                    <SelectValue placeholder="Select your gender" />
                  </SelectTrigger>
                  <SelectContent
                    className={
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600"
                        : "bg-white border-gray-300"
                    }
                  >
                    <SelectItem
                      value={Gender.MALE}
                      className={
                        theme === "dark"
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Male
                    </SelectItem>
                    <SelectItem
                      value={Gender.FEMALE}
                      className={
                        theme === "dark"
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Female
                    </SelectItem>
                    <SelectItem
                      value={Gender.OTHER}
                      className={
                        theme === "dark"
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Other
                    </SelectItem>
                    <SelectItem
                      value={Gender.PREFER_NOT_TO_SAY}
                      className={
                        theme === "dark"
                          ? "text-white hover:bg-slate-600"
                          : "text-gray-900 hover:bg-gray-100"
                      }
                    >
                      Prefer not to say
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex space-x-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsNewUser(false)}
                  className="flex-1"
                  disabled={isLoading}
                >
                  Back
                </Button>
                <Button
                  onClick={handleNewUser}
                  className="flex-1"
                  disabled={isLoading}
                >
                  {isLoading ? "Creating..." : "Create Account"}
                </Button>
              </div>
            </div>
          ) : (
            /* Account Options */
            <div className="space-y-4">
              <div className="text-center">
                <p
                  className={`text-sm ${
                    theme === "dark" ? "text-slate-300" : "text-gray-600"
                  }`}
                >
                  Choose how you'd like to proceed:
                </p>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleExistingUser}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? "Signing in..." : "Sign In (if account exists)"}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setIsNewUser(true)}
                  className="w-full"
                  disabled={isLoading}
                >
                  Create New Account
                </Button>
              </div>

              <div className="text-center">
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-sm"
                  disabled={isLoading}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
