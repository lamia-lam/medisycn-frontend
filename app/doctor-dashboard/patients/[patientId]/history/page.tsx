"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../../../components/DashboardLayout";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  ArrowLeft,
  Pill,
  Phone,
  Droplets,
  Clock,
  X,
  FolderOpen,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Microscope,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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

interface Medicine {
  name: string;
  dosage?: string;
  frequency?: string;
  duration?: string;
  instructions?: string;
}

interface Prescription {
  id: number;
  diagnosis: string;
  symptoms?: string | null;
  medicines: Medicine[] | string[];
  tests?: unknown;
  notes?: string | null;
  createdAt: string;
  doctor: {
    id: number;
    department?: string | null;
    specialization?: string | null;
    user: { name: string };
  };
}

interface Patient {
  id: number;
  age?: number | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  bloodGroup?: string | null;
  condition?: string | null;
  address?: string | null;
  status: string;
  user: { name: string; email?: string | null; phone?: string | null };
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getMedicineNames(medicines: Medicine[] | string[]): string[] {
  if (!medicines || !Array.isArray(medicines)) return [];
  return medicines.map((m) => {
    if (typeof m === "string") return m;
    if (m.name) {
      return m.dosage ? `${m.name} ${m.dosage}` : m.name;
    }
    return String(m);
  });
}

export default function PatientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params?.patientId as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [recordsModal, setRecordsModal] = useState<Prescription | null>(null);
  const [rxModal, setRxModal] = useState<Record<string, unknown> | null>(null);
  const [rxLoading, setRxLoading] = useState(false);

  async function openPrescriptionModal(id: number) {
    setRxLoading(true);
    setRxModal({} as Record<string, unknown>); // open modal in loading state
    try {
      const res = await fetch(`/api/doctor/prescription/${id}`);
      if (!res.ok) throw new Error("Failed to load");
      const data = await res.json();
      setRxModal(data);
    } catch {
      setRxModal(null);
    } finally {
      setRxLoading(false);
    }
  }

  useEffect(() => {
    if (!patientId) return;
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [patientId]);

  async function fetchHistory() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/doctor/patients/${patientId}/history`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to load history");
      }
      const data = await res.json();
      setPatient(data.patient);
      setPrescriptions(data.prescriptions);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* Back + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/doctor-dashboard/patients")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-0.5">
              Prescription History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Chronological prescription timeline
            </p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Loading patient history…
            </p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {error}
            </p>
            <button
              onClick={fetchHistory}
              className="text-sm text-cyan-600 hover:underline font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {!loading && !error && patient && (
          <>
            {/* Patient Banner */}
            <div className="bg-gradient-to-r from-cyan-700 to-cyan-500 text-white rounded-2xl p-6 shadow-lg">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shrink-0 border border-white/30">
                    {getInitials(patient.user.name)}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-1">
                      {patient.user.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                      {patient.bloodGroup && (
                        <span className="flex items-center gap-1.5">
                          <Droplets className="w-3.5 h-3.5" />
                          {patient.bloodGroup}
                        </span>
                      )}
                      {patient.bloodGroup && <span>•</span>}
                      {patient.age && <span>{patient.age} years old</span>}
                      {patient.age && patient.gender && <span>•</span>}
                      {patient.gender && <span>{patient.gender}</span>}
                      {patient.gender && <span>•</span>}
                      <span>#{patient.id}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70 mt-1.5">
                      {patient.user.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          {patient.user.phone}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                {patient.condition && (
                  <div className="text-right shrink-0">
                    <p className="text-sm text-white/70 mb-1">
                      Primary Condition
                    </p>
                    <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full text-sm font-medium">
                      {patient.condition}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Prescription Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-cyan-500" />
                  </div>
                  Prescription Timeline
                </h3>
                <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                  {prescriptions.length} prescription
                  {prescriptions.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="p-6">
                {prescriptions.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                      <FileText className="w-7 h-7 text-gray-400" />
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No prescriptions found for this patient.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    {/* Vertical timeline line */}
                    <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-cyan-400 via-cyan-300 to-gray-200 dark:to-gray-700" />

                    <div className="space-y-5">
                      {prescriptions.map((prescription, index) => {
                        const medicineNames = getMedicineNames(
                          prescription.medicines as Medicine[] | string[]
                        );
                        return (
                          <div
                            key={prescription.id}
                            className="relative flex gap-6"
                          >
                            {/* Timeline dot */}
                            <div className="relative shrink-0 w-10 flex flex-col items-center">
                              <div
                                className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow z-10 mt-3 ${
                                  index === 0
                                    ? "bg-cyan-500"
                                    : "bg-gray-300 dark:bg-gray-600"
                                }`}
                              />
                            </div>

