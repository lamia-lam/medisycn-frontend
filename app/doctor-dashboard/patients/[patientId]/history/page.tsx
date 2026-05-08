"use client";

import { useState } from "react";
import { DashboardLayout } from "../../../../components/DashboardLayout";
import { Badge } from "../../../../components/Badge";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  ArrowLeft,
  Download,
  Pill,
  Microscope,
  Heart,
  ChevronDown,
  Phone,
  Mail,
  Droplets,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

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

// Lookup map so each patient ID has their own info
const patientInfoMap: Record<
  string,
  {
    id: string;
    name: string;
    age: number;
    gender: string;
    phone: string;
    email: string;
    bloodGroup: string;
    condition: string;
    initials: string;
  }
> = {
  P001: {
    id: "P001",
    name: "John Doe",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 123-4567",
    email: "john.doe@email.com",
    bloodGroup: "A+",
    condition: "Hypertension",
    initials: "JD",
  },
  P002: {
    id: "P002",
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    phone: "+1 (555) 234-5678",
    email: "jane.smith@email.com",
    bloodGroup: "B+",
    condition: "Type 2 Diabetes",
    initials: "JS",
  },
  P003: {
    id: "P003",
    name: "Mike Johnson",
    age: 28,
    gender: "Male",
    phone: "+1 (555) 345-6789",
    email: "mike.j@email.com",
    bloodGroup: "O+",
    condition: "Asthma",
    initials: "MJ",
  },
  P004: {
    id: "P004",
    name: "Sarah Williams",
    age: 55,
    gender: "Female",
    phone: "+1 (555) 456-7890",
    email: "sarah.w@email.com",
    bloodGroup: "AB-",
    condition: "Arthritis",
    initials: "SW",
  },
  P005: {
    id: "P005",
    name: "Robert Brown",
    age: 62,
    gender: "Male",
    phone: "+1 (555) 567-8901",
    email: "robert.b@email.com",
    bloodGroup: "O-",
    condition: "Heart Disease",
    initials: "RB",
  },
  P006: {
    id: "P006",
    name: "Emily Davis",
    age: 38,
    gender: "Female",
    phone: "+1 (555) 678-9012",
    email: "emily.d@email.com",
    bloodGroup: "A-",
    condition: "Migraine",
    initials: "ED",
  },
  P007: {
    id: "P007",
    name: "David Wilson",
    age: 41,
    gender: "Male",
    phone: "+1 (555) 789-0123",
    email: "david.w@email.com",
    bloodGroup: "B-",
    condition: "Thyroid Disorder",
    initials: "DW",
  },
  P008: {
    id: "P008",
    name: "Lisa Anderson",
    age: 29,
    gender: "Female",
    phone: "+1 (555) 890-1234",
    email: "lisa.a@email.com",
    bloodGroup: "AB+",
    condition: "Anemia",
    initials: "LA",
  },
};

const treatmentHistory = [
  {
    id: 1,
    date: "2026-04-25",
    diagnosis: "Hypertension Management",
    doctor: "Dr. Sarah Smith",
    department: "Cardiology",
    treatment: "Blood pressure monitoring, lifestyle counseling",
    notes:
      "Patient showing improvement. Continue current medication. BP reading: 130/85.",
  },
  {
    id: 2,
    date: "2026-03-15",
    diagnosis: "Annual Physical Exam",
    doctor: "Dr. Sarah Smith",
    department: "General Medicine",
    treatment: "Comprehensive health checkup, chest X-ray, blood panel",
    notes:
      "All vitals normal. Recommended diet modifications — reduce sodium intake.",
  },
  {
    id: 3,
    date: "2026-01-10",
    diagnosis: "Hypertension Initial Diagnosis",
    doctor: "Dr. John Wilson",
    department: "Cardiology",
    treatment: "Started on ACE inhibitors, dietary guidance",
    notes:
      "New diagnosis. Patient educated on lifestyle changes. Follow-up in 6 weeks.",
  },
];

