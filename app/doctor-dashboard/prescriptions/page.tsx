"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  PrescriptionDocument,
  PrescriptionData,
  formatPrescription,
} from "../../components/PrescriptionDocument";
import {
  downloadPrescriptionPdf,
  getPrescriptionFilename,
} from "../../lib/prescriptionExport";
import { Badge } from "../../components/Badge";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  Search,
  Plus,
  Eye,
  Trash2,
  Download,
  Pill,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";

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

// ─── Toast ──────────────────────────────────────────────────────────────────
type ToastType = "success" | "error";
interface Toast {
  id: number;
  type: ToastType;
  message: string;
}

let _toastId = 0;

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium transition-all ${
            t.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {t.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            className="ml-2 opacity-80 hover:opacity-100"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Confirm Delete Modal ───────────────────────────────────────────────────
function ConfirmDeleteModal({
  prescription,
  isDeleting,
  onConfirm,
  onCancel,
}: {
  prescription: any;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={!isDeleting ? onCancel : undefined}
      />
      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
              Delete Prescription
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to delete prescription{" "}
              <span className="font-mono font-semibold text-gray-700 dark:text-gray-200">
                {prescription?.id}
              </span>{" "}
              for{" "}
              <span className="font-semibold text-gray-700 dark:text-gray-200">
                {prescription?.patient}
              </span>
              ? This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full mt-1">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
              )}
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function PrescriptionsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [prescriptionsData, setPrescriptionsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Download state
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [hiddenRxData, setHiddenRxData] = useState<any>(null);
  const hiddenPrescriptionRef = useRef<HTMLDivElement>(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  function showToast(type: ToastType, message: string) {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      4000,
    );
  }
  function dismissToast(id: number) {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }

  // ── Fetch Prescriptions ──
  useEffect(() => {
    async function fetchPrescriptions() {
      try {
        const res = await fetch("/api/doctor/prescription");
        if (!res.ok) throw new Error("Failed to load prescriptions");
        const data = await res.json();

        const mappedData = data.map((p: any) => {
          let medicinesCount = 0;
          if (Array.isArray(p.medicines)) medicinesCount = p.medicines.length;

          const initials = p.patient.name
            ? p.patient.name
                .split(" ")
                .map((n: string) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase()
            : "?";

          return {
            id: `RX-${p.id}`,
            realId: p.id,
            patient: p.patient.name,
            patientId: `P${p.patient.id.toString().padStart(3, "0")}`,
            phone: p.patient.phone,
            date: new Date(p.createdAt).toISOString().split("T")[0],
            diagnosis: p.diagnosis,
            medicines: medicinesCount,
            initials,
            avatarColor: "bg-cyan-100 text-cyan-700",
          };
        });

        setPrescriptionsData(mappedData);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchPrescriptions();
  }, []);

  // ── Download PDF ──
  const handleDownloadClick = async (rxInfo: any) => {
    if (downloadingId) return;
    setDownloadingId(rxInfo.id);
    try {
      const res = await fetch(`/api/doctor/prescription/${rxInfo.realId}`);
      if (!res.ok) throw new Error("Failed to fetch prescription details");
      const data = await res.json();

      setHiddenRxData(formatPrescription(data, rxInfo.id));
    } catch (err) {
      console.error(err);
      showToast("error", "Failed to download prescription.");
      setDownloadingId(null);
    }
  };

  // Trigger PDF generation once hidden element is mounted
  useEffect(() => {
    if (hiddenRxData && hiddenPrescriptionRef.current) {
      setTimeout(() => {
        downloadPrescriptionPdf(
          hiddenPrescriptionRef.current!,
          getPrescriptionFilename(hiddenRxData.id),
        )
          .then(() => showToast("success", "PDF downloaded successfully."))
          .catch((err) => {
            console.error(err);
            showToast("error", "Failed to generate PDF.");
          })
          .finally(() => {
            setDownloadingId(null);
            setHiddenRxData(null);
          });
      }, 100);
    }
  }, [hiddenRxData]);

  // ── Delete ──
  const handleDeleteConfirm = async () => {
    if (!deleteTarget || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(
        `/api/doctor/prescription/${deleteTarget.realId}`,
        {
          method: "DELETE",
        },
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete prescription");
      }
      // Remove from local state
      setPrescriptionsData((prev) =>
        prev.filter((p) => p.realId !== deleteTarget.realId),
      );
      showToast(
        "success",
        `Prescription ${deleteTarget.id} deleted successfully.`,
      );
      setDeleteTarget(null);
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete prescription.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredPrescriptions = prescriptionsData.filter((prescription) => {
    const matchesSearch =
      (prescription.phone || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (prescription.patient || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      (prescription.status || "").toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              Prescription Management
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              View and manage all prescriptions
            </p>
          </div>
          <button
            onClick={() => router.push("/doctor-dashboard/prescriptions/new")}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            New Prescription
          </button>
        </div>

        {/* Card Container */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Search & Filter */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by Phone or patient name"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                />
              </div>
            </div>
            {!loading && !error && (
              <p className="text-xs text-gray-400 mt-3">
                Showing{" "}
                <span className="font-medium text-gray-600 dark:text-gray-300">
                  {filteredPrescriptions.length}
                </span>{" "}
                of {prescriptionsData.length} prescriptions
              </p>
            )}
          </div>

          {/* List Content */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
              <p className="text-sm text-gray-500">Loading prescriptions...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800 transition-all"
                  >
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${prescription.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                        >
                          {prescription.initials}
                        </div>
                        <div>
                          <p className="font-mono text-xs text-gray-400 mb-0.5">
                            {prescription.id}
                          </p>
                          <p className="font-semibold text-gray-800 dark:text-white text-sm">
                            {prescription.patient}
                          </p>
                          <p className="text-xs text-gray-400">
                            {prescription.patientId}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4 bg-gray-50 dark:bg-gray-900/40 rounded-lg p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Date Prescribed</span>
                        <span className="font-medium text-gray-700 dark:text-gray-300">
                          {prescription.date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm gap-4">
                        <span className="text-gray-400 shrink-0">
                          Diagnosis
                        </span>
                        <span className="text-right font-medium text-gray-700 dark:text-gray-300 text-xs truncate max-w-[200px]">
                          {prescription.diagnosis}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Medicines</span>
                        <span className="inline-flex items-center gap-1 font-medium text-gray-700 dark:text-gray-300">
                          <Pill className="w-3.5 h-3.5 text-cyan-500" />
                          {prescription.medicines} items
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-700">
                      <button
                        onClick={() =>
                          router.push(
                            `/doctor-dashboard/prescriptions/${prescription.realId}`,
                          )
                        }
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 border border-cyan-500 text-cyan-600 dark:text-cyan-400 rounded-lg hover:bg-cyan-500 hover:text-white dark:hover:bg-cyan-600 transition-colors text-sm font-medium"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                      <button
                        title="Download PDF"
                        onClick={() => handleDownloadClick(prescription)}
                        disabled={downloadingId === prescription.id}
                        className="p-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {downloadingId === prescription.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        title="Delete"
                        onClick={() => setDeleteTarget(prescription)}
                        className="p-2 border border-red-200 dark:border-red-900/50 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Empty State */}
              {filteredPrescriptions.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                    <FileText className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No prescriptions found
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Try adjusting your search or filters
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Hidden DOM node for PDF generation */}
      {hiddenRxData && (
        <div
          style={{
            position: "absolute",
            left: "-9999px",
            top: 0,
            visibility: "hidden",
          }}
        >
          <PrescriptionDocument ref={hiddenPrescriptionRef} rx={hiddenRxData} />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          prescription={deleteTarget}
          isDeleting={isDeleting}
          onConfirm={handleDeleteConfirm}
          onCancel={() => !isDeleting && setDeleteTarget(null)}
        />
      )}

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </DashboardLayout>
  );
}
