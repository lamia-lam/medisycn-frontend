"use client";
import { useState, useEffect } from "react";
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

// ── Types ────────────────────────────────────────────────
interface Doctor {
  id: number;
  specialization: string | null;
  department: string | null;
  designation: string | null;
  availability: any;
  user: { name: string };
}

interface PatientInfo {
  name: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  patientId: string;
}

const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const serviceTypes = [
  "General Checkup",
  "Follow-up",
  "Report Review",
  "Consultation",
  "Emergency Visit",
];

export default function BookAppointment() {
  const router = useRouter();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: "",
    phone: "",
    age: 0,
    gender: "",
    bloodGroup: "",
    patientId: "",
  });
  const [formData, setFormData] = useState({
    department: "",
    doctorId: "",
    date: "",
    serviceType: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ── load patient info + doctors on mount ─────────────────
  useEffect(() => {
    // get logged-in patient's info
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.patient) {
          setPatientInfo({
            name: data.name ?? "",
            phone: data.phone ?? "",
            age: data.patient.age ?? 0,
            gender: data.patient.gender ?? "",
            bloodGroup: data.patient.bloodGroup ?? "",
            patientId: `#P${String(data.patient.id).padStart(4, "0")}`,
          });
        }
      })
      .catch(() => { });

    // get all available doctors
    fetch("/api/doctor/list")
      .then((r) => r.json())
      .then((data) => {
        setDoctors(Array.isArray(data) ? data : []);
      })
      .catch(() => setDoctors([]));
  }, []);

  // ── departments from real doctors ────────────────────────
  const departments = [
    ...new Set(doctors.map((d) => d.department).filter(Boolean) as string[]),
  ];

  // ── doctors filtered by selected department ──────────────
  const availableDoctors = formData.department
    ? doctors.filter((d) => d.department === formData.department)
    : [];

  // ── form submit → calls real API ─────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.doctorId) {
      setError("Please select a doctor.");
      return;
    }

    // block submission if date doesn't match doctor's schedule
    if (selectedDoctor && formData.date && scheduleDays.length > 0) {
      const [y, m, d] = formData.date.split("-").map(Number);
      const pickedDay = daysOfWeek[new Date(y, m - 1, d).getDay()];
      if (!scheduleDays.includes(pickedDay)) {
        setError(`${selectedDoctor.user.name} is only available on ${scheduleDays.join(" and ")}. Please pick a valid date.`);
        return;
      }
    }

    setSubmitting(true);

    // date validation
    const getLocalDateString = (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    };
    const todayStr = getLocalDateString(new Date());
    const maxDateObj = new Date();
    maxDateObj.setDate(maxDateObj.getDate() + 7);
    const maxDateStr = getLocalDateString(maxDateObj);

    if (formData.date < todayStr || formData.date > maxDateStr) {
      setError("Appointments can only be booked up to 1 week in advance.");
      setSubmitting(false);
      return;
    }

    // combine date with a default time into one ISO datetime string
    const dateTime = `${formData.date}T00:00:00`;

    const res = await fetch("/api/patient/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        doctorId: formData.doctorId,
        date: dateTime,
        type: formData.serviceType,
        notes: formData.notes,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
      return;
    }

    setSubmitted(true);
    setTimeout(() => {
      router.push("/patient-dashboard/appointments");
    }, 1800);
  };

  const getLocalDateString = (d: Date) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const today = getLocalDateString(new Date());
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 7);
  const maxDate = getLocalDateString(maxDateObj);

  // ── selected doctor name for success message ─────────────
  const selectedDoctor = doctors.find(
    (d) => String(d.id) === String(formData.doctorId),
  );

  let doctorSchedule: any[] = [];
  if (selectedDoctor && selectedDoctor.availability) {
    try {
      doctorSchedule = typeof selectedDoctor.availability === "string"
        ? JSON.parse(selectedDoctor.availability)
        : selectedDoctor.availability;

      if (!Array.isArray(doctorSchedule)) {
        doctorSchedule = [];
      }
    } catch (e) {
      doctorSchedule = [];
    }
  }

  const format12Hour = (time24: string) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    const hours = parseInt(h, 10);
    const suffix = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${m} ${suffix}`;
  };

  // ── schedule-day validation ──────────────────────────────
  const scheduleDays = doctorSchedule.map((s: any) => s.day as string);

  let dateError = "";
  if (selectedDoctor && formData.date && scheduleDays.length > 0) {
    const [year, month, day] = formData.date.split("-").map(Number);
    if (year && month && day) {
      const pickedDay = daysOfWeek[new Date(year, month - 1, day).getDay()];
      if (!scheduleDays.includes(pickedDay)) {
        dateError = `${selectedDoctor.user.name} is only available on ${scheduleDays.join(" and ")}. Please pick a valid date.`;
      }
    }
  }

  // ── Success screen ───────────────────────────────────────
  if (submitted) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
              Appointment Requested!
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Your appointment with{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {selectedDoctor?.user.name ?? "the doctor"}
              </span>{" "}
              on{" "}
              <span className="font-medium text-gray-700 dark:text-gray-200">
                {formData.date}
              </span>{" "}
              has been submitted. Waiting for doctor confirmation.
            </p>
            <p className="text-gray-400 text-xs mt-2">
              Redirecting to appointments…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Main form ────────────────────────────────────────────
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
          {/* Patient Info Banner — real data from API */}
          <div className="bg-gradient-to-r from-cyan-700 to-cyan-500 rounded-2xl p-6 text-white shadow-lg">
            <p className="text-xs font-semibold uppercase tracking-widest text-cyan-100 mb-4">
              Patient Information
            </p>
            <div className="flex items-center gap-5 mb-4">
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center font-bold text-xl shrink-0">
                {patientInfo.name
                  ? patientInfo.name.charAt(0).toUpperCase()
                  : "?"}
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  {patientInfo.name || "Loading..."}
                </h3>
                <p className="text-cyan-100 text-sm">{patientInfo.patientId}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-cyan-200 mb-1">Phone</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Phone className="w-3.5 h-3.5 shrink-0" />
                  {patientInfo.phone || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-200 mb-1">Age</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <User className="w-3.5 h-3.5 shrink-0" />
                  {patientInfo.age ? `${patientInfo.age} years` : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-200 mb-1">Gender</p>
                <p className="text-sm font-medium">
                  {patientInfo.gender || "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-cyan-200 mb-1">Blood Group</p>
                <p className="flex items-center gap-1.5 text-sm font-medium">
                  <Droplet className="w-3.5 h-3.5 shrink-0" />
                  {patientInfo.bloodGroup || "—"}
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
              {/* Department — built from real doctor data */}
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
                      doctorId: "", // reset doctor when dept changes
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

              {/* Doctor — filtered by department */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  <Stethoscope className="w-4 h-4 inline mr-1.5 text-gray-400" />
                  Doctor
                </label>
                <select
                  value={formData.doctorId}
                  onChange={(e) =>
                    setFormData({ ...formData, doctorId: e.target.value })
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
                    <option key={doc.id} value={doc.id}>
                      {doc.user.name}
                      {doc.designation ? ` - ${doc.designation}` : ""}
                    </option>
                  ))}
                </select>
              </div>

              {/* Doctor Schedule Display */}
              {selectedDoctor && (
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-cyan-600 dark:text-cyan-400" />
                    Doctor's Schedule
                  </h4>
                  {doctorSchedule.length > 0 ? (
                    <>
                      <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                        {doctorSchedule.map((slot: any, idx: number) => (
                          <li key={idx} className="flex items-center">
                            <span className="w-24 font-medium text-gray-700 dark:text-gray-300">{slot.day}</span>
                            <span>{format12Hour(slot.start)} - {format12Hour(slot.end)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="text-xs text-cyan-600 dark:text-cyan-400 mt-3 font-medium bg-cyan-50 dark:bg-cyan-900/20 py-1.5 px-3 rounded-md inline-block">
                        Tip: Please pick a date that falls on one of these days.
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-red-500">This doctor has not set any working hours.</p>
                  )}
                </div>
              )}

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
                    max={maxDate}
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                    required
                  />
                  {dateError && (
                    <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg mt-2 flex items-start gap-2">
                      <span className="shrink-0 mt-0.5">⚠️</span>
                      {dateError}
                    </p>
                  )}
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

              {/* Notes */}
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

              {/* Error message */}
              {error && (
                <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-lg">
                  {error}
                </p>
              )}
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
              disabled={submitting || !!dateError}
              className="px-8 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {submitting ? "Submitting..." : "Confirm Appointment"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