const diagnosticHistory = [
  {
    id: 1,
    date: "2026-04-20",
    test: "Complete Blood Count (CBC)",
    lab: "DiagLab Center",
    status: "Completed",
    result: "Normal",
    resultColor: "success" as const,
  },
  {
    id: 2,
    date: "2026-04-20",
    test: "Lipid Profile",
    lab: "DiagLab Center",
    status: "Completed",
    result: "Slightly Elevated",
    resultColor: "warning" as const,
  },
  {
    id: 3,
    date: "2026-03-15",
    test: "ECG",
    lab: "CardioLab",
    status: "Completed",
    result: "Normal Sinus Rhythm",
    resultColor: "success" as const,
  },
  {
    id: 4,
    date: "2026-01-08",
    test: "Blood Pressure Monitoring",
    lab: "DiagLab Center",
    status: "Completed",
    result: "Elevated (150/95)",
    resultColor: "error" as const,
  },
];

const medicationHistory = [
  {
    id: 1,
    medicine: "Lisinopril 10mg",
    startDate: "2026-01-10",
    endDate: "Ongoing",
    prescribedBy: "Dr. Sarah Smith",
    dosage: "1 tablet daily",
    frequency: "Morning",
    status: "Active" as const,
  },
  {
    id: 2,
    medicine: "Aspirin 81mg",
    startDate: "2026-01-10",
    endDate: "Ongoing",
    prescribedBy: "Dr. Sarah Smith",
    dosage: "1 tablet daily",
    frequency: "With food",
    status: "Active" as const,
  },
  {
    id: 3,
    medicine: "Amlodipine 5mg",
    startDate: "2026-02-15",
    endDate: "2026-04-15",
    prescribedBy: "Dr. John Wilson",
    dosage: "1 tablet daily",
    frequency: "Evening",
    status: "Discontinued" as const,
  },
];

const prescriptionTimeline = [
  {
    id: 1,
    date: "2026-04-25",
    prescriptionId: "RX-2345",
    diagnosis: "Hypertension Management",
    medicines: ["Lisinopril 10mg", "Aspirin 81mg"],
    doctor: "Dr. Sarah Smith",
    department: "Cardiology",
  },
  {
    id: 2,
    date: "2026-02-15",
    prescriptionId: "RX-1876",
    diagnosis: "Blood Pressure Control",
    medicines: ["Amlodipine 5mg", "Aspirin 81mg"],
    doctor: "Dr. John Wilson",
    department: "Cardiology",
  },
  {
    id: 3,
    date: "2026-01-10",
    prescriptionId: "RX-1234",
    diagnosis: "Hypertension Initial Treatment",
    medicines: ["Lisinopril 10mg", "Aspirin 81mg"],
    doctor: "Dr. Sarah Smith",
    department: "General Medicine",
  },
];

