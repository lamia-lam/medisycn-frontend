"use client";

import { useState } from "react";
import { DashboardLayout } from "../../../components/DashboardLayout";
import {
  Activity,
  Calendar,
  FileText,
  Pill,
  ArrowLeft,
  Download,
  ZoomIn,
  ZoomOut,
  Printer,
  HeartPulse,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/patient-dashboard",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Appointments",
    href: "/patient-dashboard/appointments",
  },
  {
    icon: <HeartPulse className="w-5 h-5" />,
    label: "Medical Records",
    href: "/patient-dashboard/records",
  },
  {
    icon: <Pill className="w-5 h-5" />,
    label: "Prescriptions",
    href: "/patient-dashboard/prescriptions",
  },
];

type ResultRow = {
  test: string;
  result: string;
  range: string;
  unit: string;
  flag?: "H" | "L";
};

type ReportRecord = {
  testName: string;
  testDate: string;
  testTime: string;
  type: string;
  doctor: string;
  department: string;
  interpretation: string;
  reportedBy: string;
  results: ResultRow[];
};

const medicalRecords: Record<string, ReportRecord> = {
  "1": {
    testName: "Complete Blood Count (CBC)",
    testDate: "2026-04-20",
    testTime: "09:30 AM",
    type: "Lab Report",
    doctor: "Dr. Sarah Smith",
    department: "Internal Medicine",
    reportedBy: "James Carter, MLT",
    interpretation:
      "Mild microcytic anemia noted (low Hemoglobin, RBC, and MCV). All other parameters within normal limits. Iron studies recommended for further evaluation.",
    results: [
      { test: "Hemoglobin", result: "11.8", range: "13.5 – 17.5", unit: "g/dL", flag: "L" },
      { test: "RBC Count", result: "4.2", range: "4.5 – 5.9", unit: "10⁶/µL", flag: "L" },
      { test: "WBC Count", result: "7.4", range: "4.5 – 11.0", unit: "10³/µL" },
      { test: "Platelet Count", result: "240", range: "150 – 400", unit: "10³/µL" },
      { test: "Hematocrit", result: "36", range: "41 – 53", unit: "%", flag: "L" },
      { test: "MCV", result: "78", range: "80 – 100", unit: "fL", flag: "L" },
    ],
  },
  "2": {
    testName: "Lipid Profile",
    testDate: "2026-04-20",
    testTime: "09:30 AM",
    type: "Lab Report",
    doctor: "Dr. Sarah Smith",
    department: "Internal Medicine",
    reportedBy: "James Carter, MLT",
    interpretation:
      "LDL cholesterol and total cholesterol are slightly above normal limits. HDL and triglycerides are within range. Dietary modification and repeat test in 3 months recommended.",
    results: [
      { test: "Total Cholesterol", result: "215", range: "< 200", unit: "mg/dL", flag: "H" },
      { test: "LDL Cholesterol", result: "138", range: "< 130", unit: "mg/dL", flag: "H" },
      { test: "HDL Cholesterol", result: "52", range: "> 40", unit: "mg/dL" },
      { test: "Triglycerides", result: "142", range: "< 150", unit: "mg/dL" },
      { test: "VLDL", result: "28", range: "5 – 40", unit: "mg/dL" },
    ],
  },
  "3": {
    testName: "ECG (Electrocardiogram)",
    testDate: "2026-03-15",
    testTime: "02:00 PM",
    type: "Diagnostic",
    doctor: "Dr. Michael Brown",
    department: "Cardiology",
    reportedBy: "Dr. Michael Brown, Cardiologist",
    interpretation:
      "Normal sinus rhythm. No significant ST-T wave changes. Heart rate, PR interval, and QRS duration are all within normal reference limits.",
    results: [
      { test: "Heart Rate", result: "72", range: "60 – 100", unit: "bpm" },
      { test: "PR Interval", result: "160", range: "120 – 200", unit: "ms" },
      { test: "QRS Duration", result: "90", range: "80 – 120", unit: "ms" },
      { test: "QT Interval", result: "400", range: "350 – 440", unit: "ms" },
    ],
  },
  "4": {
    testName: "Chest X-Ray",
    testDate: "2026-03-10",
    testTime: "11:00 AM",
    type: "Imaging",
    doctor: "Dr. Emily Davis",
    department: "Radiology",
    reportedBy: "Dr. Emily Davis, Radiologist",
    interpretation:
      "Lungs are clear bilaterally. No consolidation, pleural effusion, or pneumothorax identified. Cardiac silhouette is normal in size and configuration. Bony thorax intact.",
    results: [
      { test: "Lungs", result: "Clear", range: "Clear", unit: "" },
      { test: "Cardiac Silhouette", result: "Normal", range: "Normal", unit: "" },
      { test: "Pleural Space", result: "No effusion", range: "No effusion", unit: "" },
      { test: "Mediastinum", result: "Normal", range: "Normal", unit: "" },
    ],
  },
  "5": {
    testName: "Thyroid Function Test",
    testDate: "2026-02-28",
    testTime: "10:15 AM",
    type: "Lab Report",
    doctor: "Dr. Sarah Smith",
    department: "Internal Medicine",
    reportedBy: "James Carter, MLT",
    interpretation:
      "TSH is mildly elevated, consistent with subclinical hypothyroidism. Free T4 and Free T3 are within reference ranges. Clinical correlation advised; repeat TSH in 6 weeks.",
    results: [
      { test: "TSH", result: "5.8", range: "0.5 – 4.5", unit: "µIU/mL", flag: "H" },
      { test: "Free T4", result: "1.1", range: "0.8 – 1.8", unit: "ng/dL" },
      { test: "Free T3", result: "3.2", range: "2.3 – 4.2", unit: "pg/mL" },
    ],
  },
  "6": {
    testName: "Ultrasound Abdomen",
    testDate: "2026-02-15",
    testTime: "03:30 PM",
    type: "Imaging",
    doctor: "Dr. John Wilson",
    department: "Radiology",
    reportedBy: "Dr. John Wilson, Radiologist",
    interpretation:
      "Liver is normal in size and echogenicity with no focal lesion. Gallbladder shows no stones or wall thickening. Spleen, pancreas, and both kidneys appear normal.",
    results: [
      { test: "Liver", result: "Normal", range: "Normal", unit: "" },
      { test: "Gallbladder", result: "No stones", range: "No stones", unit: "" },
      { test: "Spleen", result: "Normal size", range: "Normal", unit: "" },
      { test: "Kidneys", result: "Normal", range: "Normal", unit: "" },
      { test: "Pancreas", result: "Normal", range: "Normal", unit: "" },
    ],
  },
};

