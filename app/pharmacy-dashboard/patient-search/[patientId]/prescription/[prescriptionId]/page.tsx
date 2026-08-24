"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Microscope,
  Calendar,
  AlertCircle,
  Loader2,
  ZoomIn,
  ZoomOut,
  Printer,
  Download,
} from "lucide-react";
import { DashboardLayout } from "../../../../../components/DashboardLayout";
import {
  PrescriptionDocument,
  formatPrescription,
} from "../../../../../components/PrescriptionDocument";
import { usePrescriptionExport } from "../../../../../hooks/usePrescriptionExport";

const sidebarItems = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    href: "/pharmacy-dashboard",
  },
  {
    icon: <Search className="w-5 h-5" />,
    label: "Patient Search",
    href: "/pharmacy-dashboard/patient-search",
  },
  {
    icon: <Package className="w-5 h-5" />,
    label: "Medicine Inventory",
    href: "/pharmacy-dashboard/inventory",
  },
  {
    icon: <History className="w-5 h-5" />,
    label: "Dispensing History",
    href: "/pharmacy-dashboard/history",
  },
];


type Medicine = {
  name?: string;
  strength?: string;
  dosage?: string;
  frequency?: string;
  timing?: string;
  duration?: string;
  durationDays?: number | string;
  instructions?: string;
};

type DiagnosticTest = {
  name?: string;
  type?: string;
  urgency?: string;
  instructions?: string;
};

type PrescriptionDetail = {
  id: number;
  displayId: string;
  date: string;
  diagnosis: string;
  symptoms: string | null;
  medicines: Medicine[];
  tests: DiagnosticTest[];
  notes: string | null;
  patient: {
    ref: string;
    name: string;
    age: number | null;
    gender: string | null;
    bloodGroup: string | null;
  };
  doctor: {
    name: string;
    designation?: string | null;
    qualifications?: string | null;
    specialization: string | null;
    department: string | null;
    license: string | null;
    phone?: string | null;
  };
};

function formatMedicineSubtitle(medicine: Medicine) {
  const parts: string[] = [];
  if (medicine.dosage) parts.push(medicine.dosage);
  if (medicine.frequency) parts.push(medicine.frequency);
  if (medicine.timing) parts.push(medicine.timing);
  return parts.join(" · ");
}

function formatMedicineDuration(medicine: Medicine) {
  if (medicine.duration) return medicine.duration;
  if (medicine.durationDays) return `${medicine.durationDays} Days`;
  return null;
}

export default function ViewPrescriptionPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;
  const prescriptionId = params.prescriptionId as string;

  const [rx, setRx] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);
  const {
    prescriptionRef,
    handlePrint,
    handleDownloadPdf,
    isDownloading,
  } = usePrescriptionExport(rx?.displayId ?? `RX-${prescriptionId}`);

  useEffect(() => {
    async function fetchPrescription() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/pharmacy/patients/${patientId}/prescriptions/${prescriptionId}`,
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load prescription");
          return;
        }

        setRx({
          ...data,
          medicines: Array.isArray(data.medicines) ? data.medicines : [],
          tests: Array.isArray(data.tests) ? data.tests : [],
        });
      } catch {
        setError("Failed to load prescription");
      } finally {
        setLoading(false);
      }
    }

    fetchPrescription();
  }, [patientId, prescriptionId]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
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
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Prescription not found
          </p>
          <p className="text-sm text-gray-400">
            {error || `The prescription could not be located.`}
          </p>
          <button
            onClick={() =>
              router.push(
                `/pharmacy-dashboard/patient-search/${patientId}/prescriptions`,
              )
            }
            className="mt-2 text-cyan-600 hover:underline text-sm font-medium"
          >
            ← Back to Prescriptions
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const symptoms = rx.symptoms || "None reported";
  const notes = rx.notes || "No additional notes.";
  const doctorSpecialization =
    rx.doctor.specialization ?? rx.doctor.department ?? "Doctor";

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-5">
        {/* Toolbar */}
        <div className="prescription-viewer-toolbar flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                router.push(
                  `/pharmacy-dashboard/patient-search/${patientId}/prescriptions`,
                )
              }
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white leading-tight">
                Prescription Viewer
              </h2>
              <p className="text-sm text-gray-400 font-mono">{rx.displayId}</p>
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
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPdf}
              disabled={isDownloading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed text-gray-700 rounded-lg text-sm font-medium transition-colors"
            >
              {isDownloading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {isDownloading ? "Generating..." : "Download PDF"}
            </button>
            <button
              onClick={() =>
                router.push(
                  `/pharmacy-dashboard/patient-search/${patientId}/prescription/${prescriptionId}/dispense`,
                )
              }
              className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Proceed to Dispense
              <ArrowRight className="w-4 h-4" />
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
            <PrescriptionDocument
              ref={prescriptionRef}
              rx={formatPrescription({
                ...rx,
                id: rx.displayId,
                patient: {
                  ...rx.patient,
                  id: rx.patient.ref,
                },
                doctor: {
                  ...rx.doctor,
                  specialization: doctorSpecialization,
                },
                symptoms,
                notes,
              })}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
