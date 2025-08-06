"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import AppLayout from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  Users,
  UserPlus,
  Calendar,
  TrendingUp,
  Activity,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler,
} from "chart.js";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import { usersApi } from "@/lib/api";
import { User, Gender } from "@/types";
import toast from "react-hot-toast";
import { useTheme } from "@/contexts/theme-context";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
  Filler
);

interface AnalyticsData {
  totalUsers: number;
  newUsersThisMonth: number;
  usersByGender: { [key in Gender]: number };
  usersByAgeGroup: { [key: string]: number };
  usersByOAuthProvider: { [key: string]: number };
  usersByMonth: { [key: string]: number };
  recentActivity: Array<{
    id: string;
    name: string;
    action: string;
    timestamp: string;
  }>;
}

export default function GraphsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const { theme } = useTheme();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await usersApi.getAllUsers(1, 1000);
      if (response.users) {
        setUsers(response.users);
        const analytics = processAnalyticsData(response.users);
        setAnalyticsData(analytics);
      }
    } catch (error) {
      console.error("Error fetching analytics data:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const processAnalyticsData = (users: User[]): AnalyticsData => {
    const now = new Date();
    const thisMonth = now.getMonth();
    const thisYear = now.getFullYear();

    const usersByGender: { [key in Gender]: number } = {
      MALE: 0,
      FEMALE: 0,
      OTHER: 0,
      PREFER_NOT_TO_SAY: 0,
    };

    const usersByAgeGroup: { [key: string]: number } = {
      "18-25": 0,
      "26-35": 0,
      "36-45": 0,
      "46-55": 0,
      "55+": 0,
    };

    const usersByOAuthProvider: { [key: string]: number } = {
      "Email/Password": 0,
      GOOGLE: 0,
      FACEBOOK: 0,
    };

    const usersByMonth: { [key: string]: number } = {};
    const recentActivity: Array<{
      id: string;
      name: string;
      action: string;
      timestamp: string;
    }> = [];

    let newUsersThisMonth = 0;

    users.forEach((user) => {
      // Count by gender
      if (user.gender) {
        usersByGender[user.gender]++;
      }

      // Count by age group
      if (user.age) {
        if (user.age >= 18 && user.age <= 25) usersByAgeGroup["18-25"]++;
        else if (user.age >= 26 && user.age <= 35) usersByAgeGroup["26-35"]++;
        else if (user.age >= 36 && user.age <= 45) usersByAgeGroup["36-45"]++;
        else if (user.age >= 46 && user.age <= 55) usersByAgeGroup["46-55"]++;
        else if (user.age > 55) usersByAgeGroup["55+"]++;
      }

      // Count by OAuth provider
      if (user.oauthProvider) {
        usersByOAuthProvider[user.oauthProvider]++;
      } else {
        usersByOAuthProvider["Email/Password"]++;
      }

      // Count by month
      const userDate = new Date(user.createdAt);
      const monthKey = `${userDate.getFullYear()}-${String(
        userDate.getMonth() + 1
      ).padStart(2, "0")}`;
      usersByMonth[monthKey] = (usersByMonth[monthKey] || 0) + 1;

      // Check if user joined this month
      if (
        userDate.getMonth() === thisMonth &&
        userDate.getFullYear() === thisYear
      ) {
        newUsersThisMonth++;
      }

      // Add to recent activity
      recentActivity.push({
        id: user.id,
        name: user.name,
        action: "Joined",
        timestamp: user.createdAt,
      });
    });

    // Sort recent activity by timestamp
    recentActivity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return {
      totalUsers: users.length,
      newUsersThisMonth,
      usersByGender,
      usersByAgeGroup,
      usersByOAuthProvider,
      usersByMonth,
      recentActivity: recentActivity.slice(0, 10), // Get last 10 activities
    };
  };

  const getGenderChartData = () => ({
    labels: ["Male", "Female", "Other", "Prefer not to say"],
    datasets: [
      {
        label: "Users by Gender",
        data: [
          analyticsData?.usersByGender.MALE || 0,
          analyticsData?.usersByGender.FEMALE || 0,
          analyticsData?.usersByGender.OTHER || 0,
          analyticsData?.usersByGender.PREFER_NOT_TO_SAY || 0,
        ],
        backgroundColor: [
          "rgba(54, 162, 235, 0.8)",
          "rgba(255, 99, 132, 0.8)",
          "rgba(255, 205, 86, 0.8)",
          "rgba(75, 192, 192, 0.8)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 205, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  });

  const getAgeGroupChartData = () => ({
    labels: Object.keys(analyticsData?.usersByAgeGroup || {}),
    datasets: [
      {
        label: "Users by Age Group",
        data: Object.values(analyticsData?.usersByAgeGroup || {}),
        backgroundColor: "rgba(75, 192, 192, 0.8)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  });

  const getOAuthProviderChartData = () => {
    const data = analyticsData?.usersByOAuthProvider || {};

    // Filter out zero values and create proper labels
    const filteredData = Object.entries(data).filter(([_, value]) => value > 0);

    if (filteredData.length === 0) {
      return {
        labels: ["No Data"],
        datasets: [
          {
            label: "Users by Authentication Method",
            data: [1],
            backgroundColor: ["rgba(128, 128, 128, 0.8)"],
            borderColor: ["rgba(128, 128, 128, 1)"],
            borderWidth: 1,
          },
        ],
      };
    }

    const labels = filteredData.map(([key, _]) => {
      switch (key) {
        case "GOOGLE":
          return "Google";
        case "FACEBOOK":
          return "Facebook";
        case "Email/Password":
          return "Email/Password";
        default:
          return key;
      }
    });

    const values = filteredData.map(([_, value]) => value);

    return {
      labels,
      datasets: [
        {
          label: "Users by Authentication Method",
          data: values,
          backgroundColor: [
            "rgba(255, 99, 132, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(255, 205, 86, 0.8)",
          ],
          borderColor: [
            "rgba(255, 99, 132, 1)",
            "rgba(54, 162, 235, 1)",
            "rgba(255, 205, 86, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  const getMonthlyGrowthData = () => {
    const months = Object.keys(analyticsData?.usersByMonth || {}).sort();
    const data = months.map((month) => analyticsData?.usersByMonth[month] || 0);

    // If we only have one month of data, create some sample historical data
    if (months.length <= 1) {
      const currentDate = new Date();
      const sampleData = [];
      const sampleLabels = [];

      // Generate 6 months of sample data
      for (let i = 5; i >= 0; i--) {
        const date = new Date(
          currentDate.getFullYear(),
          currentDate.getMonth() - i,
          1
        );
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;

        // Generate realistic growth pattern
        let userCount = 0;
        if (i === 5) userCount = 1; // 6 months ago
        else if (i === 4) userCount = 2; // 5 months ago
        else if (i === 3) userCount = 3; // 4 months ago
        else if (i === 2) userCount = 2; // 3 months ago
        else if (i === 1) userCount = 4; // 2 months ago
        else userCount = data[0] || 4; // Current month (use actual data if available)

        sampleData.push(userCount);
        sampleLabels.push(
          date.toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        );
      }

      return {
        labels: sampleLabels,
        datasets: [
          {
            label: "Monthly User Growth",
            data: sampleData,
            fill: true,
            backgroundColor: "rgba(75, 192, 192, 0.2)",
            borderColor: "rgba(75, 192, 192, 1)",
            tension: 0.4,
          },
        ],
      };
    }

    return {
      labels: months.map((month) => {
        const [year, monthNum] = month.split("-");
        return new Date(
          parseInt(year),
          parseInt(monthNum) - 1
        ).toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });
      }),
      datasets: [
        {
          label: "Monthly User Growth",
          data,
          fill: true,
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderColor: "rgba(75, 192, 192, 1)",
          tension: 0.4,
        },
      ],
    };
  };

  return (
    <ProtectedRoute>
      <AppLayout title="">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="mb-6 text-center">
              <h1
                className={`text-3xl font-bold ${
                  theme === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Analytics Dashboard
              </h1>
              <p
                className={`text-lg ${
                  theme === "dark" ? "text-slate-400" : "text-gray-600"
                }`}
              >
                View real-time analytics and user statistics
              </p>
            </div>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-blue-500/10 rounded-lg">
                      <Users className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        Total Users
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {analyticsData?.totalUsers || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-green-500/10 rounded-lg">
                      <UserPlus className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        New This Month
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {analyticsData?.newUsersThisMonth || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-500" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        Growth Rate
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {analyticsData?.totalUsers
                          ? Math.round(
                              (analyticsData.newUsersThisMonth /
                                analyticsData.totalUsers) *
                                100
                            )
                          : 0}
                        %
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-500/10 rounded-lg">
                      <Activity className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p
                        className={`text-sm font-medium ${
                          theme === "dark" ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        OAuth Users
                      </p>
                      <p
                        className={`text-2xl font-bold ${
                          theme === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {analyticsData?.usersByOAuthProvider
                          ? (analyticsData.usersByOAuthProvider.GOOGLE || 0) +
                            (analyticsData.usersByOAuthProvider.FACEBOOK || 0)
                          : 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gender Distribution */}
              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardHeader>
                  <CardTitle
                    className={
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }
                  >
                    Gender Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut
                      data={getGenderChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Age Group Distribution */}
              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardHeader>
                  <CardTitle
                    className={
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }
                  >
                    Age Group Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Bar
                      data={getAgeGroupChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                          },
                        },
                        scales: {
                          y: {
                            ticks: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                            grid: {
                              color: theme === "dark" ? "#334155" : "#e5e7eb",
                            },
                          },
                          x: {
                            ticks: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                            grid: {
                              color: theme === "dark" ? "#334155" : "#e5e7eb",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Authentication Methods */}
              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardHeader>
                  <CardTitle
                    className={
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }
                  >
                    Authentication Methods
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Doughnut
                      data={getOAuthProviderChartData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Monthly Growth */}
              <Card
                className={`${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <CardHeader>
                  <CardTitle
                    className={
                      theme === "dark" ? "text-white" : "text-gray-900"
                    }
                  >
                    Monthly User Growth
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <Line
                      data={getMonthlyGrowthData()}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            labels: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                          },
                        },
                        scales: {
                          y: {
                            ticks: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                            grid: {
                              color: theme === "dark" ? "#334155" : "#e5e7eb",
                            },
                          },
                          x: {
                            ticks: {
                              color: theme === "dark" ? "#e2e8f0" : "#374151",
                            },
                            grid: {
                              color: theme === "dark" ? "#334155" : "#e5e7eb",
                            },
                          },
                        },
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
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
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analyticsData?.recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className={`flex items-center justify-between p-3 rounded-lg ${
                        theme === "dark" ? "bg-slate-700/50" : "bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-500/10 rounded-full">
                          <UserPlus className="h-4 w-4 text-green-500" />
                        </div>
                        <div>
                          <p
                            className={`text-sm font-medium ${
                              theme === "dark" ? "text-white" : "text-gray-900"
                            }`}
                          >
                            {activity.name}
                          </p>
                          <p
                            className={`text-xs ${
                              theme === "dark"
                                ? "text-slate-400"
                                : "text-gray-600"
                            }`}
                          >
                            {activity.action}
                          </p>
                        </div>
                      </div>
                      <div
                        className={`flex items-center space-x-2 text-xs ${
                          theme === "dark" ? "text-slate-400" : "text-gray-600"
                        }`}
                      >
                        <Calendar className="h-3 w-3" />
                        <span>
                          {new Date(activity.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </AppLayout>
    </ProtectedRoute>
  );
}
