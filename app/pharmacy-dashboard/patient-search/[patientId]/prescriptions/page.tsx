"use client";

import { useRouter, useParams } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  ArrowLeft,
  User,
  Calendar,
  Eye,
  ArrowRight,
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

const prescriptionsData = [
  {
    id: "RX001",
    doctorName: "Dr. Sarah Wilson",
    department: "Cardiology",
    date: "2026-05-20",
    summary: "Hypertension management - Regular medications",
    medicines: ["Amlodipine 5mg", "Atenolol 50mg", "Aspirin 75mg"],
    status: "Pending",
  },
  {
    id: "RX002",
    doctorName: "Dr. Michael Chen",
    department: "General Medicine",
    date: "2026-05-15",
    summary: "Viral fever and body ache",
    medicines: ["Paracetamol 500mg", "Cetirizine 10mg"],
    status: "Dispensed",
  },
  {
    id: "RX003",
    doctorName: "Dr. Emily Davis",
    department: "Gastroenterology",
    date: "2026-05-10",
    summary: "Acid reflux treatment",
    medicines: ["Omeprazole 20mg", "Domperidone 10mg"],
    status: "Dispensed",
  },
  {
    id: "RX004",
    doctorName: "Dr. Robert Brown",
    department: "Orthopedics",
    date: "2026-05-05",
    summary: "Post-surgery pain management",
    medicines: ["Ibuprofen 400mg", "Vitamin B12"],
    status: "Dispensed",
  },
];

const patientInfo = {
  id: "P001",
  name: "John Doe",
  age: 45,
  gender: "Male",
  bloodGroup: "A+",
  phone: "+1 (555) 123-4567",
};

export default function PatientPrescriptions() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.patientId as string;

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        {/* Header */}
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

        {/* Patient Info Card */}
        <div className="text-white rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-600 p-6 shadow-sm">
          <div className="flex items-center gap-5 mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <User className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold mb-1">
                {patientInfo.name}
              </h3>
              <p className="text-cyan-100">{patientInfo.id}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div>
              <p className="text-cyan-100 mb-1">Age</p>
              <p className="font-semibold text-base">{patientInfo.age} years</p>
            </div>
            <div>
              <p className="text-cyan-100 mb-1">Gender</p>
              <p className="font-semibold text-base">{patientInfo.gender}</p>
            </div>
            <div>
              <p className="text-cyan-100 mb-1">Blood Group</p>
              <p className="font-semibold text-base">
                {patientInfo.bloodGroup}
              </p>
            </div>
            <div>
              <p className="text-cyan-100 mb-1">Contact</p>
              <p className="font-semibold text-base">{patientInfo.phone}</p>
            </div>
          </div>
        </div>

        {/* Prescription History Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-800 dark:text-white text-lg">
              Prescription History
            </h3>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {prescriptionsData.length} Total
            </span>
          </div>

          <div className="space-y-4">
            {prescriptionsData.map((prescription) => (
              <div
                key={prescription.id}
                className="bg-gray-50/70 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2.5">
                      <h4 className="font-semibold text-gray-800 dark:text-white text-lg">
                        {prescription.id}
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
                      <p className="text-gray-700 dark:text-gray-300">
                        <span className="text-gray-400 dark:text-gray-500">
                          Doctor:
                        </span>{" "}
                        {prescription.doctorName}
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
                  <div className="text-right">
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-0.5">
                      Medicines
                    </p>
                    <p className="text-[1.75rem] font-semibold text-cyan-600 leading-none">
                      {prescription.medicines.length}
                    </p>
                  </div>
                </div>

                <div className="mb-5 p-3.5 bg-gray-100/80 dark:bg-gray-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <span className="text-gray-500 dark:text-gray-400">
                      Summary:
                    </span>{" "}
                    {prescription.summary}
                  </p>
                </div>

                <div className="mb-5">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2.5">
                    Medications:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prescription.medicines.map((medicine, index) => (
                      <span
                        key={index}
                        className="text-xs font-medium px-2.5 py-1 rounded-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      >
                        {medicine}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 font-medium text-sm">
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
        </div>
      </div>
    </DashboardLayout>
  );
}
