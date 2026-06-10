"use client";

import { useState } from "react";
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

const prescriptionInfo = {
  id: "RX001",
  patient: {
    name: "John Doe",
    id: "P001",
    age: 45,
    gender: "Male",
  },
  doctor: {
    name: "Dr. Sarah Wilson",
    department: "Cardiology",
  },
  date: "2026-05-20",
};

const medicinesData = [
  {
    id: 1,
    name: "Amlodipine",
    dosage: "5mg",
    pattern: "1+0+1",
    days: 30,
    requiredQty: 60,
    stockQty: 200,
    status: "In Stock",
  },
  {
    id: 2,
    name: "Atenolol",
    dosage: "50mg",
    pattern: "1+0+0",
    days: 30,
    requiredQty: 30,
    stockQty: 45,
    status: "Low Stock",
  },
  {
    id: 3,
    name: "Aspirin",
    dosage: "75mg",
    pattern: "0+0+1",
    days: 30,
    requiredQty: 30,
    stockQty: 150,
    status: "In Stock",
  },
  {
    id: 4,
    name: "Omeprazole",
    dosage: "20mg",
    pattern: "1+0+0",
    days: 30,
    requiredQty: 30,
    stockQty: 12,
    status: "Low Stock",
  },
  {
    id: 5,
    name: "Metformin",
    dosage: "500mg",
    pattern: "1+0+1",
    days: 30,
    requiredQty: 60,
    stockQty: 0,
    status: "Out of Stock",
  },
];

export default function PrescriptionDispensing() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const [medicines, setMedicines] = useState(
    medicinesData.map((med) => ({
      ...med,
      selected: med.status !== "Out of Stock",
    })),
  );
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    msg: string;
  } | null>(null);
  const [dispensed, setDispensed] = useState(false);

  const getStockStatus = (status: string) => {
    switch (status) {
      case "In Stock":
        return {
          variant: "success" as const,
          icon: CheckCircle2,
          color: "text-green-600",
        };
      case "Low Stock":
        return {
          variant: "default" as const,
          icon: AlertTriangle,
          color: "text-yellow-600",
        };
      case "Out of Stock":
        return {
          variant: "danger" as const,
          icon: XCircle,
          color: "text-red-600",
        };
      default:
        return {
          variant: "default" as const,
          icon: AlertTriangle,
          color: "text-gray-600",
        };
    }
  };

  const getDispenseStatus = (medicine: (typeof medicines)[0]) => {
    if (medicine.stockQty === 0)
      return { label: "Unavailable", variant: "danger" as const };
    if (medicine.stockQty < medicine.requiredQty)
      return { label: "Partial", variant: "default" as const };
    return { label: "Ready", variant: "success" as const };
  };

  const toggleSelection = (id: number) => {
    setMedicines(
      medicines.map((med) =>
        med.id === id && med.status !== "Out of Stock"
          ? { ...med, selected: !med.selected }
          : med,
      ),
    );
  };

  const selectedMedicines = medicines.filter((med) => med.selected);
  const availableMedicines = selectedMedicines.filter(
    (med) => med.stockQty >= med.requiredQty,
  );
  const unavailableMedicines = selectedMedicines.filter(
    (med) => med.stockQty === 0,
  );

  const handleConfirmDispense = () => {
    if (selectedMedicines.length === 0) {
      setNotification({
        type: "error",
        msg: "Please select at least one medicine to dispense",
      });
      setTimeout(() => setNotification(null), 3000);
      return;
    }
    setDispensed(true);
    setNotification({
      type: "success",
      msg: "Prescription dispensed successfully!",
    });
    setTimeout(() => {
      router.push(
        `/pharmacy-dashboard/patient-search/${patientId}/prescriptions`,
      );
    }, 1500);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
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

        <div className="text-white rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <p className="text-blue-100 mb-1 text-sm">Prescription ID</p>
              <p className="font-semibold text-lg">{prescriptionInfo.id}</p>
            </div>
            <div>
              <p className="text-blue-100 mb-1 text-sm">Patient</p>
              <p className="font-semibold text-lg">
                {prescriptionInfo.patient.name}
              </p>
              <p className="text-sm text-blue-100">
                {prescriptionInfo.patient.id}
              </p>
            </div>
            <div>
              <p className="text-blue-100 mb-1 text-sm">Doctor</p>
              <p className="font-semibold text-lg">
                {prescriptionInfo.doctor.name}
              </p>
              <p className="text-sm text-blue-100">
                {prescriptionInfo.doctor.department}
              </p>
            </div>
            <div>
              <p className="text-blue-100 mb-1 text-sm">Date</p>
              <p className="font-semibold text-lg">{prescriptionInfo.date}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-4">
            Medicines to Dispense
          </h3>

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
                    Dosage Pattern
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

                  return (
                    <tr
                      key={medicine.id}
                      className={`${
                        medicine.selected
                          ? "bg-cyan-50/50 dark:bg-blue-900/10"
                          : ""
                      } hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={medicine.selected}
                          onChange={() => toggleSelection(medicine.id)}
                          disabled={medicine.status === "Out of Stock"}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {medicine.name}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {medicine.dosage}
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white">
                            {medicine.pattern}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            for {medicine.days} days
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-gray-800 dark:text-white">
                          {medicine.requiredQty} tablets
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <p
                          className={`font-medium ${
                            medicine.stockQty === 0
                              ? "text-red-500"
                              : medicine.stockQty < medicine.requiredQty
                                ? "text-yellow-600"
                                : "text-green-500"
                          }`}
                        >
                          {medicine.stockQty} tablets
                        </p>
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant={stockInfo.variant}>
                          <span className="flex items-center gap-1.5 whitespace-nowrap">
                            <StockIcon className="w-3.5 h-3.5" />
                            {medicine.status}
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
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-4">
            Dispense Summary
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Total Medicines
              </p>
              <p className="text-[2rem] font-bold text-blue-700 dark:text-blue-500 leading-none">
                {selectedMedicines.length}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-5">
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                Available
              </p>
              <p className="text-[2rem] font-bold text-green-700 dark:text-green-500 leading-none">
                {availableMedicines.length}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-5">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-1">
                Unavailable
              </p>
              <p className="text-[2rem] font-bold text-red-700 dark:text-red-500 leading-none">
                {unavailableMedicines.length}
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
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDispense}
              className="flex-1 bg-cyan-600 hover:bg-cyan-700 text-white py-3 rounded-xl transition-colors flex items-center justify-center gap-2 font-medium shadow-sm"
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
