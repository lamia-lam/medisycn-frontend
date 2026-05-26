"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../../components/DashboardLayout";
import {
  Activity,
  Calendar,
  Pill,
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  Printer,
  HeartPulse,
  CheckCircle2,
  AlertCircle,
  Microscope,
  Loader2
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const sidebarItems = [
  { icon: <Activity className="w-5 h-5" />, label: "Dashboard", href: "/patient-dashboard" },
  { icon: <Calendar className="w-5 h-5" />, label: "Appointments", href: "/patient-dashboard/appointments" },
  { icon: <HeartPulse className="w-5 h-5" />, label: "Medical Records", href: "/patient-dashboard/records" },
  { icon: <Pill className="w-5 h-5" />, label: "Prescriptions", href: "/patient-dashboard/prescriptions" },
];

export default function PatientPrescriptionViewer() {
  const router = useRouter();
  const params = useParams();
  const [zoom, setZoom] = useState(100);

  const prescriptionId = params.prescriptionId as string;
  
  const [rx, setRx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!prescriptionId) return;

    async function fetchPrescription() {
      try {
        const res = await fetch(`/api/patient/prescription/${prescriptionId}`);
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
            website: "www.medisync.health",
          },
          diagnosis: data.diagnosis,
          symptoms: data.symptoms || "None reported",
          medicines: data.medicines || [],
          tests: data.tests || [],
          notes: data.notes || "No additional notes.",
          followUp: "As needed", 
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
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading prescription details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !rx) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Prescription not found
          </p>
          <p className="text-sm text-gray-400">
            {error || `The prescription "${prescriptionId}" could not be located.`}
          </p>
          <button
            onClick={() => router.push("/patient-dashboard/prescriptions")}
            className="mt-2 text-cyan-600 hover:underline text-sm font-medium"
          >
            ← Back to Prescriptions
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/patient-dashboard/prescriptions")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white leading-tight">
                Prescription Viewer
              </h2>
              <p className="text-sm text-gray-400 font-mono">{rx.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Zoom Controls */}
            <div className="flex items-center gap-1 border border-gray-200 dark:border-gray-600 rounded-lg px-1 py-1 bg-white dark:bg-gray-800">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300 px-2 min-w-[44px] text-center">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto p-6 min-h-[75vh]">
          <div
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
            }}
          >
            {/* A4-proportioned document */}
            <div className="max-w-3xl mx-auto bg-white shadow-xl rounded-sm border border-gray-300">
              <div className="p-10">
                {/* Letterhead */}
                <div className="text-center mb-8 pb-6 border-b-2 border-cyan-600">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-600 rounded-xl mb-3">
                    <span className="text-xl font-bold text-white">MS</span>
                  </div>
                  <h1 className="text-2xl font-bold text-cyan-600 mb-1">
                    {rx.hospital.name}
                  </h1>
                  <p className="text-sm text-gray-500">{rx.hospital.address}</p>
                  <p className="text-sm text-gray-500">
                    Phone: {rx.hospital.phone} &nbsp;|&nbsp; {rx.hospital.website}
                  </p>
                </div>

                {/* Document Title */}
                <div className="text-center mb-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Medical Prescription
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">{rx.diagnosis}</h2>
                  <p className="text-sm text-gray-400 font-mono mt-1">{rx.id}</p>
                </div>

                {/* Doctor & Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Prescribing Doctor
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-gray-800">{rx.doctor.name}</p>
                      <p className="text-sm text-cyan-600">{rx.doctor.specialization}</p>
                      <p className="text-sm text-gray-500">License: {rx.doctor.license}</p>
                      <p className="text-sm text-gray-500">Phone: {rx.doctor.phone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Patient Information
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-gray-800">{rx.patient.name}</p>
                      <p className="text-sm text-gray-500">ID: #{rx.patient.id}</p>
                      <p className="text-sm text-gray-500">
                        {rx.patient.age} years · {rx.patient.gender}
                      </p>
                      <p className="text-sm text-gray-500">{rx.patient.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Date & ID */}
                <div className="grid grid-cols-2 gap-5 mb-7">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">Date Issued</p>
                    <p className="font-medium text-gray-800">{rx.date}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">Prescription ID</p>
                    <p className="font-mono font-medium text-gray-800">{rx.id}</p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="border-t border-gray-200 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Diagnosis
                  </p>
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                    <p className="text-gray-800 font-medium">{rx.diagnosis}</p>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="border-t border-gray-100 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Presenting Symptoms
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 text-sm leading-relaxed">{rx.symptoms}</p>
                  </div>
                </div>

                {/* Prescribed Medications */}
                <div className="border-t border-gray-100 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Prescribed Medications
                  </p>
                  <div className="space-y-4">
                    {rx.medicines.map((medicine: any, index: number) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        {/* Medicine Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {index + 1}.&nbsp;{medicine.name}{" "}
                              <span className="text-cyan-600">{medicine.strength}</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {medicine.dosage} · {medicine.frequency} · {medicine.timing}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium whitespace-nowrap">
                            {medicine.duration}
                          </span>
                        </div>

                        {/* Instructions */}
                        <div className="px-5 py-3 border-t border-gray-100 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Instructions: </span>
                            {medicine.instructions}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Diagnostic Tests */}
                {rx.tests && rx.tests.length > 0 && (
                  <div className="border-t border-gray-100 pt-6 mb-7">
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
                          className="border border-orange-200 rounded-xl overflow-hidden"
                        >
                          <div className="flex items-center justify-between px-5 py-3 bg-orange-50">
                            <div>
                              <p className="font-semibold text-gray-800 text-sm">
                                {index + 1}.&nbsp;{test.name}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{test.type}</p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                test.urgency === "STAT (Immediate)"
                                  ? "bg-red-100 text-red-700"
                                  : test.urgency === "Urgent"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {test.urgency}
                            </span>
                          </div>
                          {test.instructions && (
                            <div className="px-5 py-3 border-t border-orange-100 flex items-start gap-2">
                              <CheckCircle2 className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                              <p className="text-sm text-gray-600">
                                <span className="font-medium text-gray-700">Instructions: </span>
                                {test.instructions}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Additional Notes */}
                <div className="border-t border-gray-100 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Additional Notes
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{rx.notes}</p>
                  </div>
                </div>

                {/* Follow-up */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 mb-7">
                  <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Follow-up Appointment: </span>
                    {rx.followUp}
                  </p>
                </div>

                {/* Signature Row */}
                <div className="pt-6 border-t border-gray-200 flex items-end justify-between gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-3">Authorized Signature</p>
                    <div className="w-52 border-b-2 border-gray-300 pb-1 mb-2">
                      <p className="text-2xl italic text-gray-700 font-serif">
                        {rx.doctor.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">{rx.doctor.name}</p>
                    <p className="text-xs text-gray-400">{rx.doctor.specialization}</p>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Digitally Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Generated: {rx.date}</p>
                    <p className="text-xs text-gray-400">MediSync Health System</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-400 space-y-0.5 border-t border-gray-100 pt-4">
                  <p>
                    This is a computer-generated prescription and does not require a physical signature.
                  </p>
                  <p>Report generated on {rx.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
