"use client";

import {
  LayoutDashboard,
  Search,
  Package,
  History,
  FileText,
  AlertTriangle,
  PackageOpen,
  Users,
  Clock,
  TrendingUp,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";
import { useEffect, useState } from "react";

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

function getRelativeTime(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hours ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} days ago`;
}

export default function PharmacyDashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await fetch("/api/pharmacy/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  const { stats, recentPrescriptions, lowStockMedicines, recentPatients } = data || {
    stats: { prescriptionsProcessed: 0, lowStockMedicines: 0, totalMedicines: 0, outOfStock: 0, patientsServed: 0 },
    recentPrescriptions: [],
    lowStockMedicines: [],
    recentPatients: []
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        {/* Header Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-6 text-white shadow-sm">
          <h2 className="text-2xl font-semibold mb-1">
            Good Morning, Pharmacist!
          </h2>
          <p className="text-teal-100 text-sm">MediSync Pharmacy</p>
          <p className="text-teal-100 text-sm mt-0.5">{currentDate}</p>
        </div>

        {/* Stat Cards — 5 columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            label="Prescriptions Processed"
            value={stats.prescriptionsProcessed.toString()}
            icon={<FileText className="w-6 h-6" />}
            trend="Today"
            color="bg-blue-500"
          />
          <StatCard
            label="Low Stock Medicines"
            value={stats.lowStockMedicines.toString()}
            icon={<AlertTriangle className="w-6 h-6" />}
            trend="Need restock"
            color="bg-yellow-500"
          />
          <StatCard
            label="Total Medicines"
            value={stats.totalMedicines.toString()}
            icon={<Package className="w-6 h-6" />}
            trend="In inventory"
            color="bg-teal-500"
          />
          <StatCard
            label="Out of Stock"
            value={stats.outOfStock.toString()}
            icon={<PackageOpen className="w-6 h-6" />}
            trend="Medicines"
            color="bg-red-500"
          />
          <StatCard
            label="Patients Served"
            value={stats.patientsServed.toString()}
            icon={<Users className="w-6 h-6" />}
            trend="Today"
            color="bg-green-500"
          />
        </div>

        {/* Prescriptions + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Prescriptions */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Recently Processed Prescriptions
              </h3>
              <TrendingUp className="w-5 h-5 text-gray-400" />
            </div>
            <div className="space-y-3">
              {recentPrescriptions.length === 0 ? (
                <p className="text-sm text-gray-500">No recent prescriptions processed.</p>
              ) : (
                recentPrescriptions.map((prescription: any) => (
                  <div
                    key={prescription.recordId}
                    className="flex items-center justify-between p-4 bg-gray-50/70 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-[#eef8fb] text-[#0ab3b3] flex items-center justify-center font-semibold text-sm shrink-0">
                        {prescription.initials}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-0.5">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {prescription.patientName}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-medium">
                            {prescription.id}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          Prescribed by {prescription.doctorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1.5">
                        {prescription.medicines} medicines
                      </p>
                      <div className="flex items-center justify-end gap-2">
                        <Badge
                          variant={
                            prescription.status === "Processed" || prescription.status === "Completed"
                              ? "success"
                              : "default"
                          }
                        >
                          {prescription.status}
                        </Badge>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {getRelativeTime(prescription.time)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Low Stock Alerts */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Low Stock Alerts
              </h3>
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
            </div>
            <div className="space-y-3">
              {lowStockMedicines.length === 0 ? (
                <p className="text-sm text-gray-500">No low stock medicines.</p>
              ) : (
                lowStockMedicines.map((medicine: any, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {medicine.name}
                      </p>
                      <Badge variant="danger">Low</Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                      <span>Remaining: {medicine.quantity}</span>
                      <span>Min: {medicine.threshold}</span>
                    </div>
                    <div className="w-full bg-yellow-200 dark:bg-yellow-900/50 rounded-full h-1.5">
                      <div
                        className="bg-yellow-500 h-1.5 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            (medicine.quantity / medicine.threshold) * 100,
                            100,
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Patient Activity Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
              Recent Patient Activity
            </h3>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-l-lg">
                    Patient Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Total Prescriptions
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Last Visit
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-r-lg">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentPatients.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-4 text-sm text-gray-500 text-center">
                      No recent patient activity.
                    </td>
                  </tr>
                ) : (
                  recentPatients.map((patient: any, index: number) => (
                    <tr
                      key={index}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${index !== recentPatients.length - 1
                          ? "border-b border-gray-100 dark:border-gray-700"
                          : ""
                        }`}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#eef8fb] text-[#0ab3b3] flex items-center justify-center font-semibold text-sm shrink-0">
                            {patient.initials}
                          </div>
                          <span className="font-medium text-gray-800 dark:text-white">
                            {patient.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-700 dark:text-gray-300">
                        {patient.prescriptions}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {getRelativeTime(patient.time)}
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-sm text-cyan-600 hover:text-cyan-700 hover:underline font-medium transition-colors">
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

