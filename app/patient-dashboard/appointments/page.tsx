"use client";
import { useState } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";
import {
  Activity,
  Calendar,
  Pill,
  Plus,
  Search,
  Filter,
  CalendarClock,
  X,
  Clock,
  Building2,
  HeartPulse,
} from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/patient-dashboard",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Appointments",
    href: "/patient-dashboard/appointments",
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    label: "Medical Records",
    href: "/patient-dashboard/records",
  },
  {
    icon: <Pill className="w-5 h-5" />,
    label: "Prescriptions",
    href: "/patient-dashboard/prescriptions",
  },
];

interface Appointment {
  id: number;
  doctor: string;
  department: string;
  date: string;
  time: string;
  type: string;
  status: "Pending" | "Confirmed" | "Declined" | "Visited";
}

const initialAppointments: Appointment[] = [
  {
    id: 1,
    doctor: "Dr. Sarah Smith",
    department: "Internal Medicine",
    date: "2026-05-09",
    time: "10:00 AM",
    type: "Follow-up",
    status: "Confirmed",
  },
  {
    id: 2,
    doctor: "Dr. John Wilson",
    department: "Cardiology",
    date: "2026-05-15",
    time: "02:30 PM",
    type: "Consultation",
    status: "Pending",
  },
  {
    id: 3,
    doctor: "Dr. Emily Davis",
    department: "General Medicine",
    date: "2026-04-28",
    time: "09:00 AM",
    type: "General Checkup",
    status: "Visited",
  },
  {
    id: 4,
    doctor: "Dr. Michael Brown",
    department: "Orthopedics",
    date: "2026-04-20",
    time: "11:30 AM",
    type: "Follow-up",
    status: "Visited",
  },
  {
    id: 5,
    doctor: "Dr. Lisa Anderson",
    department: "Dermatology",
    date: "2026-05-20",
    time: "03:00 PM",
    type: "Consultation",
    status: "Pending",
  },
];

const statusBadge = (status: Appointment["status"]) => {
  const styles = {
    Pending: "bg-yellow-100 text-yellow-700",
    Confirmed: "bg-green-100 text-green-700",
    Declined: "bg-red-100 text-red-600",
    Visited: "bg-blue-100 text-blue-600",
  };
  return (
    <span
      className={`text-xs font-medium px-2.5 py-1 rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
};

export default function PatientAppointments() {
  const router = useRouter();
  const [appointments, setAppointments] =
    useState<Appointment[]>(initialAppointments);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [rescheduleModal, setRescheduleModal] = useState<number | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState("");
  const [rescheduleTime, setRescheduleTime] = useState("");

  const handleReschedule = (id: number) => {
    if (rescheduleDate && rescheduleTime) {
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === id
            ? { ...apt, date: rescheduleDate, time: rescheduleTime }
            : apt,
        ),
      );
      setRescheduleModal(null);
      setRescheduleDate("");
      setRescheduleTime("");
    }
  };

  const handleCancel = (id: number) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id ? { ...apt, status: "Declined" } : apt,
      ),
    );
  };

  const filteredAppointments = appointments
    .filter((apt) => {
      const matchesSearch =
        apt.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
        apt.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        filterStatus === "all" || apt.status.toLowerCase() === filterStatus;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              My Appointments
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Manage your healthcare appointments
            </p>
          </div>
          <button
            onClick={() =>
              router.push("/patient-dashboard/appointments/book")
            }
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Book New Appointment
          </button>
        </div>

        {/* Search & Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row gap-3 mb-6">
            {/* Search */}
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
            {/* Filter */}
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
                <option value="declined">Declined</option>
                <option value="visited">Visited</option>
              </select>
            </div>
          </div>

          {/* Appointment Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAppointments.map((appointment) => (
              <div
                key={appointment.id}
                className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 bg-white dark:bg-gray-800 hover:shadow-md transition-shadow"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-800 dark:text-white text-base mb-1">
                      {appointment.doctor}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5" />
                      {appointment.department}
                    </p>
                  </div>
                  {statusBadge(appointment.status)}
                </div>

                {/* Date / Time / Type */}
                <div className="space-y-1.5 my-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span>{appointment.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>{appointment.time}</span>
                  </div>
                  <span className="inline-block mt-1 px-3 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium">
                    {appointment.type}
                  </span>
                </div>

                {/* Actions */}
                {appointment.status === "Pending" && (
                  <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => setRescheduleModal(appointment.id)}
                      className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
                    >
                      <CalendarClock className="w-4 h-4" />
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(appointment.id)}
                      className="flex-1 px-4 py-2 border border-red-200 text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-sm flex items-center justify-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                )}

                {appointment.status === "Confirmed" && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-400 text-center">
                      Appointment confirmed. Actions disabled.
                    </p>
                  </div>
                )}

                {appointment.status === "Visited" && (
                  <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-400 text-center">
                      Visit completed.
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredAppointments.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-400">No appointments found</p>
            </div>
          )}
        </div>
      </div>

      {/* Reschedule Modal */}
      {rescheduleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full m-4 border border-gray-200 dark:border-gray-700 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Reschedule Appointment
            </h3>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Date
                </label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
              <div>
                <label className="block mb-1.5 text-sm font-medium text-gray-700 dark:text-gray-300">
                  New Time
                </label>
                <input
                  type="time"
                  value={rescheduleTime}
                  onChange={(e) => setRescheduleTime(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRescheduleModal(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReschedule(rescheduleModal)}
                className="flex-1 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
