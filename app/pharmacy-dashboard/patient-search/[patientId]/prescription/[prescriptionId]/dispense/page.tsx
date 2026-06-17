"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

import { DashboardLayout } from "../../../../../../components/DashboardLayout";
import { Badge } from "../../../../../../components/Badge";

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

// ── Types ─────────────────────────────────────────────────────────────────────
interface PrescribedMedicine {
  id: number;
  inventoryId: number | null;
  name: string;
  dosage: string;
  durationDays: number;
  instructions: string;
  requiredQty: number;
  stockQty: number;
  status: "In Stock" | "Low Stock" | "Out of Stock";
  available: boolean;
  selected: boolean;
}

interface DispenseData {
  prescription: {
    id: number;
    displayId: string;
    date: string;
    diagnosis: string;
    symptoms: string | null;
    notes: string | null;
  };
  patient: {
    id: number;
    displayId: string;
    name: string;
    age: number | null;
    gender: string | null;
  };
  doctor: {
    name: string;
    specialization: string | null;
    department: string | null;
  };
  medicines: Omit<PrescribedMedicine, "selected">[];
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const getStockStatus = (status: PrescribedMedicine["status"]) => {
  switch (status) {
    case "In Stock":
      return { variant: "success" as const, icon: CheckCircle2, color: "text-green-600" };
    case "Low Stock":
      return { variant: "default" as const, icon: AlertTriangle, color: "text-yellow-600" };
    case "Out of Stock":
      return { variant: "danger" as const, icon: XCircle, color: "text-red-600" };
  }
};

const getDispenseStatus = (medicine: PrescribedMedicine) => {
  if (medicine.stockQty === 0)
    return { label: "Unavailable", variant: "danger" as const };
  if (medicine.requiredQty > 0 && medicine.stockQty < medicine.requiredQty)
    return { label: "Partial", variant: "default" as const };
  return { label: "Ready", variant: "success" as const };
};

// ── Confirmation Popup ────────────────────────────────────────────────────────
interface ConfirmModalProps {
  count: number;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

function ConfirmDispenseModal({
  count,
  onConfirm,
  onCancel,
  loading,
}: ConfirmModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Icon */}
        <div className="flex flex-col items-center pt-8 pb-5 px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center mb-4">
            <ShieldCheck className="w-8 h-8 text-cyan-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
            Confirm Dispensing
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Are you sure you want to dispense{" "}
            <span className="font-semibold text-gray-700 dark:text-gray-200">
              {count} medicine{count !== 1 ? "s" : ""}
            </span>?
            <br />
            Stock will be updated in the inventory.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700
              text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
              transition-colors font-medium text-sm disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700
              text-white transition-colors flex items-center justify-center gap-2
              font-medium text-sm shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processing…
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Yes, Dispense
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Success Screen ────────────────────────────────────────────────────────────
function SuccessScreen({ patientName }: { patientName: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center">
      <div className="w-24 h-24 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
        <CheckCircle2 className="w-12 h-12 text-green-500" />
      </div>
      <div>
        <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
          Dispensed Successfully!
        </h3>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Medicines have been dispensed to{" "}
          <span className="font-semibold text-gray-700 dark:text-gray-200">
            {patientName}
          </span>{" "}
          and inventory has been updated.
        </p>
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Redirecting you back…
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
export default function PrescriptionDispensing() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;
  const prescriptionId = params.prescriptionId as string;

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [data, setData] = useState<DispenseData | null>(null);
  const [medicines, setMedicines] = useState<PrescribedMedicine[]>([]);

  // modal / dispense state
  const [showConfirm, setShowConfirm] = useState(false);
  const [dispensing, setDispensing] = useState(false);
  const [dispensed, setDispensed] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);

  // ── Fetch prescription + inventory check ─────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      setFetchError("");
      try {
        const res = await fetch(
          `/api/pharmacy/prescriptions/${prescriptionId}/dispense`,
        );
        const json = await res.json();
        if (!res.ok) {
          setFetchError(json.error || "Failed to load prescription");
          return;
        }
        setData(json as DispenseData);
        setMedicines(
          json.medicines.map(
            (med: Omit<PrescribedMedicine, "selected">) => ({
              ...med,
              selected: med.status !== "Out of Stock",
            }),
          ),
        );
      } catch {
        setFetchError("Failed to load prescription. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [prescriptionId]);

  // ── Toggle checkbox (disabled for OOS) ───────────────────────────────────
  const toggleSelection = (id: number) => {
    setMedicines((prev) =>
      prev.map((med) =>
        med.id === id && med.status !== "Out of Stock"
          ? { ...med, selected: !med.selected }
          : med,
      ),
    );
  };

  const selectedMedicines = medicines.filter((m) => m.selected);
  const availableMedicines = selectedMedicines.filter(
    (m) => m.requiredQty === 0 || m.stockQty >= m.requiredQty,
  );
  const unavailableMedicines = medicines.filter(
    (m) => m.status === "Out of Stock",
  );

  // ── Open confirmation modal ───────────────────────────────────────────────
  const handleDispenseClick = () => {
    if (selectedMedicines.length === 0) {
      setNotification({
        type: "error",
        msg: "Please select at least one medicine to dispense.",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setShowConfirm(true);
  };

  // ── Confirmed — call POST API to deduct stock ─────────────────────────────
  const handleConfirmDispense = async () => {
    setDispensing(true);
    try {
      // Build payload: for each selected medicine that exists in inventory,
      // deduct the min of requiredQty and stockQty (avoid negative stock).
      const payload = selectedMedicines
        .filter((m) => m.inventoryId !== null)
        .map((m) => ({
          inventoryId: m.inventoryId as number,
          name: m.name,
          qtyToDeduct:
            m.requiredQty > 0
              ? Math.min(m.requiredQty, m.stockQty)
              : m.stockQty,
        }));

      const res = await fetch(
        `/api/pharmacy/prescriptions/${prescriptionId}/dispense`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ medicines: payload }),
        },
      );

      const json = await res.json();

      if (!res.ok) {
        setShowConfirm(false);
        setNotification({
          type: "error",
          msg: json.error || "Failed to dispense. Please try again.",
        });
        setTimeout(() => setNotification(null), 4000);
        return;
      }

      setShowConfirm(false);
      setDispensed(true);

      // Redirect after short delay so success screen is visible
      setTimeout(() => {
        router.push(
          `/pharmacy-dashboard/patient-search/${patientId}/prescriptions`,
        );
      }, 2200);
    } catch {
      setShowConfirm(false);
      setNotification({
        type: "error",
        msg: "Something went wrong. Please try again.",
      });
      setTimeout(() => setNotification(null), 4000);
    } finally {
      setDispensing(false);
    }
  };

  // ── Loading state ─────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin" />
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading prescription &amp; checking inventory…
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Error state ───────────────────────────────────────────────────────────
  if (fetchError) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="flex h-[70vh] items-center justify-center">
          <div className="text-center space-y-4">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <p className="text-gray-700 dark:text-gray-300 font-medium">
              {fetchError}
            </p>
            <button
              onClick={() =>
                router.push(
                  `/pharmacy-dashboard/patient-search/${patientId}/prescriptions`,
                )
              }
              className="text-sm text-cyan-600 hover:underline"
            >
              ← Back to prescriptions
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Success state ─────────────────────────────────────────────────────────
  if (dispensed) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <SuccessScreen patientName={data?.patient.name ?? "patient"} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">

        {/* Confirmation Modal */}
        {showConfirm && data && (
          <ConfirmDispenseModal
            medicines={selectedMedicines}
            patient={data.patient}
            prescription={data.prescription}
            onConfirm={handleConfirmDispense}
            onCancel={() => setShowConfirm(false)}
            loading={dispensing}
          />
        )}

        {/* Notification Banner */}
        {notification && (
          <div
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
              notification.type === "success"
                ? "bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400"
                : "bg-red-50 border-red-200 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400"
            }`}
          >
            {notification.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <XCircle className="w-5 h-5 shrink-0" />
            )}
            {notification.msg}
          </div>
        )}

        {/* Header */}
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() =>
              router.push(
                `/pharmacy-dashboard/patient-search/${patientId}/prescriptions`,
              )
            }
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
              Dispense Prescription
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Select and dispense medicines to the patient
            </p>
          </div>
        </div>

        {/* Prescription Info Banner */}
        {data && (
          <div className="text-white rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-6 shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <p className="text-blue-100 mb-1 text-sm">Prescription ID</p>
                <p className="font-semibold text-lg">
                  {data.prescription.displayId}
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-1 text-sm">Patient</p>
                <p className="font-semibold text-lg">{data.patient.name}</p>
                <p className="text-sm text-blue-100">{data.patient.displayId}</p>
              </div>
              <div>
                <p className="text-blue-100 mb-1 text-sm">Doctor</p>
                <p className="font-semibold text-lg">{data.doctor.name}</p>
                <p className="text-sm text-blue-100">
                  {data.doctor.department ?? data.doctor.specialization ?? "—"}
                </p>
              </div>
              <div>
                <p className="text-blue-100 mb-1 text-sm">Date</p>
                <p className="font-semibold text-lg">{data.prescription.date}</p>
                {data.prescription.diagnosis && (
                  <p className="text-sm text-blue-100 mt-0.5 truncate">
                    {data.prescription.diagnosis}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Medicines Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
              Medicines to Dispense
            </h3>
            <div className="hidden sm:flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                In Stock
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                Low Stock
              </span>
              <span className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                Out of Stock
              </span>
            </div>
          </div>

          {medicines.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500 dark:text-gray-400">
                No medicines found in this prescription.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Select
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Medicine
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dosage / Duration
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Required Qty
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Current Stock
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Stock Status
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Dispense Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {medicines.map((medicine) => {
                    const stockInfo = getStockStatus(medicine.status);
                    const dispenseInfo = getDispenseStatus(medicine);
                    const StockIcon = stockInfo.icon;
                    const isOOS = medicine.status === "Out of Stock";

                    return (
                      <tr
                        key={medicine.id}
                        onClick={() => !isOOS && toggleSelection(medicine.id)}
                        className={`${
                          medicine.selected
                            ? "bg-cyan-50/50 dark:bg-blue-900/10"
                            : ""
                        } ${
                          isOOS
                            ? "opacity-60 cursor-not-allowed"
                            : "hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                        } transition-colors`}
                      >
                        <td
                          className="px-4 py-4"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={medicine.selected}
                            onChange={() => toggleSelection(medicine.id)}
                            disabled={isOOS}
                            className="w-5 h-5 rounded border-gray-300 text-cyan-600 focus:ring-cyan-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                          />
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {medicine.name}
                          </p>
                          {medicine.instructions && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                              {medicine.instructions}
                            </p>
                          )}
                          {medicine.inventoryId === null && (
                            <p className="text-xs text-orange-500 mt-0.5 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Not in inventory
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {medicine.dosage || "—"}
                          </p>
                          {medicine.durationDays > 0 && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              for {medicine.durationDays} days
                            </p>
                          )}
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-800 dark:text-white">
                            {medicine.requiredQty > 0
                              ? `${medicine.requiredQty} units`
                              : "—"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <p
                            className={`font-medium ${
                              medicine.stockQty === 0
                                ? "text-red-500"
                                : medicine.stockQty < medicine.requiredQty &&
                                    medicine.requiredQty > 0
                                  ? "text-yellow-600"
                                  : "text-green-500"
                            }`}
                          >
                            {medicine.inventoryId !== null
                              ? `${medicine.stockQty} units`
                              : "N/A"}
                          </p>
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={stockInfo.variant}>
                            <span className="flex items-center gap-1.5 whitespace-nowrap">
                              <StockIcon className="w-3.5 h-3.5" />
                              {medicine.inventoryId !== null
                                ? medicine.status
                                : "Not Found"}
                            </span>
                          </Badge>
                        </td>

                        <td className="px-4 py-4">
                          <Badge variant={dispenseInfo.variant}>
                            {dispenseInfo.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Dispense Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-4">
            Dispense Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Selected Medicines
              </p>
              <p className="text-[2rem] font-bold text-blue-700 dark:text-blue-500 leading-none">
                {selectedMedicines.length}
              </p>
              <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                of {medicines.length} prescribed
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Fully Available
              </p>
              <p className="text-[2rem] font-bold text-green-700 dark:text-green-500 leading-none">
                {availableMedicines.length}
              </p>
              <p className="text-xs text-green-500 dark:text-green-400 mt-1">
                sufficient stock
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                Out of Stock
              </p>
              <p className="text-[2rem] font-bold text-red-700 dark:text-red-500 leading-none">
                {unavailableMedicines.length}
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                cannot dispense
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() =>
                router.push(
                  `/pharmacy-dashboard/patient-search/${patientId}/prescriptions`,
                )
              }
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700
                text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800
                transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleDispenseClick}
              disabled={selectedMedicines.length === 0}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50
                disabled:cursor-not-allowed text-white py-3 rounded-xl transition-colors
                flex items-center justify-center gap-2 font-medium shadow-sm"
            >
              <CheckCircle2 className="w-5 h-5" />
              Confirm Dispense
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
