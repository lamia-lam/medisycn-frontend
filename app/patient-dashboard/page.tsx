"use client";

import { useState, useEffect } from "react";

import {
  Calendar,
  FileText,
  Activity,
  Clock,
  Plus,
  ChevronRight,
  Pill,
  HeartPulse,
  User,
  Mail,
  Phone,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "../components/DashboardLayout";
import { StatCard } from "../components/StatCard";
import { Badge } from "../components/Badge";
import { MedicationReminderPopup } from "../components/MedicationReminderPopup";

export const patientSidebarItems = [
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

// Mock data removed in favor of real database fetching

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/patient/profile").then((res) => res.json()),
      fetch("/api/patient/appointments").then((res) => res.json()),
      fetch("/api/patient/prescription").then((res) => res.json()),
      fetch("/api/patient/records").then((res) => res.json()),
    ])
      .then(([profileData, aptsData, rxData, recordsData]) => {
        setProfile(profileData);
        setAppointments(Array.isArray(aptsData) ? aptsData : []);
        setPrescriptions(Array.isArray(rxData) ? rxData : []);
        setRecords(Array.isArray(recordsData) ? recordsData : []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const patientName = profile?.user?.name || "Loading...";
  const firstName = patientName.split(" ")[0];
  const initials = patientName
    .split(" ")
    .map((w: string) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <DashboardLayout sidebarItems={patientSidebarItems} userRole="Patient">
      {/* Medication Reminder Popup — shows once per login session if patient has prescriptions */}
      <MedicationReminderPopup />
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[1.75rem] font-medium text-gray-800 dark:text-white mb-1">
              Welcome back, {firstName}
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Here's a summary of your health overview
            </p>
          </div>
          <button
            onClick={() => router.push("/patient-dashboard/appointments/book")}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Book Appointment
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Calendar className="w-6 h-6" />}
            label="Total appointments"
            value={appointments.length}
            color="bg-cyan-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Total Prescriptions"
            value={prescriptions.length}
            color="bg-blue-500"
          />
          <StatCard
            icon={<HeartPulse className="w-6 h-6" />}
            label=" Total Records"
            value={records.length}
            color="bg-green-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Last Visit"
            value={
              appointments.length > 0
                ? new Date(appointments[0].date).toLocaleDateString()
                : "N/A"
            }
            color="bg-purple-500"
          />
        </div>

        {/* Patient Info Card */}
        <div className="bg-gradient-to-r from-cyan-700 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center font-bold text-2xl shrink-0">
              {profile ? initials : "?"}
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold mb-1">{patientName}</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-cyan-100">
                {profile?.user?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {profile.user.email}
                  </span>
                )}
                {profile?.user?.phone && (
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {profile.user.phone}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />{" "}
                  {profile?.gender || "Unknown"}{" "}
                  {profile?.age ? `, ${profile.age} years` : ""}
                </span>
                {profile?.bloodGroup && (
                  <span>Blood Group: {profile.bloodGroup}</span>
                )}
                {profile?.dateOfBirth && (
                  <span>
                    DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}
                  </span>
                )}
                {profile?.condition && (
                  <span>Condition: {profile.condition}</span>
                )}
                <span>
                  Patient ID: #P{String(profile?.id || 0).padStart(4, "0")}
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push("/patient-dashboard/records")}
              className="hidden md:inline-flex items-center gap-2 bg-cyan-600 border border-white-200 shadow-lg hover:bg-white/10 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              View Records <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Appointments */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Upcoming Appointments
              </h3>
              <button
                onClick={() => router.push("/patient-dashboard/appointments")}
                className="text-[#0ab3b3] hover:underline text-sm font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {appointments.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  No appointments found.
                </div>
              ) : (
                appointments.slice(0, 3).map((apt, index) => {
                  const initials =
                    apt.doctorName
                      ?.split(" ")
                      .map((n: string) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase() || "DR";
                  const avatarColor = "bg-cyan-100 text-cyan-700";

                  return (
                    <div
                      key={apt.id}
                      className={`flex items-center gap-4 py-3 ${
                        index !== Math.min(appointments.length, 3) - 1
                          ? "border-b border-gray-100 dark:border-gray-700"
                          : ""
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-full ${avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                      >
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                          {apt.doctorName}
                        </p>
                        <p className="text-xs text-gray-400">
                          {apt.doctorSpecialization}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />{" "}
                            {new Date(apt.date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />{" "}
                            {new Date(apt.date).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                      <Badge
                        variant={
                          apt.status === "Confirmed"
                            ? "success"
                            : apt.status === "Cancelled"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {apt.status}
                      </Badge>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Recent Prescriptions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
                Recent Prescriptions
              </h3>
              <button
                onClick={() => router.push("/patient-dashboard/prescriptions")}
                className="text-[#0ab3b3] hover:underline text-sm font-medium flex items-center gap-1"
              >
                View All <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-4">
              {prescriptions.length === 0 ? (
                <div className="text-sm text-gray-500 dark:text-gray-400 py-4 text-center">
                  No prescriptions found.
                </div>
              ) : (
                prescriptions.slice(0, 3).map((rx, index) => {
                  let parsedMedicines = [];
                  try {
                    parsedMedicines =
                      typeof rx.medicines === "string"
                        ? JSON.parse(rx.medicines)
                        : rx.medicines;
                  } catch (e) {
                    parsedMedicines = [];
                  }

                  return (
                    <div
                      key={rx.id}
                      onClick={() =>
                        router.push(`/patient-dashboard/prescriptions/${rx.id}`)
                      }
                      className={`py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors ${
                        index !== Math.min(prescriptions.length, 3) - 1
                          ? "border-b border-gray-100 dark:border-gray-700"
                          : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {rx.diagnosis}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {rx.doctor?.name}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400 shrink-0">
                          {new Date(rx.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {Array.isArray(parsedMedicines) &&
                          parsedMedicines
                            .slice(0, 2)
                            .map((med: any, i: number) => (
                              <span
                                key={i}
                                className="inline-flex items-center gap-1 text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full"
                              >
                                <Pill className="w-3 h-3" />{" "}
                                {med.name || "Medicine"}
                              </span>
                            ))}
                        {Array.isArray(parsedMedicines) &&
                          parsedMedicines.length > 2 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-50 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full">
                              +{parsedMedicines.length - 2} more
                            </span>
                          )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
