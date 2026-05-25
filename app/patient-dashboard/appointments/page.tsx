"use client";
import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  Activity,
  Calendar,
  Pill,
  Plus,
  Search,
  Filter,
  Clock,
  Building2,
  HeartPulse,
  X,
  CheckCircle2,
  XCircle,
  Hourglass,
} from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
  { icon: <Activity className="w-5 h-5" />, label: "Dashboard", href: "/patient-dashboard" },
  { icon: <Calendar className="w-5 h-5" />, label: "Appointments", href: "/patient-dashboard/appointments" },
  { icon: <HeartPulse className="w-5 h-5" />, label: "Medical Records", href: "/patient-dashboard/records" },
  { icon: <Pill className="w-5 h-5" />, label: "Prescriptions", href: "/patient-dashboard/prescriptions" },
];

interface Appointment {
  id: number;
  doctorName: string;
  doctorSpecialization: string | null;
  date: string;
  type: string | null;
  status: "Pending" | "Confirmed" | "Cancelled";
  notes?: string | null;
  createdAt: string;
}

const statusConfig = {
  Pending: {
    badge: "bg-yellow-100 text-yellow-700",
    icon: <Hourglass className="w-4 h-4" />,
    message: "Awaiting confirmation from your doctor.",
  },
  Confirmed: {
    badge: "bg-green-100 text-green-700",
    icon: <CheckCircle2 className="w-4 h-4" />,
    message: "Your appointment is confirmed. Please arrive 10 minutes early.",
  },
  Cancelled: {
    badge: "bg-red-100 text-red-600",
    icon: <XCircle className="w-4 h-4" />,
    message:
      "This appointment was not accepted. Please book a new appointment at your convenience.",
  },
};

export default function PatientAppointments() {
  const router = useRouter();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // ── Load appointments ────────────────────────────────────
  useEffect(() => {
    fetch("/api/patient/appointments")
      .then((r) => r.json())
      .then((data) => {
        setAppointments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setAppointments([]);
        setLoading(false);
      });
  }, []);

  // ── Cancel (only Pending) ────────────────────────────────
  const handleCancel = async (id: number) => {
    const res = await fetch("/api/patient/appointments", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ appointmentId: id, action: "cancel" }),
    });
    if (res.ok) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: "Cancelled" } : a))
      );
    }
  };

  // ── Filter + Search ──────────────────────────────────────
  const filtered = (appointments ?? [])
    .filter((a) => {
      const matchSearch =
        (a.doctorName ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.doctorSpecialization ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (a.type ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus =
        filterStatus === "all" || a.status.toLowerCase() === filterStatus;
      return matchSearch && matchStatus;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              My Appointments
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Track your upcoming and past appointments
            </p>
          </div>
          <button
            onClick={() => router.push("/patient-dashboard/appointments/book")}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Book New
          </button>
        </div>

        {/* Panel */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          {/* Search + Filter */}
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by doctor, department, or type..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Cards */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm">Loading appointments…</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">No appointments found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((apt) => {
                const cfg = statusConfig[apt.status] ?? statusConfig.Pending;
                return (
                  <div
                    key={apt.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1">
                          {apt.doctorName}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5" />
                          {apt.doctorSpecialization ?? "General"}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${cfg.badge}`}>
                        {cfg.icon}
                        {apt.status}
                      </span>
                    </div>

                    {/* Date / Time / Type */}
                    <div className="space-y-1.5 my-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span>{new Date(apt.date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span>
                          {new Date(apt.date).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {apt.type && (
                        <span className="inline-block mt-1 px-3 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                          {apt.type}
                        </span>
                      )}
                    </div>

                    {/* Status message */}
                    <div className={`mt-3 pt-3 border-t border-gray-100 dark:border-gray-700`}>
                      <p className="text-xs text-gray-500 dark:text-gray-400 italic">
                        {cfg.message}
                      </p>

                      {/* Cancel button — Pending only */}
                      {apt.status === "Pending" && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm"
                        >
                          <X className="w-4 h-4" />
                          Cancel Appointment
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
