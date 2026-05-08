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
  History,
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

const patientsData = [
  {
    id: "P001",
    name: "John Doe",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 123-4567",
    condition: "Hypertension",
    lastVisit: "2026-04-25",
    status: "Active" as const,
    initials: "JD",
    avatarColor: "bg-cyan-100 text-cyan-700",
  },
  {
    id: "P002",
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    phone: "+1 (555) 234-5678",
    condition: "Type 2 Diabetes",
    lastVisit: "2026-04-23",
    status: "Active" as const,
    initials: "JS",
    avatarColor: "bg-purple-100 text-purple-700",
  },
  {
    id: "P003",
    name: "Mike Johnson",
    age: 28,
    gender: "Male",
    phone: "+1 (555) 345-6789",
    condition: "Asthma",
    lastVisit: "2026-04-20",
    status: "Active" as const,
    initials: "MJ",
    avatarColor: "bg-green-100 text-green-700",
  },
  {
    id: "P004",
    name: "Sarah Williams",
    age: 55,
    gender: "Female",
    phone: "+1 (555) 456-7890",
    condition: "Arthritis",
    lastVisit: "2026-04-18",
    status: "Active" as const,
    initials: "SW",
    avatarColor: "bg-orange-100 text-orange-700",
  },
  {
    id: "P005",
    name: "Robert Brown",
    age: 62,
    gender: "Male",
    phone: "+1 (555) 567-8901",
    condition: "Heart Disease",
    lastVisit: "2026-04-15",
    status: "Critical" as const,
    initials: "RB",
    avatarColor: "bg-red-100 text-red-700",
  },
  {
    id: "P006",
    name: "Emily Davis",
    age: 38,
    gender: "Female",
    phone: "+1 (555) 678-9012",
    condition: "Migraine",
    lastVisit: "2026-04-12",
    status: "Active" as const,
    initials: "ED",
    avatarColor: "bg-pink-100 text-pink-700",
  },
  {
    id: "P007",
    name: "David Wilson",
    age: 41,
    gender: "Male",
    phone: "+1 (555) 789-0123",
    condition: "Thyroid Disorder",
    lastVisit: "2026-04-10",
    status: "Active" as const,
    initials: "DW",
    avatarColor: "bg-blue-100 text-blue-700",
  },
  {
    id: "P008",
    name: "Lisa Anderson",
    age: 29,
    gender: "Female",
    phone: "+1 (555) 890-1234",
    condition: "Anemia",
    lastVisit: "2026-04-08",
    status: "Inactive" as const,
    initials: "LA",
    avatarColor: "bg-gray-100 text-gray-600",
  },
];

type Status = "Active" | "Inactive" | "Critical";

function getStatusBadgeVariant(status: Status) {
  if (status === "Active") return "success";
  if (status === "Critical") return "danger";
  return "default";
}

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredPatients = patientsData.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGender =
      filterGender === "all" || patient.gender.toLowerCase() === filterGender;
    const matchesStatus =
      filterStatus === "all" || patient.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesGender && matchesStatus;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              Patient Management
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage and monitor your patients
            </p>
          </div>
          <button className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm">
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Patients",
              value: patientsData.length,
              color: "text-cyan-600",
              bg: "bg-cyan-50 dark:bg-cyan-900/20",
            },
            {
              label: "Active",
              value: patientsData.filter((p) => p.status === "Active").length,
              color: "text-green-600",
              bg: "bg-green-50 dark:bg-green-900/20",
            },
            {
              label: "Critical",
              value: patientsData.filter((p) => p.status === "Critical").length,
              color: "text-red-600",
              bg: "bg-red-50 dark:bg-red-900/20",
            },
            {
              label: "Inactive",
              value: patientsData.filter((p) => p.status === "Inactive").length,
              color: "text-gray-500",
              bg: "bg-gray-50 dark:bg-gray-800",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-4 border border-transparent`}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Search & Filter Bar */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or patient ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
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
                    <option value="inactive">Inactive</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {filteredPatients.length}
              </span>{" "}
              of {patientsData.length} patients
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Patient
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Age
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Gender
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Condition
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Last Visit
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Status
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    {/* Patient Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${patient.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                        >
                          {patient.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {patient.name}
                          </p>
                          <p className="text-xs text-gray-400">{patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {patient.age}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {patient.gender}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {patient.phone}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {patient.condition}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {patient.lastVisit}
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={getStatusBadgeVariant(patient.status)}>
                        {patient.status}
                      </Badge>
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            router.push(
                              `/doctor-dashboard/patients/${patient.id}/history`,
                            )
                          }
                          title="View History"
                          className="p-2 rounded-lg text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/30 transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          title="View Details"
                          className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          title="Edit"
                          className="p-2 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          title="Delete"
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPatients.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No patients found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