const patientInfo = {
  name: "John Doe",
  id: "P0042",
  age: 34,
  gender: "Male",
};

export default function MedicalRecordViewer() {
  const router = useRouter();
  const params = useParams();
  const [zoom, setZoom] = useState(100);

  const record = medicalRecords[params.recordId as string];

  if (!record) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <FileText className="w-12 h-12 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Record not found
          </p>
          <button
            onClick={() => router.push("/patient-dashboard/records")}
            className="text-cyan-600 hover:underline text-sm"
          >
            Back to Medical Records
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
              onClick={() => router.push("/patient-dashboard/records")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white leading-tight">
                Medical Report Viewer
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {record.testName}
              </p>
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
                <div className="text-center mb-6 pb-6 border-b-2 border-cyan-600">
                  <h1 className="text-2xl font-bold text-cyan-600 mb-1">
                    MediSync Health Center
                  </h1>
                  <p className="text-sm text-gray-500">
                    456 Healthcare Ave, Springfield, IL 62702
                  </p>
                  <p className="text-sm text-gray-500">
                    Phone: +1 (555) 111-2222 &nbsp;|&nbsp; www.medisync.health
                  </p>
                </div>

                {/* Report Title */}
                <div className="text-center mb-7">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    {record.type}
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">
                    {record.testName}
                  </h2>
                </div>

                {/* Patient & Test Info Grid */}
                <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-7 text-sm bg-gray-50 rounded-lg p-5 border border-gray-200">
                  {[
                    { label: "Patient Name", value: patientInfo.name },
                    { label: "Patient ID", value: `#${patientInfo.id}` },
                    {
                      label: "Age / Gender",
                      value: `${patientInfo.age} yrs / ${patientInfo.gender}`,
                    },
                    {
                      label: "Test Date & Time",
                      value: `${record.testDate}  ${record.testTime}`,
                    },
                    { label: "Referred By", value: record.doctor },
                    { label: "Department", value: record.department },
                  ].map((item) => (
                    <div key={item.label}>
                      <p className="text-xs text-gray-400 mb-0.5">{item.label}:</p>
                      <p className="font-semibold text-gray-800">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Results Table */}
                <div className="mb-7">
                  <table className="w-full text-sm border-collapse">
                    <thead>
                      <tr className="bg-gray-100 border border-gray-300">
                        <th className="text-left px-3 py-2 border border-gray-300 font-semibold text-gray-700">
                          Test
                        </th>
                        <th className="text-left px-3 py-2 border border-gray-300 font-semibold text-gray-700">
                          Result
                        </th>
                        <th className="text-left px-3 py-2 border border-gray-300 font-semibold text-gray-700">
                          Reference Range
                        </th>
                        <th className="text-left px-3 py-2 border border-gray-300 font-semibold text-gray-700">
                          Unit
                        </th>
                        <th className="text-left px-3 py-2 border border-gray-300 font-semibold text-gray-700">
                          Flag
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.results.map((row, idx) => (
                        <tr
                          key={row.test}
                          className={`border border-gray-200 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50/60"
                            } ${row.flag ? "bg-red-50/50" : ""}`}
                        >
                          <td className="px-3 py-2 border border-gray-200 text-gray-700">
                            {row.test}
                          </td>
                          <td
                            className={`px-3 py-2 border border-gray-200 font-semibold ${row.flag
                              ? "text-red-600"
                              : "text-gray-800"
                              }`}
                          >
                            {row.result}
                          </td>
                          <td className="px-3 py-2 border border-gray-200 text-gray-500">
                            {row.range}
                          </td>
                          <td className="px-3 py-2 border border-gray-200 text-gray-500">
                            {row.unit || "—"}
                          </td>
                          <td className="px-3 py-2 border border-gray-200">
                            {row.flag ? (
                              <span
                                className={`text-xs font-bold px-2 py-0.5 rounded ${row.flag === "H"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-orange-100 text-orange-700"
                                  }`}
                              >
                                {row.flag === "H" ? "▲ H" : "▼ L"}
                              </span>
                            ) : (
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Normal
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Interpretation */}
                <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h4 className="text-sm font-semibold text-gray-700 mb-1.5">
                    Interpretation:
                  </h4>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {record.interpretation}
                  </p>
                </div>

                {/* Signature Row */}
                <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-gray-400 mb-10">Lab Technician</p>
                    <div className="border-t border-gray-400 w-44 pt-1">
                      <p className="text-xs text-gray-500">{record.reportedBy}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-10">Pathologist / Consultant</p>
                    <div className="border-t border-gray-400 w-44 pt-1 ml-auto">
                      <p className="text-xs text-gray-500">{record.doctor}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-400 space-y-0.5 border-t border-gray-100 pt-4">
                  <p>
                    This is a computer-generated report and does not require a
                    physical signature.
                  </p>
                  <p>Report generated on {record.testDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
