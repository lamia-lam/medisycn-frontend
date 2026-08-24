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
  AlertCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import {
  PrescriptionDocument,
  PrescriptionData,
  formatPrescription,
} from "../../../components/PrescriptionDocument";
import { usePrescriptionExport } from "../../../hooks/usePrescriptionExport";

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

export default function PrescriptionViewerPage() {
  const router = useRouter();
  const params = useParams();
  const prescriptionId = params?.prescriptionId as string;

  const [rx, setRx] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);
  const { prescriptionRef, handlePrint, handleDownloadPdf, isDownloading } =
    usePrescriptionExport(rx?.id ?? `RX-${prescriptionId}`);

  useEffect(() => {
    if (!prescriptionId) return;

    async function fetchPrescription() {
      try {
        const res = await fetch(`/api/doctor/prescription/${prescriptionId}`);
        if (!res.ok) throw new Error("Failed to load prescription details");
        const data = await res.json();
        setRx(formatPrescription(data));
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
          <p className="text-gray-500 dark:text-gray-400">
            Loading prescription details...
          </p>
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
          <p className="text-gray-800 dark:text-white font-medium text-lg">
            Error loading prescription
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md">
            {error}
          </p>
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
        <div className="prescription-viewer-toolbar flex flex-col sm:flex-row sm:items-center justify-between gap-4">
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
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:bg-cyan-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
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

        {/* ── Prescription Document ── */}
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
