"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  Filter,
  FileText,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";

const sidebarItems = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    href: "/pharmacy-dashboard",
  },
  {
    icon: <Search className="w-5 h-5" />,
    label: "Patient Search",
    href: "/pharmacy-dashboard/patient-search",
  },
  {
    icon: <Package className="w-5 h-5" />,
    label: "Medicine Inventory",
    href: "/pharmacy-dashboard/inventory",
  },
  {
    icon: <History className="w-5 h-5" />,
    label: "Dispensing History",
    href: "/pharmacy-dashboard/history",
  },
];

const historyData = [
  {
    id: "DH001",
    prescriptionId: "RX001",
    patientName: "John Doe",
    initials: "JD",
    prescriptionDate: "2026-05-20",
    processedDate: "2026-05-20",
    pharmacistName: "Sarah Johnson",
    medicinesDispensed: 4,
    status: "Completed",
  },
  {
    id: "DH002",
    prescriptionId: "RX002",
    patientName: "Jane Smith",
    initials: "JS",
    prescriptionDate: "2026-05-18",
    processedDate: "2026-05-19",
    pharmacistName: "Michael Brown",
    medicinesDispensed: 3,
    status: "Completed",
  },
  {
    id: "DH003",
    prescriptionId: "RX003",
    patientName: "Mike Johnson",
    initials: "MJ",
    prescriptionDate: "2026-05-15",
    processedDate: "2026-05-16",
    pharmacistName: "Sarah Johnson",
    medicinesDispensed: 4,
    status: "Partial",
  },
  {
    id: "DH004",
    prescriptionId: "RX004",
    patientName: "Sarah Williams",
    initials: "SW",
    prescriptionDate: "2026-05-12",
    processedDate: "2026-05-13",
    pharmacistName: "Michael Brown",
    medicinesDispensed: 2,
    status: "Completed",
  },
  {
    id: "DH005",
    prescriptionId: "RX005",
    patientName: "Robert Brown",
    initials: "RB",
    prescriptionDate: "2026-05-10",
    processedDate: "2026-05-11",
    pharmacistName: "Sarah Johnson",
    medicinesDispensed: 5,
    status: "Completed",
  },
  {
    id: "DH006",
    prescriptionId: "RX006",
    patientName: "Emily Davis",
    initials: "ED",
    prescriptionDate: "2026-05-08",
    processedDate: "2026-05-09",
    pharmacistName: "Michael Brown",
    medicinesDispensed: 3,
    status: "Completed",
  },
  {
    id: "DH007",
    prescriptionId: "RX007",
    patientName: "David Wilson",
    initials: "DW",
    prescriptionDate: "2026-05-06",
    processedDate: "2026-05-07",
    pharmacistName: "Sarah Johnson",
    medicinesDispensed: 6,
    status: "Completed",
  },
  {
    id: "DH008",
    prescriptionId: "RX008",
    patientName: "Lisa Anderson",
    initials: "LA",
    prescriptionDate: "2026-05-04",
    processedDate: "2026-05-05",
    pharmacistName: "Michael Brown",
    medicinesDispensed: 2,
    status: "Partial",
  },
];

export default function DispensingHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredHistory = historyData.filter((record) => {
    const matchesSearch =
      record.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.prescriptionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.pharmacistName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      record.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
            Dispensing History
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            View all previously processed prescriptions and dispensing records
          </p>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          {/* Search + Filter */}
          <div className="flex flex-col lg:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name, prescription ID, or pharmacist..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-11 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer text-sm text-gray-700 dark:text-gray-300 min-w-[180px] transition-all"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing{" "}
            <span className="font-semibold text-cyan-600">
              {filteredHistory.length}
            </span>{" "}
            of {historyData.length} records
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-l-lg">
                    Prescription ID
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Patient Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Prescription Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Processed Date
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Pharmacist
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Medicines
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-r-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                      index !== filteredHistory.length - 1
                        ? "border-b border-gray-100 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    {/* Prescription ID */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {record.prescriptionId}
                        </span>
                      </div>
                    </td>

                    {/* Patient Name */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#eef8fb] text-[#0ab3b3] flex items-center justify-center font-semibold text-xs shrink-0">
                          {record.initials}
                        </div>
                        <span className="text-sm font-medium text-gray-800 dark:text-white">
                          {record.patientName}
                        </span>
                      </div>
                    </td>

                    {/* Prescription Date */}
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {record.prescriptionDate}
                    </td>

                    {/* Processed Date */}
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {record.processedDate}
                    </td>

                    {/* Pharmacist */}
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {record.pharmacistName}
                    </td>

                    {/* Medicines Dispensed */}
                    <td className="px-4 py-4">
                      <Badge variant="default">
                        {record.medicinesDispensed} medicines
                      </Badge>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          record.status === "Completed" ? "success" : "default"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-4">
                      <button
                        title="View details"
                        className="p-2 rounded-lg text-gray-400 hover:text-cyan-600 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 dark:hover:text-cyan-400 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredHistory.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
                No dispensing records found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
