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
  FileText,
  AlertCircle,
  Loader2,
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

export default function MedicalRecordViewer() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.recordId as string;

  const [record, setRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    if (!recordId) return;
    async function fetchRecord() {
      try {
        const res = await fetch(`/api/patient/records/${recordId}`);
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to load record");
        }
        const data = await res.json();
        setRecord(data);
      } catch (err: any) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }
    fetchRecord();
  }, [recordId]);

  if (loading) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          <p className="text-gray-500 dark:text-gray-400">Loading record...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !record) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Record not found
          </p>
          <p className="text-sm text-gray-400">
            {error || `The record "${recordId}" could not be located.`}
          </p>
          <button
            onClick={() => router.push("/patient-dashboard/records")}
            className="mt-2 text-cyan-600 hover:underline text-sm font-medium"
          >
            ← Back to Medical Records
          </button>
        </div>
      </DashboardLayout>
    );
  }

  const hasPdf = !!record.reportUrl;

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
            {/* Zoom Controls — only meaningful if no PDF embed */}
            {!hasPdf && (
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
            )}

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>

            {hasPdf ? (
              <a
                href={record.reportUrl}
                download
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </a>
            ) : (
              <button
                disabled
                title="No PDF uploaded for this record"
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-300 text-white rounded-lg text-sm font-medium cursor-not-allowed shadow-sm"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            )}
          </div>
        </div>

        {/* Document Viewer */}
        <div className="bg-gray-100 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-auto p-6 min-h-[75vh]">
          {hasPdf ? (
            /* Embedded PDF viewer */
            <iframe
              src={record.reportUrl}
              className="w-full rounded-lg border border-gray-200"
              style={{ minHeight: "72vh" }}
              title={record.testName}
            />
          ) : (
            /* Rendered document card */
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
              }}
            >
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
                      { label: "Patient Name", value: record.patient.name },
                      { label: "Patient ID", value: `#${record.patient.id}` },
                      {
                        label: "Age / Gender",
                        value: `${record.patient.age} / ${record.patient.gender}`,
                      },
                      {
                        label: "Test Date & Time",
                        value: `${record.testDate}  ${record.testTime}`,
                      },
                      { label: "Referred By", value: record.doctor },
                      { label: "Department", value: record.department },
                    ].map((item) => (
                      <div key={item.label}>
                        <p className="text-xs text-gray-400 mb-0.5">
                          {item.label}:
                        </p>
                        <p className="font-semibold text-gray-800">
                          {item.value}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Findings / Interpretation */}
                  {record.findings ? (
                    <div className="mb-8 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                      <h4 className="text-sm font-semibold text-gray-700 mb-1.5">
                        Findings / Interpretation:
                      </h4>
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                        {record.findings}
                      </p>
                    </div>
                  ) : (
                    <div className="mb-8 flex flex-col items-center justify-center gap-3 py-10 text-gray-400">
                      <FileText className="w-10 h-10" />
                      <p className="text-sm">
                        No findings recorded for this report yet.
                      </p>
                    </div>
                  )}

                  {/* Signature Row */}
                  <div className="pt-6 border-t border-gray-200 flex justify-between items-end">
                    <div>
                      <p className="text-xs text-gray-400 mb-10">
                        Lab Technician
                      </p>
                      <div className="border-t border-gray-400 w-44 pt-1">
                        <p className="text-xs text-gray-500">
                          {record.reportedBy}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 mb-10">
                        Pathologist / Consultant
                      </p>
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
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
