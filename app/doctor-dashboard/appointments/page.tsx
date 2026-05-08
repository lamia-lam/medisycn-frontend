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
  Clock,
  Check,
  X,
  CalendarClock,
  Phone,
} from "lucide-react";

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

interface Appointment {
  id: number;
  patient: string;
  patientId: string;
  date: string;
  time: string;
  type: string;
  notes: string;
  status: "Pending" | "Confirmed" | "Declined";
  phone: string;
  initials: string;
  avatarColor: string;
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    patient: "John Doe",
    patientId: "P001",
    date: "2026-05-08",
    time: "09:00 AM",
    type: "Consultation",
    notes: "Follow-up for blood pressure monitoring",
    status: "Pending",
    phone: "+1 (555) 123-4567",
    initials: "JD",
    avatarColor: "bg-cyan-100 text-cyan-700",
  },
  {
    id: 2,
    patient: "Jane Smith",
    patientId: "P002",
    date: "2026-05-08",
    time: "10:30 AM",
    type: "Follow-up",
    notes: "Diabetes management checkup",
    status: "Confirmed",
    phone: "+1 (555) 234-5678",
    initials: "JS",
    avatarColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 3,
    patient: "Mike Johnson",
    patientId: "P003",
    date: "2026-05-08",
    time: "02:00 PM",
    type: "Check-up",
    notes: "Routine asthma check",
    status: "Pending",
    phone: "+1 (555) 345-6789",
    initials: "MJ",
    avatarColor: "bg-green-100 text-green-700",
  },
  {
    id: 4,
    patient: "Sarah Williams",
    patientId: "P004",
    date: "2026-05-09",
    time: "11:00 AM",
    type: "Consultation",
    notes: "Arthritis pain management",
    status: "Pending",
    phone: "+1 (555) 456-7890",
    initials: "SW",
    avatarColor: "bg-orange-100 text-orange-700",
  },
  {
    id: 5,
    patient: "Robert Brown",
    patientId: "P005",
    date: "2026-05-09",
    time: "03:30 PM",
    type: "Follow-up",
    notes: "Heart disease monitoring",
    status: "Confirmed",
    phone: "+1 (555) 567-8901",
    initials: "RB",
    avatarColor: "bg-red-100 text-red-700",
  },
  {
    id: 6,
    patient: "Emily Davis",
    patientId: "P006",
    date: "2026-05-10",
    time: "09:30 AM",
    type: "Consultation",
    notes: "Migraine treatment consultation",
    status: "Declined",
    phone: "+1 (555) 678-9012",
    initials: "ED",
    avatarColor: "bg-pink-100 text-pink-700",
  },
];

const typeColors: Record<string, string> = {
  Consultation:
    "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300",
  "Follow-up":
    "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "Check-up":
    "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
};

export default function AppointmentsPage() {
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rescheduleModal, setRescheduleModal] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const handleConfirm = (id: number) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "Confirmed" } : apt,
      ),
    );
  };

  const handleDecline = (id: number) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: "Declined" } : apt)),
    );
  };

  const handleReschedule = (id: number) => {
    if (rescheduleDate && rescheduleTime) {
      // Convert 24h time to 12h AM/PM
      const [h, m] = rescheduleTime.split(":").map(Number);
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      const formatted = `${String(h12).padStart(2, "0")}:${String(m).padStart(2, "0")} ${ampm}`;

      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id
            ? {
                ...apt,
                date: rescheduleDate,
                time: formatted,
                status: "Confirmed",
              }
            : apt,
        ),
      );
      setRescheduleModal(null);
      setRescheduleDate("");
      setRescheduleTime("");
    }
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.patient.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || apt.status.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: appointments.length,
    pending: appointments.filter((a) => a.status === "Pending").length,
    confirmed: appointments.filter((a) => a.status === "Confirmed").length,
    declined: appointments.filter((a) => a.status === "Declined").length,
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
            Appointment Management
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage patient appointments and schedules
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total",
              value: stats.total,
              icon: <Calendar className="w-5 h-5 text-cyan-500" />,
              bg: "bg-cyan-50 dark:bg-cyan-900/20",
              iconBg: "bg-cyan-100 dark:bg-cyan-900/40",
              valueColor: "text-cyan-600",
            },
            {
              label: "Pending",
              value: stats.pending,
              icon: <Clock className="w-5 h-5 text-yellow-500" />,
              bg: "bg-yellow-50 dark:bg-yellow-900/20",
              iconBg: "bg-yellow-100 dark:bg-yellow-900/40",
              valueColor: "text-yellow-600",
            },
            {
              label: "Confirmed",
              value: stats.confirmed,
              icon: <Check className="w-5 h-5 text-green-500" />,
              bg: "bg-green-50 dark:bg-green-900/20",
              iconBg: "bg-green-100 dark:bg-green-900/40",
              valueColor: "text-green-600",
            },
            {
              label: "Declined",
              value: stats.declined,
              icon: <X className="w-5 h-5 text-red-500" />,
              bg: "bg-red-50 dark:bg-red-900/20",
              iconBg: "bg-red-100 dark:bg-red-900/40",
              valueColor: "text-red-600",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-4 flex items-center gap-4`}
            >
              <div
                className={`${stat.iconBg} w-11 h-11 rounded-lg flex items-center justify-center shrink-0`}
              >
                {stat.icon}
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                  {stat.label}
                </p>
                <p className={`text-2xl font-bold ${stat.valueColor}`}>
                  {stat.value}
                </p>
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
                  placeholder="Search by patient name, ID, or appointment type..."
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
                  <option value="declined">Declined</option>
                </select>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {filteredAppointments.length}
              </span>{" "}
              of {appointments.length} appointments
            </p>
          </div>

          {/* Appointment Cards */}
          <div className="p-6 space-y-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all"
              >
                {/* Top Row */}
                <div className="flex items-start gap-4">
                  <div
                    className={`w-12 h-12 rounded-full ${appointment.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                  >
                    {appointment.initials}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-800 dark:text-white">
                        {appointment.patient}
                      </h4>
                      <Badge
                        variant={
                          appointment.status === "Confirmed"
                            ? "success"
                            : appointment.status === "Declined"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {appointment.status}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 mb-3">
                      <span>{appointment.patientId}</span>
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {appointment.phone}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {appointment.date}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {appointment.time}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          typeColors[appointment.type] ??
                          "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {appointment.type}
                      </span>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                      {appointment.notes}
                    </div>
                  </div>
                </div>

                {/* Action Row — only for Pending */}
                {appointment.status === "Pending" && (
                  <div className="flex items-center gap-3 mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => handleConfirm(appointment.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      Confirm
                    </button>
                    <button
                      onClick={() => setRescheduleModal(appointment.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleDecline(appointment.id)}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <X className="w-4 h-4" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Empty State */}
            {filteredAppointments.length === 0 && (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                  <Calendar className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 font-medium">
                  No appointments found
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Try adjusting your search or filters
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Reschedule Modal ── */}
      {rescheduleModal !== null && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-200 dark:border-gray-700 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                <CalendarClock className="w-5 h-5 text-cyan-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-gray-400">
                  Select a new date and time
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setRescheduleModal(null);
                  setRescheduleDate("");
                  setRescheduleTime("");
                }}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReschedule(rescheduleModal)}
                disabled={!rescheduleDate || !rescheduleTime}
                className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirm Reschedule
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
