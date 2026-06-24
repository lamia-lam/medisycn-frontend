"use client";

import { useState, useEffect } from "react";
import {
  Activity,
  Microscope,
  Upload,
  FileText,
  Clock,
  User,
  FlaskConical,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/diagnosis-dashboard",
  },
  {
    icon: <Microscope className="w-5 h-5" />,
    label: "Test Requests",
    href: "/diagnosis-dashboard/test-requests",
  },
  {
    icon: <Upload className="w-5 h-5" />,
    label: "Upload Reports",
    href: "/diagnosis-dashboard/upload",
  },
];

type RecentRequest = {
  id: string;
  patient: string;
  test: string;
  doctor: string;
  time: string;
  status: "Pending" | "In Progress" | "Completed";
  priority: "Normal" | "Urgent";
};

// Mock data
const mockData = {
  centerName: "MediSync Diagnostics Center",
  stats: {
    totalRequestsToday: 42,
    pendingReports: 15,
    completedToday: 27,
    avgTurnaroundTime: "4.5 hrs",
  },
  recentRequests: [
    {
      id: "REQ-001",
      patient: "John Doe",
      test: "Complete Blood Count (CBC)",
      doctor: "Dr. Sarah Smith",
      time: "10:30 AM",
      status: "In Progress",
      priority: "Normal",
    },
    {
      id: "REQ-002",
      patient: "Jane Smith",
      test: "Lipid Profile",
      doctor: "Dr. Michael Chen",
      time: "11:15 AM",
      status: "Pending",
      priority: "Urgent",
    },
    {
      id: "REQ-003",
      patient: "Robert Brown",
      test: "Liver Function Test (LFT)",
      doctor: "Dr. Emily Davis",
      time: "09:00 AM",
      status: "Completed",
      priority: "Normal",
    },
    {
      id: "REQ-004",
      patient: "Mike Johnson",
      test: "Blood Glucose (Fasting)",
      doctor: "Dr. Sarah Smith",
      time: "08:45 AM",
      status: "Completed",
      priority: "Normal",
    },
  ] as RecentRequest[],
};

export default function DiagnosisDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(mockData);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    // Simulate API fetch
    const timer = setTimeout(() => {
      setData(mockData);
      setLoading(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Diagnostic">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Completed":
        return <Badge variant="success">{status}</Badge>;
      case "In Progress":
        return <Badge variant="warning">{status}</Badge>;
      case "Pending":
        return <Badge variant="default">{status}</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Diagnostic">
      <div className="space-y-6">
        <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-semibold mb-1">
            Welcome to {data.centerName}!
          </h2>
          <p className="text-teal-100 text-sm">MediSync Diagnostic Center</p>
          <p className="text-teal-100 text-sm mt-0.5">{currentDate}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard
            icon={<Microscope className="w-6 h-6" />}
            label="Total Requests Today"
            value={data.stats.totalRequestsToday}
            trend="+12% from yesterday"
            color="bg-blue-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending Reports"
            value={data.stats.pendingReports}
            trend="Needs attention"
            color="bg-orange-500"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Completed Today"
            value={data.stats.completedToday}
            trend="+5% from yesterday"
            color="bg-green-500"
          />
        </div>

        <div className="grid grid-cols-1 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Recent Test Requests
              </h3>
              <a
                href="/diagnosis-dashboard/test-requests"
                className="text-[#0ab3b3] hover:underline text-sm font-medium"
              >
                View All
              </a>
            </div>

            <div className="space-y-4">
              {data.recentRequests.map((req, index) => (
                <div
                  key={req.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-4 sm:gap-0 ${
                    index !== data.recentRequests.length - 1
                      ? "border-b border-gray-100 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        req.status === "Completed"
                          ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                          : req.status === "In Progress"
                            ? "bg-orange-100 text-orange-600 dark:bg-orange-900/30"
                            : "bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30"
                      }`}
                    >
                      <FlaskConical className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {req.test}
                        </p>
                        {req.priority === "Urgent" && (
                          <Badge variant="danger">Urgent</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-gray-400" />
                          {req.patient}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {req.time}
                        </span>
                        <span>{req.doctor}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(req.status)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
