"use client";

import { useState, useEffect } from "react";
import { Users, FileText, Calendar, Activity, Loader2, ShieldAlert } from "lucide-react";
import { StatCard } from "../components/StatCard";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalPharmacies: 0,
    totalDiagnostics: 0,
    pendingApprovals: 0,
    totalAppointments: 0,
    totalPrescriptions: 0,
  });

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (res.status === 401 || res.status === 403) {
          router.replace("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success) {
          setStats(data.stats);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-[1.75rem] font-medium text-gray-800 dark:text-white mb-1">
            System Overview
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Monitor overall platform activity and manage users.
          </p>
        </div>
        
        {stats.pendingApprovals > 0 && (
          <button
            onClick={() => router.push("/admin-dashboard/users")}
            className="inline-flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm animate-pulse"
          >
            <ShieldAlert className="w-5 h-5" />
            {stats.pendingApprovals} Pending Approvals
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Patients"
          value={stats.totalPatients}
          trend="Registered on platform"
          color="bg-blue-500"
        />
        <StatCard
          icon={<Users className="w-6 h-6" />}
          label="Total Doctors"
          value={stats.totalDoctors}
          trend="Registered on platform"
          color="bg-cyan-500"
        />
        <StatCard
          icon={<Calendar className="w-6 h-6" />}
          label="Total Appointments"
          value={stats.totalAppointments}
          trend="Platform wide"
          color="bg-purple-500"
        />
        <StatCard
          icon={<FileText className="w-6 h-6" />}
          label="Total Prescriptions"
          value={stats.totalPrescriptions}
          trend="Issued to date"
          color="bg-green-500"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
         <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-4">Other Registered Entities</h3>
            <div className="space-y-4">
               <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Pharmacies</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{stats.totalPharmacies}</span>
               </div>
               <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
                  <span className="text-gray-600 dark:text-gray-300">Diagnostic Centers</span>
                  <span className="font-semibold text-gray-800 dark:text-white">{stats.totalDiagnostics}</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
