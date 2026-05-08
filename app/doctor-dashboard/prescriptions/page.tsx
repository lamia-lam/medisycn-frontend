"use client";

import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  Download,
  Pill,
} from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/doctor-dashboard",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Patients",
    href: "/doctor-dashboard/patients",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Prescriptions",
    href: "/doctor-dashboard/prescriptions",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Appointments",
    href: "/doctor-dashboard/appointments",
  },
];

const prescriptionsData = [
  {
    id: "RX-2345",
    patient: "John Doe",
    patientId: "P001",
    date: "2026-04-25",
    diagnosis: "Hypertension Management",
    medicines: 2,
    status: "Active" as const,
    initials: "JD",
    avatarColor: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "RX-2344",
    patient: "Jane Smith",
    patientId: "P002",
    date: "2026-04-23",
    diagnosis: "Type 2 Diabetes Control",
    medicines: 3,
    status: "Active" as const,
    initials: "JS",
    avatarColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "RX-2343",
    patient: "Mike Johnson",
    patientId: "P003",
    date: "2026-04-20",
    diagnosis: "Asthma Treatment",
    medicines: 2,
    status: "Completed" as const,
    initials: "MJ",
    avatarColor: "bg-green-100 text-green-700",
  },
  {
    id: "RX-2342",
    patient: "Sarah Williams",
    patientId: "P004",
    date: "2026-04-18",
    diagnosis: "Arthritis Pain Relief",
    medicines: 4,
    status: "Active" as const,
    initials: "SW",
    avatarColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "RX-2341",
    patient: "Robert Brown",
    patientId: "P005",
    date: "2026-04-15",
    diagnosis: "Heart Disease Management",
    medicines: 5,
    status: "Active" as const,
    initials: "RB",
    avatarColor: "bg-red-100 text-red-700",
  },
  {
    id: "RX-2340",
    patient: "Emily Davis",
    patientId: "P006",
    date: "2026-04-12",
    diagnosis: "Migraine Treatment",
    medicines: 2,
    status: "Completed" as const,
    initials: "ED",
    avatarColor: "bg-pink-100 text-pink-700",
  },
];

type PrescriptionStatus = "Active" | "Completed";

export default function PrescriptionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPrescriptions = prescriptionsData.filter((prescription) => {
    const matchesSearch =
      prescription.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prescription.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      prescription.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const activeCount = prescriptionsData.filter((p) => p.status === "Active").length;
  const completedCount = prescriptionsData.filter((p) => p.status === "Completed").length;

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              Prescription Management
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              View and manage all prescriptions
            </p>
          </div>
          <button
            onClick={() => router.push("/doctor-dashboard/prescriptions/new")}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Prescription
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              label: "Total Prescriptions",
              value: prescriptionsData.length,
              color: "text-cyan-600",
              bg: "bg-cyan-50 dark:bg-cyan-900/20",
              icon: <FileText className="w-5 h-5 text-cyan-500" />,
            },
            {
              label: "Active",
              value: activeCount,
              color: "text-green-600",
              bg: "bg-green-50 dark:bg-green-900/20",
              icon: <Pill className="w-5 h-5 text-green-500" />,
            },
            {
              label: "Completed",
              value: completedCount,
              color: "text-gray-500",
              bg: "bg-gray-50 dark:bg-gray-800",
              icon: <FileText className="w-5 h-5 text-gray-400" />,
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-4 flex items-center gap-4`}
            >
              <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-800 flex items-center justify-center shadow-sm shrink-0">
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">

          {/* Search & Filter */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by prescription ID, patient name, or diagnosis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white appearance-none cursor-pointer"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {filteredPrescriptions.length}
              </span>{" "}
              of {prescriptionsData.length} prescriptions
            </p>
          </div>

          {/* Card Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredPrescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full ${prescription.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                      >
                        {prescription.initials}
                      </div>
                      <div>
                        <p className="font-mono text-xs text-gray-400 mb-0.5">
                          {prescription.id}
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-white text-sm">
                          {prescription.patient}
                        </p>
                        <p className="text-xs text-gray-400">{prescription.patientId}</p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        prescription.status === "Active" ? "success" : "default"
                      }
                    >
                      {prescription.status}
                    </Badge>
                  </div>

                  {/* Details */}
                  <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Date Prescribed</span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {prescription.date}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm gap-4">
                      <span className="text-gray-400 shrink-0">Diagnosis</span>
                      <span className="text-right font-medium text-gray-700 dark:text-gray-300 text-xs">
                        {prescription.diagnosis}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Medicines</span>
                      <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                        <Pill className="w-3.5 h-3.5 text-cyan-500" />
                        {prescription.medicines} items
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() =>
                        router.push(
                          `/doctor-dashboard/prescriptions/${prescription.id}`
                        )
                      }
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-cyan-500 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-600 transition-colors text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      title="Edit"
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      title="Download PDF"
                      className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      title="Delete"
                      className="p-2 border border-red-200 dark:border-red-900/50 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty State */}
            {filteredPrescriptions.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No prescriptions found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
