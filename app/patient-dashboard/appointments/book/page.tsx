"use client";

import { useState } from "react";
import { DashboardLayout } from "../../../components/DashboardLayout";
import {
  Activity,
  Calendar,
  Pill,
  ArrowLeft,
  User,
  Phone,
  Droplet,
  Building2,
  Stethoscope,
  Clock,
  ClipboardList,
  HeartPulse,
  CheckCircle2,
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

const departments = [
  "Internal Medicine",
  "Cardiology",
  "Orthopedics",
  "Dermatology",
  "Pediatrics",
  "Gynecology",
  "Neurology",
  "Ophthalmology",
];

const doctors: Record<string, string[]> = {
  "Internal Medicine": ["Dr. Sarah Smith", "Dr. John Wilson"],
  Cardiology: ["Dr. Michael Brown", "Dr. Emily Davis"],
  Orthopedics: ["Dr. Robert Johnson", "Dr. Lisa Anderson"],
  Dermatology: ["Dr. David Lee", "Dr. Maria Garcia"],
  Pediatrics: ["Dr. James Taylor", "Dr. Jennifer Martinez"],
  Gynecology: ["Dr. Patricia Rodriguez", "Dr. Linda Hernandez"],
  Neurology: ["Dr. Christopher Lopez", "Dr. Barbara Wilson"],
  Ophthalmology: ["Dr. Daniel Moore", "Dr. Nancy Clark"],
};

const timeSlots = [
  "09:00 AM",
  "09:30 AM",
  "10:00 AM",
  "10:30 AM",
  "11:00 AM",
  "11:30 AM",
  "02:00 PM",
  "02:30 PM",
  "03:00 PM",
  "03:30 PM",
  "04:00 PM",
  "04:30 PM",
];

const serviceTypes = [
  "General Checkup",
  "Follow-up",
  "Report Review",
  "Consultation",
  "Emergency Visit",
];

const patientInfo = {
  name: "John Doe",
  phone: "+1 (555) 123-4567",
  age: 34,
  gender: "Male",
  bloodGroup: "B+",
  patientId: "#P0042",
};

export default function BookAppointment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    department: "",
    doctor: "",
    date: "",
    time: "",
    serviceType: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const availableDoctors = formData.department
    ? doctors[formData.department] || []
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      router.push("/patient-dashboard/appointments");
    }, 1800);
  };

  const today = new Date().toISOString().split("T")[0];

  if (submitted) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Appointment Booked!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your appointment with{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {formData.doctor}
              </span>{" "}
              on{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {formData.date}
              </span>{" "}
              at{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {formData.time}
              </span>{" "}
              has been scheduled.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Redirecting to appointments…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push("/patient-dashboard/appointments")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-0.5">
              Book New Appointment
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Schedule your healthcare appointment
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Info Banner */}
          <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-100 mb-4">
              Patient Information
            </p>
            <div className="flex items-center gap-5 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl shrink-0">
                JD
              </div>
              <div>
                <h3 className="text-lg font-semibold">{patientInfo.name}</h3>
                <p className="text-cyan-100 text-sm">{patientInfo.patientId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-cyan-200 mb-1">Phone</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {patientInfo.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-200 mb-1">Age</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  {patientInfo.age} years
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-200 mb-1">Gender</p>
                <p className="text-sm font-medium">{patientInfo.gender}</p>
              </div>
              <div>
                <p className="text-xs text-cyan-200 mb-1">Blood Group</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Droplet className="w-3.5 h-3.5 shrink-0" />
                  {patientInfo.bloodGroup}
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Details Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-6">
              Appointment Details
            </h3>

            <div className="space-y-5">
              {/* Department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Building2 className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  Department
                </label>
                <select
                  value={formData.department}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      department: e.target.value,
                      doctor: "",
                    })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer"
                  required
                >
                  <option value="">Select department…</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Stethoscope className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  Doctor
                </label>
                <select
                  value={formData.doctor}
                  onChange={(e) =>
                    setFormData({ ...formData, doctor: e.target.value })
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!formData.department}
                  required
                >
                  <option value="">
                    {formData.department
                      ? "Select doctor…"
                      : "Select a department first"}
                  </option>
                  {availableDoctors.map((doc) => (
                    <option key={doc} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date & Service Type */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <Calendar className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    min={today}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    <ClipboardList className="w-4 h-4 inline mr-1.5 text-gray-400" />
                    Service Type
                  </label>
                  <select
                    value={formData.serviceType}
                    onChange={(e) =>
                      setFormData({ ...formData, serviceType: e.target.value })
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer"
                    required
                  >
                    <option value="">Select service type…</option>
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Time Slots */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Clock className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  Time Slot
                  {!formData.time && (
                    <span className="text-red-400 ml-1 text-xs font-normal">
                      * required
                    </span>
                  )}
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setFormData({ ...formData, time: slot })}
                      className={`px-3 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                        formData.time === slot
                          ? "bg-cyan-600 text-white border-cyan-600 shadow-sm"
                          : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/10"
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes (optional) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Notes{" "}
                  <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData({ ...formData, notes: e.target.value })
                  }
                  rows={3}
                  placeholder="Describe your symptoms or reason for visit…"
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none placeholder-gray-400"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/patient-dashboard/appointments")}
              className="px-6 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!formData.time}
              className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Confirm Appointment
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