                            {/* Card */}
                            <div className="flex-1 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-all">
                              {/* Header row */}
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-white mb-0.5">
                                    {prescription.diagnosis}
                                  </p>
                                  <div className="flex items-center gap-2 text-xs text-gray-400">
                                    <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                                      RX-{prescription.id
                                        .toString()
                                        .padStart(4, "0")}
                                    </span>
                                    {prescription.doctor.department && (
                                      <>
                                        <span>·</span>
                                        <span>
                                          {prescription.doctor.department}
                                        </span>
                                      </>
                                    )}
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                    {formatDate(prescription.createdAt)}
                                  </p>
                                  <p className="text-xs text-gray-400 flex items-center justify-end gap-1 mt-0.5">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(prescription.createdAt)}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-0.5">
                                    {prescription.doctor.user.name}
                                  </p>
                                </div>
                              </div>

                              {/* Medicine tags */}
                              {medicineNames.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-3">
                                  {medicineNames.map((med, idx) => (
                                    <span
                                      key={idx}
                                      className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium"
                                    >
                                      <Pill className="w-3 h-3" />
                                      {med}
                                    </span>
                                  ))}
                                </div>
                              )}

                              {/* Actions */}
                              <div className="flex items-center gap-3 pt-2.5 border-t border-gray-200 dark:border-gray-700">
                                <button
                                  onClick={() => openPrescriptionModal(prescription.id)}
                                  className="inline-flex items-center gap-1.5 text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 font-semibold transition-colors"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  View Prescription
                                </button>
                                <span className="text-gray-300 dark:text-gray-600">
                                  |
                                </span>
                                <button
                                  onClick={() => setRecordsModal(prescription)}
                                  className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium transition-colors"
                                >
                                  <Microscope className="w-3.5 h-3.5" />
                                  Test Records
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Full Prescription Modal ── */}
      {rxModal !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setRxModal(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {rxLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="w-9 h-9 text-cyan-500 animate-spin" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading prescription…</p>
              </div>
            ) : (
              <>
                {/* ── Top action bar ── */}
                <div className="flex items-center justify-between px-6 pt-5 pb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                      Prescription Details
                    </h3>
                    <p className="text-sm text-gray-400 font-mono">
                      RX-{String(rxModal?.id ?? "").padStart(4, "0")}
                    </p>
                  </div>
                  <button
                    onClick={() => setRxModal(null)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* ── Prescription Document ── */}
                <div className="mx-4 mb-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
                  {/* Hospital Header Banner */}
                  <div className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white px-8 py-8 text-center">
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 mb-3">
                      <span className="text-xl font-bold">MS</span>
                    </div>
                    <h4 className="text-xl font-semibold mb-0.5">MediSync Health Center</h4>
                    <p className="text-sm text-white/80">456 Healthcare Ave, Springfield, IL 62702</p>
                    <p className="text-sm text-white/80">Phone: +1 (555) 111-2222</p>
                  </div>

                  {/* Document body */}
                  <div className="p-6 space-y-6">
                    {/* Doctor + Patient */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Doctor Information
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-1">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {(rxModal?.doctor as Record<string, string>)?.name}
                          </p>
                          <p className="text-sm text-cyan-600 dark:text-cyan-400">
                            {(rxModal?.doctor as Record<string, string>)?.specialization || "Doctor"}
                          </p>
                          <p className="text-sm text-gray-500">
                            License: {(rxModal?.doctor as Record<string, string>)?.license || "—"}
                          </p>
                          <p className="text-sm text-gray-500">
                            Phone: {(rxModal?.doctor as Record<string, string>)?.phone || "—"}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                          Patient Information
                        </p>
                        <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-1">
                          <p className="font-semibold text-gray-800 dark:text-white">
                            {(rxModal?.patient as Record<string, string>)?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            ID: P{String((rxModal?.patient as Record<string, string>)?.id ?? "").padStart(3, "0")}
                          </p>
                          <p className="text-sm text-gray-500">
                            {(rxModal?.patient as Record<string, string>)?.age} yrs
                            {(rxModal?.patient as Record<string, string>)?.gender && ` · ${(rxModal?.patient as Record<string, string>)?.gender}`}
                          </p>
                          {(rxModal?.patient as Record<string, string>)?.phone && (
                            <p className="text-sm text-gray-500">
                              {(rxModal?.patient as Record<string, string>)?.phone}
                            </p>
                          )}
                          {(rxModal?.patient as Record<string, string>)?.address && (
                            <p className="text-sm text-gray-500">
                              {(rxModal?.patient as Record<string, string>)?.address}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Date + ID row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Date Issued</p>
                        <p className="font-medium text-gray-800 dark:text-white">
                          {rxModal?.createdAt
                            ? new Date(String(rxModal.createdAt)).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : "—"}
                        </p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                        <p className="text-xs text-gray-400 mb-1">Prescription ID</p>
                        <p className="font-mono font-medium text-gray-800 dark:text-white">
                          RX-{String(rxModal?.id ?? "").padStart(4, "0")}
                        </p>
                      </div>
                    </div>

                    {/* Diagnosis */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Diagnosis
                      </p>
                      <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                        <p className="text-gray-800 dark:text-white font-medium">
                          {String(rxModal?.diagnosis ?? "")}
                        </p>
                      </div>
                    </div>

                    {/* Symptoms */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Presenting Symptoms
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                        <p className="text-gray-700 dark:text-gray-300">
                          {rxModal?.symptoms ? String(rxModal.symptoms) : "None reported"}
                        </p>
                      </div>
                    </div>

                    {/* Medicines */}
                    {Array.isArray(rxModal?.medicines) && (rxModal.medicines as unknown[]).length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                          Prescribed Medications
                        </p>
                        <div className="space-y-4">
                          {(rxModal.medicines as Record<string, string>[]).map((med, idx) => (
                            <div key={idx} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                              <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900/50">
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-white">
                                    {idx + 1}.&nbsp;{med.name}&nbsp;
                                    <span className="text-cyan-600 dark:text-cyan-400">{med.strength}</span>
                                  </p>
                                  <p className="text-sm text-gray-500 mt-0.5">
                                    {[med.dosage, med.frequency, med.timing].filter(Boolean).join(" · ")}
                                  </p>
                                </div>
                                {med.duration && (
                                  <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium shrink-0">
                                    {med.duration}
                                  </span>
                                )}
                              </div>
                              {med.instructions && (
                                <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Instructions: </span>
                                    {med.instructions}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tests */}
                    {Array.isArray(rxModal?.tests) && (rxModal.tests as unknown[]).length > 0 && (
                      <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                        <div className="flex items-center gap-2 mb-4">
                          <Microscope className="w-4 h-4 text-orange-500" />
                          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                            Diagnostic Tests Ordered
                          </p>
                        </div>
                        <div className="space-y-3">
                          {(rxModal.tests as Record<string, string>[]).map((test, idx) => (
                            <div key={idx} className="border border-orange-200 dark:border-orange-800 rounded-xl overflow-hidden">
                              <div className="flex items-center justify-between px-5 py-3 bg-orange-50 dark:bg-orange-900/20">
                                <div>
                                  <p className="font-semibold text-gray-800 dark:text-white text-sm">
                                    {idx + 1}.&nbsp;{test.name}
                                  </p>
                                  {test.type && <p className="text-xs text-gray-500 mt-0.5">{test.type}</p>}
                                </div>
                                {test.urgency && (
                                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    test.urgency === "STAT (Immediate)"
                                      ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                                      : test.urgency === "Urgent"
                                      ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                                      : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                                  }`}>
                                    {test.urgency}
                                  </span>
                                )}
                              </div>
                              {test.instructions && (
                                <div className="px-5 py-3 border-t border-orange-100 dark:border-orange-900/30 flex items-start gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
                                    <span className="font-medium text-gray-700 dark:text-gray-300">Instructions: </span>
                                    {test.instructions}
                                  </p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    <div className="border-t border-gray-100 dark:border-gray-700 pt-5">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                        Additional Notes
                      </p>
                      <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                          {rxModal?.notes ? String(rxModal.notes) : "No additional notes."}
                        </p>
                      </div>
                    </div>

                    {/* Follow-up */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <span className="font-semibold">Follow-up Appointment: </span>
                        As needed
                      </p>
                    </div>

                    {/* Signature row */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-5 flex items-end justify-between gap-6">
                      <div>
                        <p className="text-xs text-gray-400 mb-3">Authorized Signature</p>
                        <div className="w-48 border-b-2 border-gray-300 dark:border-gray-600 pb-1 mb-2">
                          <p className="text-2xl italic text-gray-700 dark:text-gray-300 font-serif">
                            {(rxModal?.doctor as Record<string, string>)?.name}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {(rxModal?.doctor as Record<string, string>)?.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {(rxModal?.doctor as Record<string, string>)?.specialization || "Doctor"}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-2 rounded-lg mb-3">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700 dark:text-green-400">
                            Digitally Verified
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {rxModal?.createdAt
                            ? new Date(String(rxModal.createdAt)).toLocaleDateString("en-US")
                            : ""}
                        </p>
                        <p className="text-xs text-gray-400">MediSync Health System</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Test Records Modal ── */}
      {recordsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setRecordsModal(null)}
        >
          <div
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-cyan-700 to-cyan-500 p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs text-white/70 mb-0.5 font-mono">
                    RX-{recordsModal.id.toString().padStart(4, "0")}
                  </p>
                  <h3 className="text-lg font-semibold text-white">
                    Test Records
                  </h3>
                  <p className="text-sm text-white/70 mt-1">
                    {formatDate(recordsModal.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setRecordsModal(null)}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[65vh] overflow-y-auto">
              {/* Prescription summary */}
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                  Prescription Summary
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Prescription ID
                    </span>
                    <span className="font-mono font-medium text-gray-800 dark:text-white">
                      RX-{recordsModal.id.toString().padStart(4, "0")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Date
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      {formatDate(recordsModal.createdAt)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Doctor
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      {recordsModal.doctor.user.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Diagnosis
                    </span>
                    <span className="text-gray-800 dark:text-white text-right max-w-[60%]">
                      {recordsModal.diagnosis}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">
                      Medicines
                    </span>
                    <span className="text-gray-800 dark:text-white">
                      {(recordsModal.medicines as unknown[]).length} item(s)
                    </span>
                  </div>
                </div>
              </div>

              {/* Ordered tests if any */}
              {recordsModal.tests &&
                Array.isArray(recordsModal.tests) &&
                recordsModal.tests.length > 0 && (
                  <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">
                      Ordered Tests
                    </p>
                    <div className="space-y-2">
                      {(recordsModal.tests as { name?: string; test?: string }[]).map(
                        (test, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
                          >
                            <ChevronRight className="w-4 h-4 text-cyan-500 shrink-0" />
                            {test.name || test.test || String(test)}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* No records notice */}
              {(!recordsModal.tests ||
                !Array.isArray(recordsModal.tests) ||
                recordsModal.tests.length === 0) && (
                <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-center">
                  <FolderOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    No additional records attached to this prescription.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
