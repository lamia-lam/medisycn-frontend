"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";
import {
  Activity,
  Microscope,
  Upload,
  FileText,
  X,
  CheckCircle,
  FlaskConical,
  FilePlus,
  User,
  Loader2,
  RefreshCw,
  Stethoscope,
  Calendar,
} from "lucide-react";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/diagnosis-dashboard",
  },
  {
    icon: <Microscope className="w-5 h-5" />,
    label: "Test Requests",
    href: "/diagnosis-dashboard/test-requests",
  },
  {
    icon: <Upload className="w-5 h-5" />,
    label: "Upload Reports",
    href: "/diagnosis-dashboard/upload",
  },
];

interface InProgressTest {
  id: number;
  patient: string;
  patientId: number;
  test: string;
  doctor: string;
  department: string;
  requestedDate: string;
  priority: "Normal" | "Urgent";
  status: "In_Progress" | "Completed";
  reportUrl: string | null;
  prescriptionId: number | null;
  testIndex: number;
}

export default function UploadReports() {
  const [tests, setTests] = useState<InProgressTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadModal, setUploadModal] = useState<{
    open: boolean;
    test: InProgressTest | null;
  }>({ open: false, test: null });
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchTests = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/diagnostic/upload-reports");
      if (res.ok) {
        const data = await res.json();
        setTests(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  const openUpload = (test: InProgressTest) => {
    setSelectedFile(null);
    setUploadError(null);
    setUploadModal({ open: true, test });
  };

  const closeUpload = () => {
    setUploadModal({ open: false, test: null });
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleFileSelect = (file: File) => {
    if (file.type === "application/pdf") {
      setSelectedFile(file);
      setUploadError(null);
    } else {
      setUploadError("Only PDF files are accepted.");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirmUpload = async () => {
    if (!selectedFile || !uploadModal.test) return;
    setUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append("reportId", String(uploadModal.test.id));
      formData.append("file", selectedFile);

      const res = await fetch("/api/diagnostic/upload-reports", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        // Optimistically update status
        const { reportUrl } = await res.json();
        setTests((prev) =>
          prev.map((t) =>
            t.id === uploadModal.test!.id
              ? { ...t, status: "Completed", reportUrl }
              : t,
          ),
        );
        closeUpload();
      } else {
        const errData = await res.json();
        setUploadError(errData.error || "Upload failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setUploadError("Network error — could not upload file.");
    } finally {
      setUploading(false);
    }
  };

  const inProgressTests = tests.filter((t) => t.status === "In_Progress");
  const completedTests = tests.filter((t) => t.status === "Completed");

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Diagnostic">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              Upload Reports
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Upload PDF test results for in-progress tests
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchTests}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-semibold text-amber-600">
                {inProgressTests.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Awaiting Upload
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-semibold text-green-600">
                {completedTests.length}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Uploaded
              </p>
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
          </div>
        )}

        {/* Content */}
        {!loading && (
          <>
            {/* In-Progress Tests */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
              <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-5 flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                In-Progress Tests
                {inProgressTests.length > 0 && (
                  <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({inProgressTests.length})
                  </span>
                )}
              </h3>

              {inProgressTests.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-400 opacity-70" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No in-progress tests. Start a test from the{" "}
                    <a
                      href="/diagnosis-dashboard/test-requests"
                      className="text-cyan-600 hover:underline"
                    >
                      Test Requests
                    </a>{" "}
                    page.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {inProgressTests.map((test) => (
                    <TestCard
                      key={test.id}
                      test={test}
                      onUpload={() => openUpload(test)}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Completed Tests */}
            {completedTests.length > 0 && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-5 flex items-center gap-2">
                  <span className="inline-block w-2.5 h-2.5 rounded-full bg-green-400"></span>
                  Completed Tests
                  <span className="ml-1 text-sm font-normal text-gray-500 dark:text-gray-400">
                    ({completedTests.length})
                  </span>
                </h3>
                <div className="space-y-3">
                  {completedTests.map((test) => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Upload Modal */}
      {uploadModal.open && uploadModal.test && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
            onClick={closeUpload}
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200 dark:border-gray-700"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Upload Test Report
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                    {uploadModal.test.test}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    <span>{uploadModal.test.patient}</span>
                    <span>—</span>
                    <Stethoscope className="w-3.5 h-3.5" />
                    <span>{uploadModal.test.doctor}</span>
                  </div>
                </div>
                <button
                  onClick={closeUpload}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500 dark:text-gray-400 shrink-0 ml-4"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drop Zone */}
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200 ${
                  dragOver
                    ? "border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20"
                    : selectedFile
                    ? "border-green-400 bg-green-50 dark:bg-green-900/10"
                    : "border-gray-200 dark:border-gray-600 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) =>
                    e.target.files?.[0] && handleFileSelect(e.target.files[0])
                  }
                />
                {selectedFile ? (
                  <>
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium text-green-600 dark:text-green-400">
                      {selectedFile.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Click to
                      change
                    </p>
                  </>
                ) : (
                  <>
                    <FilePlus className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Drag & drop PDF here
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                      Accepts PDF files only
                    </p>
                  </>
                )}
              </div>

              {/* Error */}
              {uploadError && (
                <p className="mt-3 text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
                  <X className="w-4 h-4 shrink-0" />
                  {uploadError}
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeUpload}
                  disabled={uploading}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={!selectedFile || uploading}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading…
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Confirm Upload
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function TestCard({
  test,
  onUpload,
}: {
  test: InProgressTest;
  onUpload?: () => void;
}) {
  const isCompleted = test.status === "Completed";

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
        isCompleted
          ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800"
          : "bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-700"
      }`}
    >
      {/* Left info */}
      <div className="flex items-center gap-4 min-w-0">
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
            isCompleted
              ? "bg-green-100 dark:bg-green-900/30 text-green-600"
              : "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600"
          }`}
        >
          {isCompleted ? (
            <CheckCircle className="w-5 h-5" />
          ) : (
            <FlaskConical className="w-5 h-5" />
          )}
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
            <p className="font-semibold text-gray-800 dark:text-white">
              {test.test}
            </p>
            {test.priority === "Urgent" && (
              <Badge variant="danger">Urgent</Badge>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <User className="w-3.5 h-3.5" />
              {test.patient}
            </span>
            <span className="flex items-center gap-1">
              <Stethoscope className="w-3.5 h-3.5" />
              {test.doctor}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {test.requestedDate}
            </span>
          </div>
          {isCompleted && test.reportUrl && (
            <a
              href={test.reportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1 hover:underline"
            >
              <FileText className="w-3.5 h-3.5" />
              View Report
            </a>
          )}
        </div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
        {isCompleted ? (
          <Badge variant="success">Completed</Badge>
        ) : (
          <>
            <Badge variant="warning">In Progress</Badge>
            <button
              onClick={onUpload}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Upload Report
            </button>
          </>
        )}
      </div>
    </div>
  );
}
