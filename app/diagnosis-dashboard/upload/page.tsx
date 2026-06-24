"use client";

import { useState, useRef } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Badge } from '../../components/Badge';
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
} from 'lucide-react';

const sidebarItems = [
  { icon: <Activity className="w-5 h-5" />, label: 'Dashboard', href: '/diagnosis-dashboard' },
  { icon: <Microscope className="w-5 h-5" />, label: 'Test Requests', href: '/diagnosis-dashboard/test-requests' },
  { icon: <Upload className="w-5 h-5" />, label: 'Upload Reports', href: '/diagnosis-dashboard/upload' },
];

interface InProgressTest {
  id: string;
  patient: string;
  patientId: string;
  test: string;
  doctor: string;
  requestedDate: string;
  priority: 'Normal' | 'Urgent';
  uploadedFile?: string;
}

const initialTests: InProgressTest[] = [
  { id: 'T001', patient: 'John Doe', patientId: 'P001', test: 'Complete Blood Count (CBC)', doctor: 'Dr. Sarah Smith', requestedDate: '2026-06-20', priority: 'Normal' },
  { id: 'T002', patient: 'John Doe', patientId: 'P001', test: 'Lipid Profile', doctor: 'Dr. Sarah Smith', requestedDate: '2026-06-20', priority: 'Normal' },
  { id: 'T003', patient: 'Jane Smith', patientId: 'P002', test: 'Blood Glucose (Fasting)', doctor: 'Dr. Michael Chen', requestedDate: '2026-06-21', priority: 'Urgent' },
  { id: 'T004', patient: 'Sarah Williams', patientId: 'P004', test: 'Liver Function Test (LFT)', doctor: 'Dr. Robert Brown', requestedDate: '2026-06-22', priority: 'Normal' },
  { id: 'T005', patient: 'Mike Johnson', patientId: 'P003', test: 'Urine Culture & Sensitivity', doctor: 'Dr. Emily Davis', requestedDate: '2026-06-23', priority: 'Normal' },
];

export default function UploadReports() {
  const [tests, setTests] = useState<InProgressTest[]>(initialTests);
  const [uploadModal, setUploadModal] = useState<{ open: boolean; testId: string | null }>({ open: false, testId: null });
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const openUpload = (testId: string) => {
    setSelectedFile(null);
    setUploadModal({ open: true, testId });
  };

  const closeUpload = () => {
    setUploadModal({ open: false, testId: null });
    setSelectedFile(null);
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setSelectedFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleConfirmUpload = () => {
    if (!selectedFile || !uploadModal.testId) return;
    setTests(prev =>
      prev.map(t =>
        t.id === uploadModal.testId ? { ...t, uploadedFile: selectedFile.name } : t
      )
    );
    closeUpload();
  };

  const completedCount = tests.filter(t => t.uploadedFile).length;
  const pendingCount = tests.filter(t => !t.uploadedFile).length;
  const activeTest = tests.find(t => t.id === uploadModal.testId);

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Diagnostic">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">Upload Reports</h2>
            <p className="text-gray-500 dark:text-gray-400">Upload PDF test results for in-progress tests</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-semibold text-blue-600">{pendingCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Awaiting Upload</p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-2 text-center min-w-[80px]">
              <p className="text-2xl font-semibold text-green-600">{completedCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded</p>
            </div>
          </div>
        </div>

        {/* Test list */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <h3 className="font-semibold text-gray-800 dark:text-white text-lg mb-5">In-Progress Tests</h3>

          {tests.length === 0 ? (
            <div className="text-center py-16">
              <CheckCircle className="w-14 h-14 mx-auto mb-4 text-green-500 opacity-60" />
              <p className="text-gray-500 dark:text-gray-400">All reports have been uploaded!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tests.map(test => (
                <div
                  key={test.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border transition-colors ${
                    test.uploadedFile
                      ? 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                      : 'bg-gray-50 dark:bg-gray-900/30 border-gray-100 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      test.uploadedFile
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                        : 'bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600'
                    }`}>
                      {test.uploadedFile
                        ? <CheckCircle className="w-5 h-5" />
                        : <FlaskConical className="w-5 h-5" />
                      }
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <p className="font-semibold text-gray-800 dark:text-white">{test.test}</p>
                        {test.priority === 'Urgent' && <Badge variant="danger">Urgent</Badge>}
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {test.patient}
                        </span>
                        <span>— {test.doctor}</span>
                        <span>{test.requestedDate}</span>
                      </div>
                      {test.uploadedFile && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5" />
                          {test.uploadedFile}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
                    {test.uploadedFile ? (
                      <Badge variant="success">Uploaded</Badge>
                    ) : (
                      <>
                        <Badge variant="warning">In Progress</Badge>
                        <button
                          onClick={() => openUpload(test.id)}
                          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          <Upload className="w-4 h-4" />
                          Upload Result
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {uploadModal.open && (
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
              onClick={e => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Upload Test Report</h3>
                  {activeTest && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{activeTest.test}</p>
                  )}
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
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : selectedFile
                    ? 'border-green-400 bg-green-50 dark:bg-green-900/10'
                    : 'border-gray-200 dark:border-gray-600 hover:border-cyan-400 hover:bg-cyan-50/50 dark:hover:bg-cyan-900/10'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={e => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                {selectedFile ? (
                  <>
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-green-500" />
                    <p className="font-medium text-green-600 dark:text-green-400">{selectedFile.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB — Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <FilePlus className="w-12 h-12 mx-auto mb-3 text-gray-400 dark:text-gray-500" />
                    <p className="font-medium text-gray-700 dark:text-gray-300 mb-1">Drag & drop PDF here</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">or click to browse files</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Accepts PDF files only</p>
                  </>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={closeUpload}
                  className="flex-1 py-3 border border-gray-200 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmUpload}
                  disabled={!selectedFile}
                  className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Upload className="w-4 h-4" />
                  Confirm Upload
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </DashboardLayout>
  );
}
