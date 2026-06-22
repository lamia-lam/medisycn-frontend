"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  Filter,
  FileText,
  Loader2,
  ChevronLeft,
  ChevronRight,
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

type HistoryRecord = {
  id: number;
  prescriptionId: string;
  patientName: string;
  initials: string;
  prescriptionDate: string;
  processedDate: string;
  medicinesDispensed: number;
  status: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export default function DispensingHistory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      limit: "50",
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filterStatus !== "all") params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/pharmacy/history?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load dispensing history");
        return;
      }

      setRecords(data.records);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load dispensing history");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  if (loading && records.length === 0) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
            Dispensing History
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            View all previously processed prescriptions and dispensing records
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by patient name or prescription ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="pl-11 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer text-sm text-gray-700 dark:text-gray-300 min-w-[180px] transition-all"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="partial">Partial</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing{" "}
            <span className="font-semibold text-cyan-600">
              {records.length}
            </span>{" "}
            of {pagination.total} records
          </p>

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
                    Medicines
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-r-lg">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {records.map((record, index) => (
                  <tr
                    key={record.id}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                      index !== records.length - 1
                        ? "border-b border-gray-100 dark:border-gray-700"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-800 dark:text-white">
                          {record.prescriptionId}
                        </span>
                      </div>
                    </td>

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

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {record.prescriptionDate}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {record.processedDate}
                    </td>

                    <td className="px-4 py-4">
                      <Badge variant="default">
                        {record.medicinesDispensed}{" "}
                        {record.medicinesDispensed === 1
                          ? "medicine"
                          : "medicines"}
                      </Badge>
                    </td>

                    <td className="px-4 py-4">
                      <Badge
                        variant={
                          record.status === "Completed" ? "success" : "default"
                        }
                      >
                        {record.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {records.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <History className="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
                No dispensing records found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {pagination.total === 0
                  ? "Records will appear here after prescriptions are dispensed"
                  : "Try adjusting your search or filter"}
              </p>
            </div>
          )}

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.page <= 1 || loading}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <button
                  onClick={() =>
                    setPage((p) => Math.min(pagination.totalPages, p + 1))
                  }
                  disabled={
                    pagination.page >= pagination.totalPages || loading
                  }
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
