"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { usersApi } from "@/lib/api";
import { User } from "@/types";
import { getGenderLabel, formatDate } from "@/lib/utils";
import { User as UserIcon, Trash2 } from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import { useTheme } from "@/contexts/theme-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function UserProfilePage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated } = useAuthStore();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { theme } = useTheme();

  const userId = params.id as string;

  useEffect(() => {
    fetchUser();
  }, [userId]);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getUserById(userId);
      if (response.user) {
        setUser(response.user);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user profile");
      router.push("/users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;

    if (
      !confirm(
        `Are you sure you want to delete ${user.name}? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await usersApi.deleteUser(userId);
      toast.success(`User ${user.name} deleted successfully`);
      router.push("/users");
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error("Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <AppLayout title="">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </AppLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      {!user ? (
        <AppLayout title="">
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <UserIcon
              className={`h-12 w-12 ${
                theme === "dark" ? "text-slate-400" : "text-gray-400"
              }`}
            />
            <h3
              className={`mt-2 text-sm font-medium ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              User not found
            </h3>
            <p
              className={`mt-1 text-sm ${
                theme === "dark" ? "text-slate-400" : "text-gray-600"
              }`}
            >
              The user you're looking for doesn't exist.
            </p>
            <Button
              className="mt-4 bg-blue-600 hover:bg-blue-700"
              onClick={() => router.push("/users")}
            >
              Back to Users
            </Button>
          </div>
        </AppLayout>
      ) : (
        <AppLayout title="">
          <div className="max-w-2xl mx-auto">
            <div className="mb-6 text-center">
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                User Profile
              </h1>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                }`}
              >
                View detailed information about {user.name}
              </p>
            </div>

            <div className="flex justify-between items-center mb-6">
              <Button
                variant="outline"
                onClick={() => router.push("/users")}
                className={`${
                  theme === "dark"
                    ? "border-slate-600 text-slate-300 hover:bg-slate-700"
                    : "border-gray-300 text-gray-700 hover:bg-gray-100"
                }`}
              >
                ← Back to Users
              </Button>

              <Button
                variant="destructive"
                onClick={handleDeleteUser}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete User
              </Button>
            </div>

            <Card
              className={`${
                theme === "dark"
                  ? "bg-slate-800 border-slate-700"
                  : "bg-white border-gray-200"
              }`}
            >
              <CardHeader className="text-center">
                <div className="flex justify-center mb-6">
                  <Avatar className="h-32 w-32">
                    <AvatarImage src={user.profilePicture} />
                    <AvatarFallback
                      className={`text-3xl ${
                        theme === "dark"
                          ? "bg-slate-600 text-white"
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <CardTitle
                  className={`text-3xl ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  {user.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <h3
                      className={`text-sm font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Age
                    </h3>
                    <p
                      className={`text-lg ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.age} years old
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h3
                      className={`text-sm font-medium uppercase tracking-wide ${
                        theme === "dark" ? "text-slate-400" : "text-gray-600"
                      }`}
                    >
                      Gender
                    </h3>
                    <p
                      className={`text-lg ${
                        theme === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {user.gender
                        ? getGenderLabel(user.gender)
                        : "Not specified"}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3
                    className={`text-sm font-medium uppercase tracking-wide ${
                      theme === "dark" ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    Email
                  </h3>
                  <p
                    className={`text-lg ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user.email}
                  </p>
                </div>

                <div className="space-y-2">
                  <h3
                    className={`text-sm font-medium uppercase tracking-wide ${
                      theme === "dark" ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    Member Since
                  </h3>
                  <p
                    className={`text-lg ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </AppLayout>
      )}
    </ProtectedRoute>
  );
}
