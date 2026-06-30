"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import {
  Activity,
  Calendar,
  FileText,
  Pill,
  Search,
  Filter,
  Eye,
  Download,
  Clock,
  User,
  HeartPulse,
  Building2,
  Loader2,
  FlaskConical,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

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

interface MedicalRecord {
  id: number;
  testName: string;
  testDate: string;
  testTime: string;
  doctor: string;
  department: string;
  reportUrl: string | null;
  findings: string;
  type: string;
}

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [previewReport, setPreviewReport] = useState<MedicalRecord | null>(
    null,
  );

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patient/records");
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const filteredRecords = records.filter((record) => {
    const matchesSearch =
      record.testName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || record.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              Medical Records
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              View and download your diagnostic test reports
            </p>
          </div>
          <button
            onClick={fetchRecords}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm shrink-0"
          >
            <RefreshCw
              className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Total Records",
                  value: records.length,
                  color:
                    "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-400",
                },
                {
                  label: "Lab Reports",
                  value: records.filter((r) => r.type === "Lab Report").length,
                  color:
                    "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400",
                },
                {
                  label: "Reports with PDF",
                  value: records.filter((r) => r.reportUrl).length,
                  color:
                    "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`rounded-xl p-4 ${stat.color} border border-transparent`}
                >
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs font-medium mt-0.5 opacity-80">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Records Card */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              {/* Search & Filter */}
              <div className="flex flex-col lg:flex-row gap-3 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by test name, doctor, or department…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent placeholder-gray-400"
                  />
                </div>
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 appearance-none cursor-pointer"
                  >
                    <option value="all">All Types</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Imaging">Imaging</option>
                    <option value="Diagnostic">Diagnostic</option>
                  </select>
                </div>
              </div>

              {/* Empty state */}
              {records.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                    <FlaskConical className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 font-medium mb-1">
                    No diagnostic reports yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm">
                    Your lab reports will appear here once uploaded by the
                    diagnostic center.
                  </p>
                </div>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-12">
                  <Search className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 font-medium">
                    No records match your search
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                    Try adjusting your search or filter
                  </p>
                </div>
              ) : (
                /* Records Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredRecords.map((record) => (
                    <RecordCard
                      key={record.id}
                      record={record}
                      onPreview={() => setPreviewReport(record)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* PDF Preview Modal */}
      {previewReport && (
        <ReportModal
          record={previewReport}
          onClose={() => setPreviewReport(null)}
        />
      )}
    </DashboardLayout>
  );
}

// ─── Record Card ──────────────────────────────────────────────────────────────

function RecordCard({
  record,
  onPreview,
}: {
  record: MedicalRecord;
  onPreview: () => void;
}) {
  const hasPdf = !!record.reportUrl;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-all hover:border-cyan-300 dark:hover:border-cyan-700 bg-white dark:bg-gray-800 flex flex-col">
      {/* Top row */}
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400">
          <FileText className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400">
          {record.type}
        </span>
      </div>

      {/* Test Name */}
      <h4 className="font-semibold text-gray-800 dark:text-white text-sm mb-3 line-clamp-2 leading-snug flex-1">
        {record.testName}
      </h4>

      {/* Meta */}
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3.5 h-3.5 shrink-0" />
          <span>{record.testDate}</span>
          <Clock className="w-3.5 h-3.5 shrink-0 ml-1" />
          <span>{record.testTime}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{record.doctor}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
          <Building2 className="w-3.5 h-3.5 shrink-0" />
          <span>{record.department}</span>
        </div>
      </div>

      {/* PDF status pill */}
      <div className="mb-4">
        {hasPdf ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>
            PDF Report Available
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block"></span>
            No PDF
          </span>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-4 border-t border-gray-100 dark:border-gray-700">
        {hasPdf ? (
          <>
            <button
              onClick={onPreview}
              className="flex-1 px-3 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium transition-colors"
            >
              <Eye className="w-3.5 h-3.5" />
              View Report
            </button>
            <a
              href={record.reportUrl!}
              download
              target="_blank"
              rel="noopener noreferrer"
              title="Download PDF"
              className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
            </a>
          </>
        ) : (
          <button
            disabled
            className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium cursor-not-allowed"
          >
            <FileText className="w-3.5 h-3.5" />
            Awaiting Report
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Report Preview Modal ─────────────────────────────────────────────────────

function ReportModal({
  record,
  onClose,
}: {
  record: MedicalRecord;
  onClose: () => void;
}) {
  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-start justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                {record.testName}
              </h3>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-1">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5" />
                  {record.doctor}
                </span>
                <span className="flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5" />
                  {record.department}
                </span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {record.testDate}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-4 shrink-0">
              <a
                href={record.reportUrl!}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download
              </a>
              <a
                href={record.reportUrl!}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <ExternalLink className="w-4 h-4" />
                Open
              </a>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
              >
                ✕
              </button>
            </div>
          </div>

          {/* PDF Viewer */}
          <div className="flex-1 overflow-hidden bg-gray-100 dark:bg-gray-900 min-h-0">
            <iframe
              src={record.reportUrl!}
              className="w-full h-full min-h-[60vh]"
              title={`Report: ${record.testName}`}
            />
          </div>
        </div>
      </div>
    </>
  );
}
