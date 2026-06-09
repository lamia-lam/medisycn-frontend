"use client";

import {
  Microscope,
  Upload,
  FileText,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";
import { useState } from "react";

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
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Reports",
    href: "/diagnosis-dashboard/reports",
  },
];

const testRequests = [
  {
    id: 1,
    patient: "John Doe",
    initials: "JD",
    test: "Complete Blood Count",
    doctor: "Dr. Smith",
    date: "2026-06-09",
    status: "Pending",
    priority: "Normal",
  },
  {
    id: 2,
    patient: "Jane Smith",
    initials: "JS",
    test: "Lipid Profile",
    doctor: "Dr. Wilson",
    date: "2026-06-09",
    status: "In Progress",
    priority: "Urgent",
  },
  {
    id: 3,
    patient: "Mike Johnson",
    initials: "MJ",
    test: "Thyroid Function",
    doctor: "Dr. Brown",
    date: "2026-06-08",
    status: "Completed",
    priority: "Normal",
  },
  {
    id: 4,
    patient: "Sarah Williams",
    initials: "SW",
    test: "HbA1c",
    doctor: "Dr. Smith",
    date: "2026-06-09",
    status: "Pending",
    priority: "Normal",
  },
];

const recentActivity = [
  {
    id: 1,
    message: "Lipid Profile report completed",
    time: "5 minutes ago",
    color: "bg-green-500",
  },
  {
    id: 2,
    message: "CBC test started for John Doe",
    time: "15 minutes ago",
    color: "bg-blue-500",
  },
  {
    id: 3,
    message: "HbA1c report uploaded",
    time: "1 hour ago",
    color: "bg-green-500",
  },
  {
    id: 4,
    message: "Thyroid Function results ready",
    time: "2 hours ago",
    color: "bg-cyan-500",
  },
];

const filterTabs = ["All", "Pending", "In Progress", "Completed", "Urgent"];

export default function DiagnosisDashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [isDragOver, setIsDragOver] = useState(false);

  const filteredRequests = testRequests.filter((r) => {
    if (activeFilter === "All") return true;
    if (activeFilter === "Urgent") return r.priority === "Urgent";
    return r.status === activeFilter;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Diagnostic">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-500 p-6 text-white shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold mb-1">
                Good Morning, Lab Technician!
              </h2>
              <p className="text-cyan-100 text-sm">MediSync Diagnostic Center</p>
              <p className="text-cyan-100 text-sm mt-0.5">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <button className="inline-flex items-center gap-2 bg-white text-cyan-700 px-5 py-2.5 rounded-lg font-medium hover:bg-cyan-50 transition-colors shadow-sm self-start md:self-auto">
              <Upload className="w-5 h-5" />
              Upload Report
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Pending Tests"
            value={8}
            trend="+2 today"
            color="bg-cyan-500"
          />
          <StatCard
            icon={<Microscope className="w-6 h-6" />}
            label="In Progress"
            value={5}
            trend="Currently testing"
            color="bg-blue-500"
          />
          <StatCard
            icon={<CheckCircle className="w-6 h-6" />}
            label="Completed Today"
            value={12}
            trend="+3 from yesterday"
            color="bg-green-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Total Reports"
            value={156}
            trend="This month"
            color="bg-purple-500"
          />
        </div>

        {/* Test Requests */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-600" />
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Test Requests
              </h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {filterTabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === tab
                      ? "bg-cyan-600 text-white"
                      : "border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                No test requests found.
              </div>
            ) : (
              filteredRequests.map((request) => (
                <div
                  key={request.id}
                  className={`p-4 rounded-xl border hover:shadow-sm transition-shadow ${
                    request.priority === "Urgent"
                      ? "bg-red-50/60 dark:bg-red-900/10 border-red-100 dark:border-red-900/30"
                      : "bg-gray-50/70 dark:bg-gray-900/30 border-gray-100 dark:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#eef8fb] text-[#0ab3b3] flex items-center justify-center font-semibold text-sm shrink-0">
                        {request.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {request.patient}
                          </p>
                          {request.priority === "Urgent" && (
                            <Badge variant="danger">
                              <AlertCircle className="w-3 h-3 mr-1 inline" />
                              Urgent
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {request.test}
                        </p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 sm:text-right shrink-0">
                      <p>{request.doctor}</p>
                      <p>{request.date}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Badge
                        variant={
                          request.status === "Completed"
                            ? "success"
                            : request.status === "In Progress"
                            ? "warning"
                            : "default"
                        }
                      >
                        {request.status}
                      </Badge>
                      {request.status === "Pending" && (
                        <button className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                          Start Test
                        </button>
                      )}
                      {request.status === "In Progress" && (
                        <button className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors">
                          Upload Results
                        </button>
                      )}
                      {request.status === "Completed" && (
                        <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors">
                          View Report
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Upload */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-5">
              Quick Upload
            </h3>
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setIsDragOver(false); }}
              className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-200 ${
                isDragOver
                  ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                  : "border-gray-200 dark:border-gray-600 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10"
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors ${isDragOver ? "bg-cyan-100" : "bg-gray-100 dark:bg-gray-700"}`}>
                <Upload className={`w-7 h-7 transition-colors ${isDragOver ? "text-cyan-600" : "text-gray-400 dark:text-gray-500"}`} />
              </div>
              <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                Drag and drop test reports here
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">
                Supports PDF, JPG, PNG — up to 20MB
              </p>
              <button className="px-5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors">
                Browse Files
              </button>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Recent Activity
              </h3>
              <button className="text-cyan-600 hover:underline text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {recentActivity.map((item, index) => (
                <div
                  key={item.id}
                  className={`flex items-start gap-3 py-3 ${
                    index !== recentActivity.length - 1
                      ? "border-b border-gray-100 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${item.color}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{item.message}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{item.time}</p>
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
