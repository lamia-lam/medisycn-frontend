"use client";

import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  Activity,
  Calendar,
  Pill,
  Search,
  Filter,
  Eye,
  Download,
  User,
  Building2,
  HeartPulse,
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

const prescriptions = [
  { id: "RX-2345", department: "Internal Medicine", doctor: "Dr. Sarah Smith", date: "2026-04-25" },
  { id: "RX-2310", department: "Cardiology", doctor: "Dr. Michael Brown", date: "2026-03-15" },
  { id: "RX-2278", department: "General Medicine", doctor: "Dr. Emily Davis", date: "2026-02-28" },
  { id: "RX-2245", department: "Orthopedics", doctor: "Dr. Robert Johnson", date: "2026-02-10" },
  { id: "RX-2198", department: "Internal Medicine", doctor: "Dr. Sarah Smith", date: "2026-01-15" },
  { id: "RX-2156", department: "Dermatology", doctor: "Dr. David Lee", date: "2025-12-20" },
];

export default function PatientPrescriptions() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");

  const departments = Array.from(
    new Set(prescriptions.map((p) => p.department)),
  );

  const filtered = prescriptions.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchSearch =
      p.id.toLowerCase().includes(q) ||
      p.doctor.toLowerCase().includes(q) ||
      p.department.toLowerCase().includes(q);
    const matchDept =
      filterDepartment === "all" || p.department === filterDepartment;
    return matchSearch && matchDept;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
            My Prescriptions
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            View and download your prescriptions
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            {
              label: "Total Prescriptions",
              value: prescriptions.length,
              color:
                "bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-400",
            },
            {
              label: "This Year",
              value: prescriptions.filter((p) => p.date.startsWith("2026"))
                .length,
              color:
                "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
            },
            {
              label: "Departments",
              value: departments.length,
              color:
                "bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400",
            },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl p-4 ${s.color}`}>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs font-medium mt-0.5 opacity-80">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          {/* Search & Filter */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, doctor, or department…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
              >
                <option value="all">All Departments</option>
                {departments.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((rx) => (
              <div
                key={rx.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 rounded-lg bg-teal-50 dark:bg-teal-900/20 flex items-center justify-center">
                    <Pill className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <span className="text-xs font-mono font-semibold text-gray-400">
                    {rx.id}
                  </span>
                </div>

                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm font-semibold text-gray-800 dark:text-white">
                      {rx.department}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {rx.doctor}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {rx.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                  <button
                    onClick={() =>
                      router.push(`/patient-dashboard/prescriptions/${rx.id}`)
                    }
                    className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    title="Download"
                    className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Pill className="w-7 h-7 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No prescriptions found
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
