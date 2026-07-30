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
  Printer,
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
  serialNo: number | null;
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
  const [printingDate, setPrintingDate] = useState<string | null>(null);

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

  const filtered = appointments.filter((a) => {
    const matchSearch =
      (a.patientName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.type ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus =
      filterStatus === "all" || a.status.toLowerCase() === filterStatus.toLowerCase();
    
    // Filter out past appointments (keep today and future)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchNotPast = new Date(a.date).getTime() >= today.getTime();
    
    return matchSearch && matchStatus && matchNotPast;
  });
  // Sort by date (oldest first or newest?), then by createdAt
  const sorted = [...filtered].sort((a, b) => {
    const d1 = new Date(a.date).getTime();
    const d2 = new Date(b.date).getTime();
    if (d1 === d2) {
      // if same time slot, whoever requested first is shown first
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return d1 - d2;
  });

  const groupedByDate = sorted.reduce((acc, apt) => {
    const dateStr = new Date(apt.date).toLocaleDateString("en-US", {
      weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
    });
    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(apt);
    return acc;
  }, {} as Record<string, Appointment[]>);

  const stats = {
    pending: filtered.filter((a) => a.status === "Pending").length,
    confirmed: filtered.filter((a) => a.status === "Confirmed").length,
    cancelled: filtered.filter((a) => a.status === "Cancelled").length,
  };

  const handlePrint = (dateStr: string) => {
    setPrintingDate(dateStr);
    setTimeout(() => {
      window.print();
      setPrintingDate(null);
    }, 100);
  };

  return (
    <>
      <div className={printingDate ? "print:hidden" : ""}>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
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

          {/* Grouped Tables */}
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="text-center py-16">
                <p className="text-gray-400 text-sm">Loading appointments…</p>
              </div>
            ) : Object.keys(groupedByDate).length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">No appointments found</p>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
              </div>
            ) : (
              Object.entries(groupedByDate).map(([dateStr, apts]) => (
                <div key={dateStr} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      {dateStr}
                    </h3>
                    <button
                      onClick={() => handlePrint(dateStr)}
                      className="print:hidden flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-cyan-700 bg-cyan-50 dark:bg-cyan-900/30 dark:text-cyan-300 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 rounded-md transition-colors shadow-sm"
                      title="Print Appointments for this day"
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                  <div className="overflow-x-auto bg-white dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                    <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400 min-w-[700px]">
                      <thead className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-5 py-3.5 font-medium w-24">Serial No</th>
                          <th className="px-5 py-3.5 font-medium">Patient</th>
                          <th className="px-5 py-3.5 font-medium">Phone Number</th>
                          <th className="px-5 py-3.5 font-medium">Type</th>
                          <th className="px-5 py-3.5 font-medium">Status</th>
                          <th className="px-5 py-3.5 font-medium text-right w-28">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {apts.map((apt) => (
                          <tr key={apt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors">
                            <td className="px-5 py-4 font-medium text-gray-800 dark:text-gray-200">
                              {apt.serialNo ? (
                                <span className="bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300 px-2 py-1 rounded text-xs">
                                  #{apt.serialNo}
                                </span>
                              ) : "—"}
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-full ${avatarColor(apt.patientId)} flex items-center justify-center font-semibold text-xs shrink-0 shadow-sm`}>
                                  {initials(apt.patientName)}
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 dark:text-gray-200">{apt.patientName}</p>
                                  <div className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-gray-400 mt-0.5">
                                    {apt.patientGender && <span>{apt.patientGender}</span>}
                                    {apt.patientGender && apt.patientBloodGroup && <span>•</span>}
                                    {apt.patientBloodGroup && <span>Blood: {apt.patientBloodGroup}</span>}
                                  </div>
                                  {apt.notes && <p className="text-xs text-gray-500 dark:text-gray-400 italic mt-1 max-w-[220px] truncate" title={apt.notes}>{apt.notes}</p>}
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 font-medium">
                              {apt.patientPhone || "—"}
                            </td>
                            <td className="px-5 py-4">
                              {apt.type ? (
                                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                                  {apt.type}
                                </span>
                              ) : "—"}
                            </td>
                            <td className="px-5 py-4">
                              {statusBadge(apt.status)}
                            </td>
                            <td className="px-5 py-4 text-right">
                              {apt.status === "Pending" && (
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => handleAccept(apt.id)}
                                    disabled={actionLoading}
                                    className="p-1.5 border border-green-200 dark:border-green-800 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-md transition-colors shadow-sm"
                                    title="Confirm Appointment"
                                  >
                                    <Check className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => handleDecline(apt.id)}
                                    disabled={actionLoading}
                                    className="p-1.5 border border-red-200 dark:border-red-800 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors shadow-sm"
                                    title="Decline"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
        </DashboardLayout>
      </div>

      {/* Print View Container */}
      {printingDate && (
        <div className="hidden print:block p-8 bg-white text-black min-h-screen">
          <div className="border-b-2 border-gray-200 pb-6 mb-8 flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-1">MediSync</h1>
              <p className="text-gray-600 text-lg">Daily Appointment Schedule</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-gray-800">{printingDate}</p>
            </div>
          </div>

          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 w-24">Serial No</th>
                <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-800">Patient</th>
                <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 w-32">Phone</th>
                <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 w-40">Type</th>
                <th className="border border-gray-300 px-4 py-3 font-semibold text-gray-800 w-32">Status</th>
              </tr>
            </thead>
            <tbody>
              {groupedByDate[printingDate]?.map(apt => (
                <tr key={apt.id}>
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    {apt.serialNo ? `#${apt.serialNo}` : "—"}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 font-semibold text-gray-900">
                    {apt.patientName}
                  </td>
                  <td className="border border-gray-300 px-4 py-3 font-medium">
                    {apt.patientPhone || "—"}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {apt.type || "—"}
                  </td>
                  <td className="border border-gray-300 px-4 py-3">
                    {apt.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
