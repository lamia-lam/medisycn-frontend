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

const upcomingAppointments = [
  {
    id: 1,
    doctor: "Dr. Emily Clarke",
    specialty: "Cardiologist",
    date: "2026-05-12",
    time: "10:00 AM",
    type: "Follow-up",
    status: "Confirmed" as const,
    initials: "EC",
    avatarColor: "bg-cyan-100 text-cyan-700",
  },
  {
    id: 2,
    doctor: "Dr. James Wilson",
    specialty: "General Physician",
    date: "2026-05-15",
    time: "02:30 PM",
    type: "Consultation",
    status: "Pending" as const,
    initials: "JW",
    avatarColor: "bg-purple-100 text-purple-700",
  },
  {
    id: 3,
    doctor: "Dr. Sarah Patel",
    specialty: "Dermatologist",
    date: "2026-05-20",
    time: "11:00 AM",
    type: "Check-up",
    status: "Confirmed" as const,
    initials: "SP",
    avatarColor: "bg-green-100 text-green-700",
  },
];

const recentPrescriptions = [
  {
    id: 1,
    doctor: "Dr. Emily Clarke",
    diagnosis: "Hypertension",
    date: "2026-04-28",
    medicines: ["Amlodipine 5mg", "Lisinopril 10mg"],
  },
  {
    id: 2,
    doctor: "Dr. James Wilson",
    diagnosis: "Type 2 Diabetes",
    date: "2026-04-15",
    medicines: ["Metformin 500mg", "Glipizide 5mg"],
  },
];

export default function PatientDashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    fetch("/api/patient/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(console.error);
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
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-[1.75rem] font-medium text-gray-800 dark:text-white mb-1">
              Welcome back, {firstName}! 👋
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
            label="Upcoming Appointments"
            value={3}
            trend="Next: May 12"
            color="bg-cyan-500"
          />
          <StatCard
            icon={<FileText className="w-6 h-6" />}
            label="Active Prescriptions"
            value={2}
            trend="Updated Apr 28"
            color="bg-blue-500"
          />
          <StatCard
            icon={<HeartPulse className="w-6 h-6" />}
            label="Medical Records"
            value={8}
            trend="+1 this month"
            color="bg-green-500"
          />
          <StatCard
            icon={<Clock className="w-6 h-6" />}
            label="Last Visit"
            value="Apr 28"
            trend="Dr. Emily Clarke"
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
                  <span>DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
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
              {upcomingAppointments.map((apt, index) => (
                <div
                  key={apt.id}
                  className={`flex items-center gap-4 py-3 ${
                    index !== upcomingAppointments.length - 1
                      ? "border-b border-gray-100 dark:border-gray-700"
                      : ""
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${apt.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                  >
                    {apt.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                      {apt.doctor}
                    </p>
                    <p className="text-xs text-gray-400">{apt.specialty}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {apt.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {apt.time}
                      </span>
                    </div>
                  </div>
                  <Badge
                    variant={apt.status === "Confirmed" ? "success" : "warning"}
                  >
                    {apt.status}
                  </Badge>
                </div>
              ))}
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
              {recentPrescriptions.map((rx, index) => (
                <div
                  key={rx.id}
                  onClick={() =>
                    router.push(`/patient-dashboard/prescriptions/${rx.id}`)
                  }
                  className={`py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-2 px-2 rounded-lg transition-colors ${
                    index !== recentPrescriptions.length - 1
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
                        {rx.doctor}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {rx.date}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rx.medicines.map((med) => (
                      <span
                        key={med}
                        className="inline-flex items-center gap-1 text-xs bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400 px-2 py-0.5 rounded-full"
                      >
                        <Pill className="w-3 h-3" /> {med}
                      </span>
                    ))}
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
