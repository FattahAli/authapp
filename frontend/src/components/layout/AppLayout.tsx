"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/auth";
import {
  User,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Shield,
  ShieldCheck,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/contexts/theme-context";

interface AppLayoutProps {
  children: ReactNode;
  title: string;
}

export default function AppLayout({ children, title }: AppLayoutProps) {
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme } = useTheme();

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Logout failed");
    }
  };

  const sidebarItems = [
    {
      name: "Profile",
      icon: User,
      href: "/profile",
      description: "Edit your profile",
    },
    {
      name: "All Users",
      icon: Users,
      href: "/users",
      description: "View all users",
    },
    {
      name: "Graphs",
      icon: BarChart3,
      href: "/graphs",
      description: "View analytics",
    },
  ];

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`min-h-screen ${
        theme === "dark" ? "bg-slate-900" : "bg-gray-50"
      }`}
    >
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile menu button - Fixed position */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setSidebarOpen(true)}
        className={`fixed top-4 left-4 z-50 lg:hidden ${
          theme === "dark"
            ? "text-slate-300 hover:text-white hover:bg-slate-700/50 bg-slate-800/95"
            : "text-gray-600 hover:text-gray-900 hover:bg-gray-100 bg-white/95"
        } rounded-lg shadow-lg`}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <aside
        className={`
        fixed top-0 left-0 z-50 w-64 ${
          theme === "dark" ? "bg-indigo-900" : "bg-indigo-50"
        } shadow-xl h-screen transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
      >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div
            className={`flex items-center justify-between p-4 border-b ${
              theme === "dark" ? "border-indigo-700" : "border-indigo-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <Link
                href="/users"
                className="flex items-center space-x-2 hover:opacity-80 transition-opacity group"
              >
                <div
                  className={`p-2 rounded-lg transition-all duration-200 group-hover:scale-105 ${
                    theme === "dark"
                      ? "bg-indigo-600 text-white"
                      : "bg-indigo-600 text-white"
                  }`}
                >
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span
                    className={`text-xl font-bold ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    Authify
                  </span>
                  <span
                    className={`text-xs ${
                      theme === "dark" ? "text-indigo-300" : "text-indigo-600"
                    }`}
                  >
                    Secure Auth
                  </span>
                </div>
              </Link>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                className={`lg:hidden ${
                  theme === "dark"
                    ? "text-indigo-300 hover:text-white hover:bg-indigo-700"
                    : "text-indigo-600 hover:text-indigo-900 hover:bg-indigo-100"
                }`}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div
            className={`p-4 border-b ${
              theme === "dark" ? "border-indigo-700" : "border-indigo-200"
            }`}
          >
            <div
              className={`p-3 rounded-lg ${
                theme === "dark" ? "bg-indigo-800/50" : "bg-indigo-100/50"
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profilePicture} />
                  <AvatarFallback className="bg-indigo-600 text-white text-sm">
                    {user?.name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium truncate ${
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {user?.name}
                  </p>
                  <p
                    className={`text-xs truncate ${
                      theme === "dark" ? "text-indigo-300" : "text-indigo-600"
                    }`}
                  >
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant="ghost"
                    className={`w-full justify-start h-12 ${
                      theme === "dark"
                        ? "text-indigo-200 hover:text-white hover:bg-indigo-700"
                        : "text-indigo-700 hover:text-indigo-900 hover:bg-indigo-100"
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    <div className="text-left">
                      <div className="font-medium">{item.name}</div>
                      <div
                        className={`text-xs ${
                          theme === "dark"
                            ? "text-indigo-300"
                            : "text-indigo-500"
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div
            className={`p-4 border-t ${
              theme === "dark" ? "border-indigo-700" : "border-indigo-200"
            }`}
          >
            <Button
              variant="ghost"
              className={`w-full justify-start h-12 ${
                theme === "dark"
                  ? "text-red-300 hover:text-red-200 hover:bg-red-900/20"
                  : "text-red-600 hover:text-red-700 hover:bg-red-50"
              }`}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5 mr-3" />
              <div className="text-left">
                <div className="font-medium">Sign Out</div>
                <div
                  className={`text-xs ${
                    theme === "dark" ? "text-indigo-300" : "text-indigo-500"
                  }`}
                >
                  Logout from account
                </div>
              </div>
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content - With left margin for sidebar */}
      <div className="lg:ml-64">
        {/* Page Content */}
        <main
          className={`p-4 sm:p-6 lg:p-8 min-h-screen ${
            theme === "dark" ? "bg-slate-900" : "bg-gray-50"
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
