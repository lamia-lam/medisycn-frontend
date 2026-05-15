"use client";

import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  Activity,
  Calendar,
  FileText,
  Pill,
  Search,
  Filter,
  Eye,
  Download,
  Clock,
  User,
  HeartPulse,
  Building2,
} from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/patient-dashboard",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Appointments",
    href: "/patient-dashboard/appointments",
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    label: "Medical Records",
    href: "/patient-dashboard/records",
  },
  {
    icon: <Pill className="w-5 h-5" />,
    label: "Prescriptions",
    href: "/patient-dashboard/prescriptions",
  },
];

const typeColors: Record<string, string> = {
  "Lab Report":
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  Imaging:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  Diagnostic:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

const typeIconColors: Record<string, string> = {
  "Lab Report": "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
  Imaging: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
  Diagnostic: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
};

const medicalRecords = [
  {
    id: 1,
    testName: "Complete Blood Count (CBC)",
    testDate: "2026-04-20",
    testTime: "09:30 AM",
    doctor: "Dr. Sarah Smith",
    department: "Internal Medicine",
    type: "Lab Report",
  },
  {
    id: 2,
    testName: "Lipid Profile",
    testDate: "2026-04-20",
    testTime: "09:30 AM",
    doctor: "Dr. Sarah Smith",
    department: "Internal Medicine",
    type: "Lab Report",
  },
  {
    id: 3,
    testName: "ECG (Electrocardiogram)",
    testDate: "2026-03-15",
    testTime: "02:00 PM",
    doctor: "Dr. Michael Brown",
    department: "Cardiology",
    type: "Diagnostic",
  },
  {
    id: 4,
    testName: "Chest X-Ray",
    testDate: "2026-03-10",
    testTime: "11:00 AM",
    doctor: "Dr. Emily Davis",
    department: "Radiology",
    type: "Imaging",
  },
  {
    id: 5,
    testName: "Thyroid Function Test",
    testDate: "2026-02-28",
    testTime: "10:15 AM",
    doctor: "Dr. Sarah Smith",
    department: "Internal Medicine",
    type: "Lab Report",
  },
  {
    id: 6,
    testName: "Ultrasound Abdomen",
    testDate: "2026-02-15",
    testTime: "03:30 PM",
    doctor: "Dr. John Wilson",
    department: "Radiology",
    type: "Imaging",
  },
];

export default function MedicalRecords() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredRecords = medicalRecords.filter((record) => {
    const matchesSearch =
      record.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || record.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
            Medical Records
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            View and download your test reports
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Records",
              value: medicalRecords.length,
              color: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400",
            },
            {
              label: "Lab Reports",
              value: medicalRecords.filter((r) => r.type === "Lab Report").length,
              color: "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
            },
            {
              label: "Imaging & Diagnostics",
              value: medicalRecords.filter(
                (r) => r.type === "Imaging" || r.type === "Diagnostic"
              ).length,
              color: "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`rounded-xl p-4 ${stat.color} border border-transparent`}
            >
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Records Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          {/* Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by test name, doctor, or department…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="Lab Report">Lab Report</option>
                <option value="Imaging">Imaging</option>
                <option value="Diagnostic">Diagnostic</option>
              </select>
            </div>
          </div>

          {/* Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRecords.map((record) => (
              <div
                key={record.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
              >
                {/* Card Top */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`w-11 h-11 rounded-lg flex items-center justify-center ${typeIconColors[record.type]}`}
                  >
                    <FileText className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full ${typeColors[record.type]}`}
                  >
                    {record.type}
                  </span>
                </div>

                {/* Test Name */}
                <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-3 line-clamp-2 leading-snug">
                  {record.testName}
                </h4>

                {/* Meta */}
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 shrink-0" />
                    <span>{record.testDate}</span>
                    <Clock className="w-3.5 h-3.5 shrink-0 ml-1" />
                    <span>{record.testTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <User className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{record.doctor}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <Building2 className="w-3.5 h-3.5 shrink-0" />
                    <span>{record.department}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() =>
                      router.push(`/patient-dashboard/records/${record.id}`)
                    }
                    className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View
                  </button>
                  <button
                    title="Download report"
                    className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {filteredRecords.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No medical records found
              </p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
