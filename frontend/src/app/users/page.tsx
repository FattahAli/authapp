"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import { usersApi } from "@/lib/api";
import { User, UsersResponse } from "@/types";
import { getGenderLabel } from "@/lib/utils";
import {
  User as UserIcon,
  Calendar,
  User as UserIcon2,
  Mail,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import AppLayout from "@/components/layout/AppLayout";
import { useTheme } from "@/contexts/theme-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { Pagination } from "@/components/ui/pagination";
import { ViewToggle } from "@/components/ui/view-toggle";

export default function UsersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const { theme } = useTheme();

  useEffect(() => {
    fetchUsers();
  }, [currentPage]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAllUsers(currentPage, 10);
      if (response.users && response.pagination) {
        setUsers(response.users);
        setPagination(response.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserClick = (userId: string) => {
    router.push(`/users/${userId}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleViewChange = (view: "cards" | "list") => {
    setViewMode(view);
  };

  const renderUserCard = (user: User) => (
    <Card
      key={user.id}
      className={`relative cursor-pointer hover:shadow-lg transition-all duration-300 group ${
        theme === "dark"
          ? "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={() => handleUserClick(user.id)}
    >
      <div className="flex items-center p-6">
        {/* Left Side - Profile Picture */}
        <div className="flex-shrink-0 mr-6">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback
              className={`text-lg ${
                theme === "dark"
                  ? "bg-slate-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Right Side - User Information */}
        <div className="flex-1 min-w-0">
          {/* Name and Email */}
          <div className="mb-3">
            <h3
              className={`text-lg font-semibold ${
                theme === "dark" ? "text-white" : "text-gray-900"
              }`}
            >
              {user.name}
            </h3>
            <p
              className={`text-sm font-medium ${
                theme === "dark" ? "text-blue-300" : "text-blue-600"
              }`}
            >
              {user.email || "No email available"}
            </p>
          </div>

          {/* Age and Gender */}
          <div className="flex items-center space-x-6 mb-3">
            {user.age && (
              <div
                className={`flex items-center space-x-2 text-sm ${
                  theme === "dark" ? "text-slate-300" : "text-gray-600"
                }`}
              >
                <UserIcon2 className="h-4 w-4" />
                <span>{user.age} years old</span>
              </div>
            )}
            {user.gender && (
              <div
                className={`flex items-center space-x-2 text-sm ${
                  theme === "dark" ? "text-slate-300" : "text-gray-600"
                }`}
              >
                <UserIcon className="h-4 w-4" />
                <span>{getGenderLabel(user.gender)}</span>
              </div>
            )}
          </div>

          {/* OAuth Provider Badge and Join Date in same row */}
          <div className="flex items-center justify-between">
            {/* OAuth Provider Badge */}
            {user.oauthProvider && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                  theme === "dark"
                    ? "bg-blue-900/30 text-blue-300 border border-blue-700/50"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                {user.oauthProvider}
              </span>
            )}

            {/* Join Date */}
            <div
              className={`flex items-center space-x-2 text-xs ${
                theme === "dark" ? "text-slate-400" : "text-gray-500"
              }`}
            >
              <Calendar className="h-3 w-3" />
              <span>
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Right Arrow Indicator */}
        <div className="flex-shrink-0 ml-4">
          <div
            className={`p-2 rounded-full transition-all duration-200 group-hover:scale-110 ${
              theme === "dark"
                ? "bg-slate-700 text-slate-300 group-hover:bg-slate-600"
                : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
            }`}
          >
            <svg
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </div>
      </div>
    </Card>
  );

  const renderUserListItem = (user: User) => (
    <Card
      key={user.id}
      className={`cursor-pointer hover:shadow-md transition-all duration-200 group ${
        theme === "dark"
          ? "bg-slate-800 border-slate-700 hover:border-slate-600 hover:bg-slate-750"
          : "bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50"
      }`}
      onClick={() => handleUserClick(user.id)}
    >
      <div className="flex items-center p-4">
        {/* Avatar */}
        <div className="flex-shrink-0 mr-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.profilePicture} />
            <AvatarFallback
              className={`text-sm ${
                theme === "dark"
                  ? "bg-slate-600 text-white"
                  : "bg-gray-200 text-gray-700"
              }`}
            >
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* User Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3
                className={`text-lg font-semibold truncate ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                {user.name}
              </h3>
              <div className="flex items-center space-x-4 mt-1">
                <div
                  className={`flex items-center space-x-1 text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-gray-600"
                  }`}
                >
                  <Mail className="h-3 w-3" />
                  <span className="truncate">{user.email || "No email"}</span>
                </div>
                {user.age && (
                  <div
                    className={`flex items-center space-x-1 text-sm ${
                      theme === "dark" ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    <UserIcon2 className="h-3 w-3" />
                    <span>{user.age} years</span>
                  </div>
                )}
                {user.gender && (
                  <div
                    className={`flex items-center space-x-1 text-sm ${
                      theme === "dark" ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    <UserIcon className="h-3 w-3" />
                    <span>{getGenderLabel(user.gender)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right side info */}
            <div className="flex items-center space-x-4 ml-4">
              {/* OAuth Provider */}
              {user.oauthProvider && (
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    theme === "dark"
                      ? "bg-blue-900/30 text-blue-300 border border-blue-700/50"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {user.oauthProvider}
                </span>
              )}

              {/* Join Date */}
              <div
                className={`flex items-center space-x-1 text-xs ${
                  theme === "dark" ? "text-slate-400" : "text-gray-500"
                }`}
              >
                <Calendar className="h-3 w-3" />
                <span>{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>

              {/* Arrow */}
              <div
                className={`p-1 rounded-full transition-all duration-200 group-hover:scale-110 ${
                  theme === "dark"
                    ? "bg-slate-700 text-slate-300 group-hover:bg-slate-600"
                    : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                }`}
              >
                <svg
                  className="h-3 w-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <ProtectedRoute>
      <AppLayout title="">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="w-full">
            {/* Header Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-center flex-1">
                  <h1
                    className={`text-3xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    All Users
                  </h1>
                  <p
                    className={`text-lg ${
                      theme === "dark" ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    View and manage all registered users
                  </p>
                </div>

                {/* View Toggle */}
                <div className="flex-shrink-0">
                  <ViewToggle view={viewMode} onViewChange={handleViewChange} />
                </div>
              </div>
            </div>

            {/* Users Grid/List */}
            {viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {users.map(renderUserCard)}
              </div>
            ) : (
              <div className="space-y-3">{users.map(renderUserListItem)}</div>
            )}

            {/* Pagination */}
            {pagination && (
              <div className="mt-10 text-center">
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />

                {/* Pagination Info */}
                <div className="mt-4">
                  <span
                    className={`text-sm ${
                      theme === "dark" ? "text-slate-400" : "text-gray-600"
                    }`}
                  >
                    Showing page {pagination.currentPage} of {pagination.totalPages} 
                    ({pagination.totalCount} total users)
                  </span>
                </div>
              </div>
            )}

            {users.length === 0 && !isLoading && (
              <div className="text-center py-12">
                <UserIcon
                  className={`mx-auto h-12 w-12 ${
                    theme === "dark" ? "text-slate-400" : "text-gray-400"
                  }`}
                />
                <h3
                  className={`mt-2 text-sm font-medium ${
                    theme === "dark" ? "text-white" : "text-gray-900"
                  }`}
                >
                  No users found
                </h3>
                <p
                  className={`mt-1 text-sm ${
                    theme === "dark" ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  Get started by creating the first user account.
                </p>
              </div>
            )}
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
