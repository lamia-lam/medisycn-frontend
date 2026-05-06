"use client";

import {
  Calendar,
  Users,
  FileText,
  Activity,
  Clock,
  Plus,
  Search,
} from "lucide-react";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/doctor-dashboard",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Patients",
    href: "/doctor-dashboard",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Prescriptions",
    href: "/doctor-dashboard",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Appointments",
    href: "/doctor-dashboard",
  },
];

const appointments = [
  {
    id: 1,
    patient: "John Doe",
    time: "09:00 AM",
    type: "Consultation",
    status: "Confirmed" as const,
  },
  {
    id: 2,
    patient: "Jane Smith",
    time: "10:30 AM",
    type: "Follow-up",
    status: "Confirmed" as const,
  },
  {
    id: 3,
    patient: "Mike Johnson",
    time: "02:00 PM",
    type: "Check-up",
    status: "Pending" as const,
  },
  {
    id: 4,
    patient: "Sarah Williams",
    time: "03:30 PM",
    type: "Consultation",
    status: "Confirmed" as const,
  },
];

const recentPatients = [
  {
    id: 1,
    name: "John Doe",
    lastVisit: "2026-04-25",
    condition: "Hypertension",
  },
  { id: 2, name: "Jane Smith", lastVisit: "2026-04-23", condition: "Diabetes" },
  { id: 3, name: "Mike Johnson", lastVisit: "2026-04-20", condition: "Asthma" },
];

export default function DoctorDashboard() {
  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[1.75rem] font-medium text-gray-800 dark:text-white mb-1">
              Good Morning, Dr. Smith
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Here's what's happening today
            </p>
          </div>
          <button className="bg-cyan-600 text-white px-5 py-2.5 rounded-lg hover:bg-[#099e9e] transition-colors flex items-center justify-center gap-2 font-medium">
            <Plus className="w-5 h-5" />
            New Prescription
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Today's Appointments"
            value={8}
            trend="+2 from yesterday"
            color="bg-cyan-500"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Total Patients"
            value={156}
            trend="+12 this month"
            color="bg-blue-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Prescriptions"
            value={23}
            trend="This week"
            color="bg-green-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Avg Wait Time"
            value="12 min"
            trend="-3 min from last week"
            color="bg-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Today's Appointments
              </h3>
              <button className="text-[#0ab3b3] hover:underline text-sm font-medium">
                View All
              </button>
            </div>
            <div className="space-y-4">
              {appointments.map((apt, index) => (
                <div
                  key={apt.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 sm:gap-0 ${index !== appointments.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-800 dark:text-white mb-1">
                      {apt.patient}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-gray-400" />
                        {apt.time}
                      </span>
                      <span className="text-gray-400">{apt.type}</span>
                    </div>
                  </div>
                  <div className="bg-[#e6f8ec] text-[#1aa053] dark:bg-green-900/30 dark:text-green-400 px-3 py-1 rounded-full text-xs font-medium">
                    {apt.status}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4 sm:gap-0">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Recent Patients
              </h3>
              <div className="relative w-full sm:w-auto">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search patients..."
                  className="w-full sm:w-64 pl-9 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0ab3b3]/50 dark:text-white placeholder-gray-400 shadow-sm"
                />
              </div>
            </div>
            <div className="space-y-4">
              {recentPatients.map((patient, index) => (
                <div
                  key={patient.id}
                  className={`flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg cursor-pointer transition-colors ${index !== recentPatients.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#eef8fb] text-[#0ab3b3] flex items-center justify-center font-medium">
                      {patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white mb-0.5">
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {patient.condition}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                      Last visit
                    </p>
                    <p className="text-sm font-medium">{patient.lastVisit}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
