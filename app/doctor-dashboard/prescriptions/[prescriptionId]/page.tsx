"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../../components/DashboardLayout";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  ArrowLeft,
  Download,
  Printer,
  Send,
  CheckCircle2,
  Microscope,
  Loader2,
  AlertCircle
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const sidebarItems = [
  { icon: <Activity className="w-5 h-5" />, label: "Dashboard", href: "/doctor-dashboard" },
  { icon: <Users className="w-5 h-5" />, label: "Patients", href: "/doctor-dashboard/patients" },
  { icon: <FileText className="w-5 h-5" />, label: "Prescriptions", href: "/doctor-dashboard/prescriptions" },
  { icon: <Calendar className="w-5 h-5" />, label: "Appointments", href: "/doctor-dashboard/appointments" },
];

export default function PrescriptionViewerPage() {
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params?.prescriptionId as string;

  const [rx, setRx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!prescriptionId) return;

    async function fetchPrescription() {
      try {
        const res = await fetch(`/api/doctor/prescription/${prescriptionId}`);
        if (!res.ok) throw new Error("Failed to load prescription details");
        const data = await res.json();
        
        // Transform for UI
        setRx({
          id: `RX-${data.id}`,
          date: new Date(data.createdAt).toISOString().split('T')[0],
          patient: {
            name: data.patient.name,
            id: `P${data.patient.id.toString().padStart(3, '0')}`,
            age: data.patient.age || "-",
            gender: data.patient.gender || "-",
            phone: data.patient.phone || "-",
            address: data.patient.address || "-",
          },
          doctor: {
            name: data.doctor.name,
            specialization: data.doctor.specialization || "Doctor",
            license: data.doctor.license || "-",
            phone: data.doctor.phone || "-",
          },
          hospital: {
            name: "MediSync Health Center",
            address: "456 Healthcare Ave, Springfield, IL 62702",
            phone: "+1 (555) 111-2222",
          },
          diagnosis: data.diagnosis,
          symptoms: data.symptoms || "None reported",
          medicines: data.medicines || [],
          tests: data.tests || [],
          notes: data.notes || "No additional notes.",
          followUp: "As needed", // Not in schema currently, could be added later
        });
      } catch (err: any) {
        setError(err.message || "Failed to load prescription");
      } finally {
        setLoading(false);
      }
    }
    
    fetchPrescription();
  }, [prescriptionId]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading prescription details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !rx) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-gray-800 dark:text-white font-medium text-lg">Error loading prescription</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">{error}</p>
          <button
            onClick={() => router.push("/doctor-dashboard/prescriptions")}
            className="mt-4 px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg transition-colors text-sm font-medium"
          >
            Back to Prescriptions
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* ── Top Action Bar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/doctor-dashboard/prescriptions")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-0.5">
                Prescription Details
              </h2>
              <p className="text-sm text-gray-400 font-mono">{rx.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Send className="w-4 h-4" />
              Send to Pharmacy
            </button>
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* ── Prescription Document ── */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {/* Hospital Header Banner */}
          <div className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white px-8 py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30 mb-4">
              <span className="text-2xl font-bold">MS</span>
            </div>
            <h1 className="text-2xl font-semibold mb-1">{rx.hospital.name}</h1>
            <p className="text-sm text-white/80">{rx.hospital.address}</p>
            <p className="text-sm text-white/80">Phone: {rx.hospital.phone}</p>
          </div>

          {/* Document Body */}
          <div className="p-8 space-y-7">
            {/* Doctor + Patient */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Doctor Information
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-1">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {rx.doctor.name}
                  </p>
                  <p className="text-sm text-cyan-600 dark:text-cyan-400">
                    {rx.doctor.specialization}
                  </p>
                  <p className="text-sm text-gray-500">
                    License: {rx.doctor.license}
                  </p>
                  <p className="text-sm text-gray-500">
                    Phone: {rx.doctor.phone}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Patient Information
                </p>
                <div className="bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-1">
                  <p className="font-semibold text-gray-800 dark:text-white">
                    {rx.patient.name}
                  </p>
                  <p className="text-sm text-gray-500">ID: {rx.patient.id}</p>
                  <p className="text-sm text-gray-500">
                    {rx.patient.age} years · {rx.patient.gender}
                  </p>
                  <p className="text-sm text-gray-500">{rx.patient.phone}</p>
                  <p className="text-sm text-gray-500">{rx.patient.address}</p>
                </div>
              </div>
            </div>

            {/* Date + ID row */}
            <div className="grid grid-cols-2 gap-5">
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Date Issued</p>
                <p className="font-medium text-gray-800 dark:text-white">
                  {rx.date}
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                <p className="text-xs text-gray-400 mb-1">Prescription ID</p>
                <p className="font-mono font-medium text-gray-800 dark:text-white">
                  {rx.id}
                </p>
              </div>
            </div>

            {/* Diagnosis */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Diagnosis
              </p>
              <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                <p className="text-gray-800 dark:text-white font-medium">
                  {rx.diagnosis}
                </p>
              </div>
            </div>

            {/* Symptoms */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Presenting Symptoms
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                <p className="text-gray-700 dark:text-gray-300">
                  {rx.symptoms}
                </p>
              </div>
            </div>

            {/* Medicines */}
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                Prescribed Medications
              </p>
              <div className="space-y-4">
                {rx.medicines.map((medicine: any, index: number) => (
                  <div
                    key={index}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                  >
                    {/* Medicine Header */}
                    <div className="flex items-center justify-between px-5 py-4 bg-gray-50 dark:bg-gray-900/50">
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white">
                          {index + 1}.&nbsp;{medicine.name}{" "}
                          <span className="text-cyan-600 dark:text-cyan-400">
                            {medicine.strength}
                          </span>
                        </p>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {medicine.dosage} · {medicine.frequency} ·{" "}
                          {medicine.timing}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium">
                        {medicine.duration}
                      </span>
                    </div>

                    {/* Instructions */}
                    <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-700 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          Instructions:{" "}
                        </span>
                        {medicine.instructions}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Diagnostic Tests */}
            {rx.tests && rx.tests.length > 0 && (
              <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Microscope className="w-4 h-4 text-orange-500" />
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                    Diagnostic Tests Ordered
                  </p>
                </div>
                <div className="space-y-3">
                  {rx.tests.map((test: any, index: number) => (
                    <div
                      key={index}
                      className="border border-orange-200 dark:border-orange-800 rounded-xl overflow-hidden"
                    >
                      <div className="flex items-center justify-between px-5 py-3 bg-orange-50 dark:bg-orange-900/20">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white text-sm">
                            {index + 1}.&nbsp;{test.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">{test.type}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            test.urgency === "STAT (Immediate)"
                              ? "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300"
                              : test.urgency === "Urgent"
                              ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                              : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300"
                          }`}
                        >
                          {test.urgency}
                        </span>
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
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                Additional Notes
              </p>
              <div className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-4">
                <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                  {rx.notes}
                </p>
              </div>
            </div>

            {/* Follow-up */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <span className="font-semibold">Follow-up Appointment: </span>
                {rx.followUp}
              </p>
            </div>

            {/* Signature Row */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs text-gray-400 mb-3">
                  Authorized Signature
                </p>
                <div className="w-52 border-b-2 border-gray-300 dark:border-gray-600 pb-1 mb-2">
                  <p className="text-2xl italic text-gray-700 dark:text-gray-300 font-serif">
                    {rx.doctor.name}
                  </p>
                </div>
                <p className="text-sm text-gray-500">{rx.doctor.name}</p>
                <p className="text-xs text-gray-400">
                  {rx.doctor.specialization}
                </p>
              </div>

              <div className="text-right">
                <div className="inline-flex items-center gap-2 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 px-4 py-2 rounded-lg mb-3">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-700 dark:text-green-400">
                    Digitally Verified
                  </span>
                </div>
                <p className="text-xs text-gray-400">Generated: {rx.date}</p>
                <p className="text-xs text-gray-400">MediSync Health System</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
