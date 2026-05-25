"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  Search,
  Filter,
  Clock,
  Check,
  X,
  Phone,
} from "lucide-react";

const sidebarItems = [
  { icon: <Activity className="w-5 h-5" />, label: "Dashboard", href: "/doctor-dashboard" },
  { icon: <Users className="w-5 h-5" />, label: "Patients", href: "/doctor-dashboard/patients" },
  { icon: <FileText className="w-5 h-5" />, label: "Prescriptions", href: "/doctor-dashboard/prescriptions" },
  { icon: <Calendar className="w-5 h-5" />, label: "Appointments", href: "/doctor-dashboard/appointments" },
];

interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  patientPhone: string | null;
  patientGender: string | null;
  patientBloodGroup: string | null;
  date: string;
  type: string | null;
  notes: string | null;
  status: "Pending" | "Confirmed" | "Cancelled";
  createdAt: string;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

const avatarColors = [
  "bg-cyan-100 text-cyan-700",
  "bg-purple-100 text-purple-700",
  "bg-green-100 text-green-700",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
  "bg-pink-100 text-pink-700",
  "bg-indigo-100 text-indigo-700",
  "bg-yellow-100 text-yellow-700",
];
const avatarColor = (id: number) => avatarColors[id % avatarColors.length];

const statusBadge = (status: Appointment["status"]) => {
  const styles: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${styles[status] ?? "bg-gray-100 text-gray-600"}`}>
      {status}
    </span>
  );
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetch("/api/doctor/appointments")
      .then((r) => r.json())
      .then((data) => { setAppointments(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => { setAppointments([]); setLoading(false); });
  }, []);

  const handleAccept = async (id: number) => {
    setActionLoading(true);
    const res = await fetch("/api/doctor/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, action: "accept" }),
    });
    setActionLoading(false);
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Confirmed" } : a))
      );
    }
  };

  const handleDecline = async (id: number) => {
    setActionLoading(true);
    const res = await fetch("/api/doctor/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, action: "cancel" }),
    });
    setActionLoading(false);
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a))
      );
    }
  };

  const filtered = appointments
    .filter((a) => {
      const matchSearch =
        (a.patientName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.type ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "all" || a.status.toLowerCase() === filterStatus.toLowerCase();
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    cancelled: appointments.filter((a) => a.status === "Cancelled").length,
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
            Appointment Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Review and respond to patient appointment requests
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total", value: stats.total, icon: <Calendar className="w-5 h-5 text-cyan-500" />, bg: "bg-cyan-50 dark:bg-cyan-900/20", iconBg: "bg-cyan-100 dark:bg-cyan-900/40", valueColor: "text-cyan-600" },
            { label: "Pending", value: stats.pending, icon: <Clock className="w-5 h-5 text-yellow-500" />, bg: "bg-yellow-50 dark:bg-yellow-900/20", iconBg: "bg-yellow-100 dark:bg-yellow-900/40", valueColor: "text-yellow-600" },
            { label: "Confirmed", value: stats.confirmed, icon: <Check className="w-5 h-5 text-green-500" />, bg: "bg-green-50 dark:bg-green-900/20", iconBg: "bg-green-100 dark:bg-green-900/40", valueColor: "text-green-600" },
            { label: "Cancelled", value: stats.cancelled, icon: <X className="w-5 h-5 text-red-500" />, bg: "bg-red-50 dark:bg-red-900/20", iconBg: "bg-red-100 dark:bg-red-900/40", valueColor: "text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-xl p-4 flex items-center gap-4`}>
              <div className={`${stat.iconBg} w-11 h-11 rounded-lg flex items-center justify-center shrink-0`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.valueColor}`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Main Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Search & Filter */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by patient name or appointment type..."
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
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing <span className="font-medium text-gray-600 dark:text-gray-300">{filtered.length}</span> of {appointments.length} appointments
            </p>
          </div>

          {/* Cards */}
          <div className="p-6 space-y-4">
            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">Loading appointments…</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              filtered.map((apt) => (
                <div
                  key={apt.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 rounded-full ${avatarColor(apt.patientId)} flex items-center justify-center font-semibold text-sm shrink-0`}>
                      {initials(apt.patientName)}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-800 dark:text-white">{apt.patientName}</h4>
                        {statusBadge(apt.status)}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                        {apt.patientPhone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" /> {apt.patientPhone}
                          </span>
                        )}
                        {apt.patientGender && <span>{apt.patientGender}</span>}
                        {apt.patientBloodGroup && <span>Blood: {apt.patientBloodGroup}</span>}
                      </div>

                      <div className="flex flex-wrap items-center gap-3 mb-3">
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {new Date(apt.date).toLocaleDateString()}
                        </span>
                        <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {new Date(apt.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </span>
                        {apt.type && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300">
                            {apt.type}
                          </span>
                        )}
                      </div>

                      {apt.notes && (
                        <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                          {apt.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions — Pending only */}
                  {apt.status === "Pending" && (
                    <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() => handleAccept(apt.id)}
                        disabled={actionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <Check className="w-4 h-4" /> Confirm Appointment
                      </button>
                      <button
                        onClick={() => handleDecline(apt.id)}
                        disabled={actionLoading}
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        <X className="w-4 h-4" /> Decline
                      </button>
                    </div>
                  )}

                  {/* Confirmed notice */}
                  {apt.status === "Confirmed" && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-green-600 dark:text-green-400 text-center font-medium">
                        ✓ Appointment confirmed — patient has been notified.
                      </p>
                    </div>
                  )}

                  {/* Cancelled notice */}
                  {apt.status === "Cancelled" && (
                    <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-400 text-center">
                        This appointment was declined.
                      </p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
