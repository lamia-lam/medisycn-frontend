"use client";

import { useState, useEffect } from "react";
import {
  Calendar,
  Users,
  FileText,
  Activity,
  Clock,
  Plus,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
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

type Appointment = {
  id: number;
  patient: string;
  time: string;
  type: string;
  status: string;
};

type RecentPatient = {
  id: number;
  name: string;
  lastVisit: string;
};

export default function DoctorDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [data, setData] = useState({
    doctorName: "",
    stats: {
      totalPatients: 0,
      todaysAppointments: 0,
      totalPrescriptions: 0,
    },
    appointments: [] as Appointment[],
    recentPatients: [] as RecentPatient[],
  });

  useEffect(() => {
    fetch("/api/doctor/dashboard")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.error === "Account pending approval") {
          setPending(true);
        } else if (!resData.error) {
          setData(resData);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (pending) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
        <div className="flex h-[80vh] items-center justify-center">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 text-yellow-600 rounded-full mb-4">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
              Account Pending Approval
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Your account is currently under review by the administration. You
              will be able to access the dashboard once your license has been
              verified.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[1.75rem] font-medium text-gray-800 dark:text-white mb-1">
              Hello, {data.doctorName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Here's what's happening today
            </p>
          </div>
          <button
            onClick={() => router.push("/doctor-dashboard/prescriptions/new")}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Prescription
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Today's Appointments"
            value={data.stats.todaysAppointments}
            trend="Appointments today"
            color="bg-cyan-500"
          />
          <StatCard
            icon={<Users className="w-6 h-6" />}
            label="Patients"
            value={data.stats.totalPatients}
            trend="Total patients"
            color="bg-blue-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Prescriptions"
            value={data.stats.totalPrescriptions}
            trend="Total prescriptions"
            color="bg-green-500"
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
              {data.appointments.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  No appointments scheduled for today.
                </div>
              ) : (
                data.appointments.map((apt, index) => (
                  <div
                    key={apt.id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between py-3 gap-3 sm:gap-0 ${index !== data.appointments.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
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
                ))
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Recent Patients
              </h3>
            </div>
            <div className="space-y-4">
              {data.recentPatients.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  No recent patients found.
                </div>
              ) : (
                data.recentPatients.map((patient, index) => (
                  <div
                    key={patient.id}
                    className={`flex items-center justify-between py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors ${index !== data.recentPatients.length - 1 ? "border-b border-gray-100 dark:border-gray-700" : ""}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-[#eef8fb] text-[#0ab3b3] flex items-center justify-center font-medium">
                        {patient.name.charAt(0)}
                      </div>
                      <p className="font-medium text-gray-800 dark:text-white">
                        {patient.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        Last visit
                      </p>
                      <p className="text-sm font-medium">{patient.lastVisit}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
