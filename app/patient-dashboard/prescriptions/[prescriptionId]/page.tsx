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
import { PrescriptionDocument } from "../../../components/PrescriptionDocument";
import { usePrescriptionExport } from "../../../hooks/usePrescriptionExport";

const sidebarItems = [
  { icon: <Activity className="w-5 h-5" />, label: "Dashboard", href: "/patient-dashboard" },
  { icon: <Calendar className="w-5 h-5" />, label: "Appointments", href: "/patient-dashboard/appointments" },
  { icon: <HeartPulse className="w-5 h-5" />, label: "Medical Records", href: "/patient-dashboard/records" },
  { icon: <Pill className="w-5 h-5" />, label: "Prescriptions", href: "/patient-dashboard/prescriptions" },
];

export default function PatientPrescriptionViewer() {
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params.prescriptionId as string;

  const [rx, setRx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);
  const {
    prescriptionRef,
    handlePrint,
    handleDownloadPdf,
    isDownloading,
  } = usePrescriptionExport(rx?.id ?? `RX-${prescriptionId}`);

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
            designation: data.doctor.designation || undefined,
            department: data.doctor.department || undefined,
            qualifications: data.doctor.qualifications || undefined,
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
        <div className="prescription-viewer-toolbar flex items-center justify-between gap-4 flex-wrap">
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
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>
          </div>
        </div>

        {/* Document Viewer */}
        <div className="prescription-document-viewer bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto p-6 min-h-[75vh]">
          <div
            className="prescription-zoom-wrapper"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              transition: "transform 0.15s ease",
            }}
          >
            <PrescriptionDocument ref={prescriptionRef} rx={rx} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
