"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { usersApi, authApi } from "@/lib/api";
import { Gender } from "@/types";
import { Save, Trash2, Lock } from "lucide-react";
import AppLayout from "@/components/layout/AppLayout";
import { useTheme } from "@/contexts/theme-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  age: z
    .number()
    .min(1, "Age must be at least 1")
    .max(120, "Age must be less than 120"),
  gender: z.nativeEnum(Gender, {
    errorMap: () => ({ message: "Please select a gender" }),
  }),
  profilePicture: z.instanceof(File).optional(),
});

const passwordResetSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const watchedGender = watch("gender");

  useEffect(() => {
    if (user) {
      setValue("name", user.name);
      setValue("age", user.age || 18);
      setValue("gender", user.gender || Gender.PREFER_NOT_TO_SAY);
    }
  }, [user, setValue]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setValue("profilePicture", file);

      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: ProfileFormData) => {
    try {
      setIsLoading(true);

      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("age", data.age.toString());
      formData.append("gender", data.gender);

      if (selectedFile) {
        formData.append("profilePicture", selectedFile);
      }

      const response = await usersApi.updateProfile(formData);
      if (response.user) {
        setUser(response.user);
        toast.success("Profile updated successfully!");
      }
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update profile";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordResetFormData) => {
    try {
      setIsPasswordLoading(true);

      await authApi.resetPassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      toast.success("Password updated successfully!");
      setShowPasswordReset(false);
      resetPasswordForm();
    } catch (error: any) {
      const message =
        error.response?.data?.message || "Failed to update password";
      toast.error(message);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    if (
      !confirm(
        `Are you sure you want to delete your account? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setIsDeleteLoading(true);
      await usersApi.deleteUser(user.id);
      toast.success("Account deleted successfully!");

      // Logout and redirect to login
      localStorage.removeItem("auth");
      router.push("/login");
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account");
    } finally {
      setIsDeleteLoading(false);
    }
  };

  // Check if user has a password (non-OAuth user only)
  const hasPassword = user && !user.oauthProvider;

  return (
    <ProtectedRoute>
      <AppLayout title="">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h1
              className={`text-3xl font-bold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              Edit Profile
            </h1>
            <p
              className={`text-lg ${
                theme === "dark" ? "text-slate-400" : "text-gray-600"
              }`}
            >
              Update your profile information and settings
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
                Profile Information
              </CardTitle>
              <CardDescription
                className={
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                }
              >
                Update your profile information and profile picture
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Profile Picture Section */}
                <div className="space-y-4">
                  <Label className="text-white">Profile Picture</Label>
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-20 w-20">
                      <AvatarImage src={previewUrl || user?.profilePicture} />
                      <AvatarFallback className="text-lg bg-slate-600 text-white">
                        {user?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className={`cursor-pointer ${
                          theme === "dark"
                            ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                            : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                        }`}
                      />
                      <p
                        className={`text-sm mt-1 ${
                          theme === "dark" ? "text-slate-400" : "text-gray-500"
                        }`}
                      >
                        Upload a new profile picture (optional)
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="name"
                    className={
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }
                  >
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    {...register("name")}
                    className={`${
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    } ${errors.name ? "border-red-500" : ""}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Age Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="age"
                    className={
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }
                  >
                    Age
                  </Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="Enter your age"
                    {...register("age", { valueAsNumber: true })}
                    className={`${
                      theme === "dark"
                        ? "bg-slate-700 border-slate-600 text-white placeholder:text-slate-400"
                        : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-500"
                    } ${errors.age ? "border-red-500" : ""}`}
                  />
                  {errors.age && (
                    <p className="text-sm text-red-400">{errors.age.message}</p>
                  )}
                </div>

                {/* Gender Field */}
                <div className="space-y-2">
                  <Label
                    htmlFor="gender"
                    className={
                      theme === "dark" ? "text-white" : "text-gray-700"
                    }
                  >
                    Gender
                  </Label>
                  <Select
                    value={watchedGender || user?.gender}
                    onValueChange={(value) =>
                      setValue("gender", value as Gender)
                    }
                  >
                    <SelectTrigger
                      className={`${
                        theme === "dark"
                          ? "bg-slate-700 border-slate-600 text-white"
                          : "bg-white border-gray-300 text-gray-900"
                      } ${errors.gender ? "border-red-500" : ""}`}
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
                  {errors.gender && (
                    <p className="text-sm text-red-400">
                      {errors.gender.message}
                    </p>
                  )}
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={isLoading}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </form>

              {/* Password Reset Section - Only for non-OAuth users */}
              {hasPassword && !user?.oauthProvider && (
                <div className="mt-8 pt-6 border-t border-slate-600">
                  <div className="space-y-4">
                    <div>
                      <h3
                        className={`text-lg font-semibold ${
                          theme === "dark" ? "text-blue-300" : "text-blue-600"
                        }`}
                      >
                        Password Settings
                      </h3>
                      <p
                        className={`text-sm ${
                          theme === "dark" ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        Update your password to keep your account secure.
                      </p>
                    </div>

                    {!showPasswordReset ? (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowPasswordReset(true)}
                        className={`w-full ${
                          theme === "dark"
                            ? "border-blue-600 text-blue-300 hover:bg-blue-600/10"
                            : "border-blue-600 text-blue-600 hover:bg-blue-50"
                        }`}
                      >
                        <Lock className="h-4 w-4 mr-2" />
                        Change Password
                      </Button>
                    ) : (
                      <form
                        onSubmit={handlePasswordSubmit(onPasswordSubmit)}
                        className="space-y-4"
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="currentPassword"
                            className="text-white"
                          >
                            Current Password
                          </Label>
                          <Input
                            id="currentPassword"
                            type="password"
                            placeholder="Enter your current password"
                            {...registerPassword("currentPassword")}
                            className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                              passwordErrors.currentPassword
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {passwordErrors.currentPassword && (
                            <p className="text-sm text-red-400">
                              {passwordErrors.currentPassword.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="newPassword" className="text-white">
                            New Password
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter your new password"
                            {...registerPassword("newPassword")}
                            className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                              passwordErrors.newPassword ? "border-red-500" : ""
                            }`}
                          />
                          {passwordErrors.newPassword && (
                            <p className="text-sm text-red-400">
                              {passwordErrors.newPassword.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="confirmPassword"
                            className="text-white"
                          >
                            Confirm New Password
                          </Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            placeholder="Confirm your new password"
                            {...registerPassword("confirmPassword")}
                            className={`bg-slate-700 border-slate-600 text-white placeholder:text-slate-400 ${
                              passwordErrors.confirmPassword
                                ? "border-red-500"
                                : ""
                            }`}
                          />
                          {passwordErrors.confirmPassword && (
                            <p className="text-sm text-red-400">
                              {passwordErrors.confirmPassword.message}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button
                            type="submit"
                            className={`flex-1 ${
                              theme === "dark"
                                ? "bg-blue-600 hover:bg-blue-700"
                                : "bg-blue-600 hover:bg-blue-700"
                            }`}
                            disabled={isPasswordLoading}
                          >
                            <Lock className="h-4 w-4 mr-2" />
                            {isPasswordLoading
                              ? "Updating..."
                              : "Update Password"}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setShowPasswordReset(false);
                              resetPasswordForm();
                            }}
                            className={`flex-1 ${
                              theme === "dark"
                                ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                                : "border-gray-300 text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {/* Delete Account Section */}
              <div className="mt-8 pt-6 border-t border-slate-600">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-red-400">
                      Danger Zone
                    </h3>
                    <p className="text-sm text-slate-400">
                      Once you delete your account, there is no going back.
                      Please be certain.
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleteLoading}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDeleteLoading ? "Deleting..." : "Delete Account"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    </ProtectedRoute>
  );
}
