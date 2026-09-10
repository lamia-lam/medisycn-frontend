"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  ArrowLeft,
  Calendar,
  Eye,
  ArrowRight,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { DashboardLayout } from "../../../../components/DashboardLayout";
import { Badge } from "../../../../components/Badge";

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

type PatientInfo = {
  id: number;
  displayId: string;
  name: string;
  initials: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
};

type Prescription = {
  id: number;
  displayId: string;
  doctorName: string;
  department: string;
  date: string;
  diagnosis: string;
  status: string;
};

export default function PatientPrescriptions() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchPrescriptions() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/pharmacy/patients/${patientId}/prescriptions`,
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Failed to load prescriptions");
          return;
        }

        setPatient(data.patient);
        setPrescriptions(data.prescriptions ?? []);
      } catch {
        setError("Failed to load prescriptions");
      } finally {
        setLoading(false);
      }
    }

    fetchPrescriptions();
  }, [patientId]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !patient) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/pharmacy-dashboard/patient-search")}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-2xl font-medium text-gray-800 dark:text-white">
              Patient Prescriptions
            </h2>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            {error || "Patient not found"}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        <div className="flex items-center gap-4 mb-2">
          <button
            onClick={() => router.push("/pharmacy-dashboard/patient-search")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors text-gray-600 dark:text-gray-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
              Patient Prescriptions
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              View and manage patient prescription history
            </p>
          </div>
        </div>

        <div className="text-white rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-6 shadow-sm">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-semibold text-xl">
              {patient.initials}
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-1">{patient.name}</h3>
              <p className="text-cyan-100">{patient.displayId}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-cyan-100 mb-1">Age</p>
              <p className="font-semibold text-base">
                {patient.age != null ? `${patient.age} years` : "—"}
              </p>
            </div>
            <div>
              <p className="text-cyan-100 mb-1">Gender</p>
              <p className="font-semibold text-base">
                {patient.gender ?? "—"}
              </p>
            </div>
            <div>
              <p className="text-cyan-100 mb-1">Blood Group</p>
              <p className="font-semibold text-base">
                {patient.bloodGroup ?? "—"}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
              Prescription History
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {prescriptions.length} Total
            </span>
          </div>

          {prescriptions.length === 0 ? (
            <div className="text-center py-16">
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
                No prescriptions found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                This patient has no prescription history yet
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div
                  key={prescription.id}
                  className="bg-gray-50/70 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2.5">
                        <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                          {prescription.displayId}
                        </h4>
                        <Badge
                          variant={
                            prescription.status === "Pending"
                              ? "default"
                              : "success"
                          }
                        >
                          {prescription.status}
                        </Badge>
                      </div>
                      <div className="space-y-1.5 text-sm">
                        <p className="text-gray-700 dark:text-gray-300 flex items-center gap-2">
                          <Stethoscope className="w-4 h-4 text-gray-400 shrink-0" />
                          <span>
                            <span className="text-gray-400 dark:text-gray-500">
                              Doctor:
                            </span>{" "}
                            {prescription.doctorName}
                          </span>
                        </p>
                        <p className="text-gray-700 dark:text-gray-300">
                          <span className="text-gray-400 dark:text-gray-500">
                            Department:
                          </span>{" "}
                          {prescription.department}
                        </p>
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mt-2">
                          <Calendar className="w-4 h-4 shrink-0" />
                          <span>{prescription.date}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-5 p-3.5 bg-gray-100/80 dark:bg-gray-800 rounded-lg">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-gray-500 dark:text-gray-400">
                        Diagnosis:
                      </span>{" "}
                      {prescription.diagnosis || "—"}
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() =>
                        router.push(
                          `/pharmacy-dashboard/patient-search/${patientId}/prescription/${prescription.id}`,
                        )
                      }
                      className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Prescription
                    </button>
                    {prescription.status === "Pending" && (
                      <button
                        onClick={() =>
                          router.push(
                            `/pharmacy-dashboard/patient-search/${patientId}/prescription/${prescription.id}/dispense`,
                          )
                        }
                        className="flex-1 py-2.5 px-4 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white transition-colors flex items-center justify-center gap-2 font-medium text-sm shadow-sm"
                      >
                        Proceed to Dispense
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