export default function PatientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = (params?.patientId as string) ?? "P001";
  const patientInfo = patientInfoMap[patientId] ?? patientInfoMap["P001"];

  const [expandedTreatment, setExpandedTreatment] = useState<number | null>(1);

  const toggleTreatment = (id: number) => {
    setExpandedTreatment(expandedTreatment === id ? null : id);
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* Back + Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/doctor-dashboard/patients")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-0.5">
              Patient Medical History
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Complete health record timeline
            </p>
          </div>
          <button className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export Full Report
          </button>
        </div>

        {/* Patient Banner */}
        <div className="bg-gradient-to-r from-cyan-500 via-cyan-600 to-blue-600 text-white rounded-2xl p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl font-bold shrink-0 border border-white/30">
                {patientInfo.initials}
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-1">
                  {patientInfo.name}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/80">
                  <span className="flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5" />{" "}
                    {patientInfo.bloodGroup}
                  </span>
                  <span>•</span>
                  <span>{patientInfo.age} years old</span>
                  <span>•</span>
                  <span>{patientInfo.gender}</span>
                  <span>•</span>
                  <span>{patientInfo.id}</span>
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-white/70 mt-1.5">
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5" /> {patientInfo.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5" /> {patientInfo.email}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm text-white/70 mb-1">Primary Condition</p>
              <span className="inline-block bg-white/20 backdrop-blur-sm border border-white/30 px-4 py-1.5 rounded-full text-sm font-medium">
                {patientInfo.condition}
              </span>
            </div>
          </div>
        </div>

        {/* Top 2-Column Grid: Treatment + Diagnostic */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* ── Treatment History ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-red-500" />
                </div>
                Treatment History
              </h3>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                {treatmentHistory.length} records
              </span>
            </div>

            <div className="p-5 space-y-3">
              {treatmentHistory.map((treatment) => {
                const isOpen = expandedTreatment === treatment.id;
                return (
                  <div
                    key={treatment.id}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggleTreatment(treatment.id)}
                      className="w-full text-left p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-2.5 h-2.5 bg-cyan-500 rounded-full mt-1.5 shrink-0" />
                          <div className="min-w-0">
                            <p className="font-medium text-gray-800 dark:text-white text-sm truncate">
                              {treatment.diagnosis}
                            </p>
                            <div className="flex flex-wrap items-center gap-x-3 mt-0.5 text-xs text-gray-400">
                              <span>{treatment.date}</span>
                              <span>·</span>
                              <span>{treatment.doctor}</span>
                              <span>·</span>
                              <span>{treatment.department}</span>
                            </div>
                          </div>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                        />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="px-5 pb-5 bg-gray-50/50 dark:bg-gray-900/30 border-t border-gray-100 dark:border-gray-700">
                        <div className="mt-4 space-y-3">
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                              Treatment
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {treatment.treatment}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">
                              Clinical Notes
                            </p>
                            <p className="text-sm text-gray-700 dark:text-gray-300">
                              {treatment.notes}
                            </p>
                          </div>
                          <button className="inline-flex items-center gap-1.5 text-xs text-cyan-600 hover:text-cyan-700 font-medium mt-1">
                            <Download className="w-3.5 h-3.5" /> Download Report
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Diagnostic / Test History ── */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
              <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                  <Microscope className="w-4 h-4 text-purple-500" />
                </div>
                Diagnostic History
              </h3>
              <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
                {diagnosticHistory.length} tests
              </span>
            </div>

            <div className="p-5 space-y-3">
              {diagnosticHistory.map((test) => (
                <div
                  key={test.id}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="font-medium text-gray-800 dark:text-white text-sm">
                      {test.test}
                    </p>
                    <Badge variant="success">{test.status}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-400 space-y-0.5">
                      <p>{test.date}</p>
                      <p>{test.lab}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Result:</span>
                      <Badge variant={test.resultColor}>{test.result}</Badge>
                      <button
                        title="Download"
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Medication History ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <Pill className="w-4 h-4 text-green-500" />
              </div>
              Medication History
            </h3>
            <button className="inline-flex items-center gap-1.5 text-xs border border-gray-200 dark:border-gray-700 px-3 py-1.5 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <Download className="w-3.5 h-3.5" /> Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  {[
                    "Medicine",
                    "Dosage",
                    "Frequency",
                    "Start Date",
                    "End Date",
                    "Prescribed By",
                    "Status",
                  ].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {medicationHistory.map((med) => (
                  <tr
                    key={med.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-gray-800 dark:text-white text-sm">
                      {med.medicine}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {med.dosage}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {med.frequency}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {med.startDate}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {med.endDate}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 dark:text-gray-300">
                      {med.prescribedBy}
                    </td>
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          med.status === "Active" ? "success" : "default"
                        }
                      >
                        {med.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── Prescription Timeline ── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-800 dark:text-white flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-500" />
              </div>
              Prescription Timeline
            </h3>
            <span className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
              Chronological
            </span>
          </div>

          <div className="p-6">
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-gradient-to-b from-cyan-400 via-cyan-300 to-gray-200 dark:to-gray-700" />

              <div className="space-y-5">
                {prescriptionTimeline.map((prescription, index) => (
                  <div key={prescription.id} className="relative flex gap-6">
                    {/* Timeline dot */}
                    <div className="relative shrink-0 w-10 flex flex-col items-center">
                      <div
                        className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 shadow z-10 mt-3 ${
                          index === 0
                            ? "bg-cyan-500"
                            : "bg-gray-300 dark:bg-gray-600"
                        }`}
                      />
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-cyan-200 dark:hover:border-cyan-800 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-all">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-white mb-0.5">
                            {prescription.diagnosis}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-400">
                            <span className="font-mono bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-600 dark:text-gray-300">
                              {prescription.prescriptionId}
                            </span>
                            <span>·</span>
                            <span>{prescription.department}</span>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                            {prescription.date}
                          </p>
                          <p className="text-xs text-gray-400">
                            {prescription.doctor}
                          </p>
                        </div>
                      </div>

                      {/* Medicine tags */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {prescription.medicines.map((med, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300 rounded-full text-xs font-medium"
                          >
                            {med}
                          </span>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-4 pt-2 border-t border-gray-200 dark:border-gray-700">
                        <button className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-medium">
                          View Details
                        </button>
                        <button className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors">
                          <Download className="w-3 h-3" />
                          Download PDF
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
