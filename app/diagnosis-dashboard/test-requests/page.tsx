"use client";

import { useState } from 'react';
import { DashboardLayout } from '../../components/DashboardLayout';
import { Badge } from '../../components/Badge';
import {
  Activity,
  Microscope,
  Upload,
  FileText,
  Search,
  User,
  Phone,
  Calendar,
  FlaskConical,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

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

type TestStatus = 'Pending' | 'In Progress' | 'Completed';

interface Test {
  id: string;
  name: string;
  status: TestStatus;
  priority: string;
}

interface Prescription {
  id: string;
  doctor: string;
  date: string;
  tests: Test[];
}

interface Patient {
  id: string;
  name: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  prescriptions: Prescription[];
}

const patientsData: Patient[] = [
  {
    id: 'P001',
    name: 'John Doe',
    phone: '+1 (555) 123-4567',
    age: 45,
    gender: 'Male',
    bloodGroup: 'A+',
    prescriptions: [
      {
        id: 'RX001',
        doctor: 'Dr. Sarah Smith',
        date: '2026-06-20',
        tests: [
          { id: 'T001', name: 'Complete Blood Count (CBC)', status: 'Pending', priority: 'Normal' },
          { id: 'T002', name: 'Lipid Profile', status: 'Pending', priority: 'Normal' },
        ],
      },
      {
        id: 'RX002',
        doctor: 'Dr. Michael Chen',
        date: '2026-06-15',
        tests: [
          { id: 'T003', name: 'Blood Glucose (Fasting)', status: 'In Progress', priority: 'Urgent' },
        ],
      },
    ],
  },
  {
    id: 'P002',
    name: 'Jane Smith',
    phone: '+1 (555) 234-5678',
    age: 32,
    gender: 'Female',
    bloodGroup: 'B+',
    prescriptions: [
      {
        id: 'RX003',
        doctor: 'Dr. Emily Davis',
        date: '2026-06-22',
        tests: [
          { id: 'T004', name: 'Thyroid Function Test (TFT)', status: 'Pending', priority: 'Normal' },
          { id: 'T005', name: 'HbA1c', status: 'Pending', priority: 'Urgent' },
        ],
      },
    ],
  },
  {
    id: 'P003',
    name: 'Mike Johnson',
    phone: '+1 (555) 345-6789',
    age: 28,
    gender: 'Male',
    bloodGroup: 'O+',
    prescriptions: [
      {
        id: 'RX004',
        doctor: 'Dr. Robert Brown',
        date: '2026-06-21',
        tests: [
          { id: 'T006', name: 'Urine Culture & Sensitivity', status: 'Pending', priority: 'Normal' },
          { id: 'T007', name: 'Kidney Function Test', status: 'Pending', priority: 'Normal' },
          { id: 'T008', name: 'Serum Creatinine', status: 'Pending', priority: 'Normal' },
        ],
      },
    ],
  },
  {
    id: 'P004',
    name: 'Sarah Williams',
    phone: '+1 (555) 456-7890',
    age: 55,
    gender: 'Female',
    bloodGroup: 'AB+',
    prescriptions: [
      {
        id: 'RX005',
        doctor: 'Dr. Sarah Smith',
        date: '2026-06-18',
        tests: [
          { id: 'T009', name: 'Liver Function Test (LFT)', status: 'In Progress', priority: 'Normal' },
          { id: 'T010', name: 'Serum Bilirubin', status: 'Pending', priority: 'Normal' },
        ],
      },
    ],
  },
];



export default function TestRequests() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof patientsData>([]);
  const [searched, setSearched] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === '') {
      setSearchResults([]);
      setSearched(false);
      return;
    }
    setSearched(true);
    const filtered = patientsData.filter(
      p =>
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.phone.includes(query)
    );
    setSearchResults(filtered);
    if (filtered.length === 1) setExpandedPatient(filtered[0].id);
  };

  const getTestStatus = (testId: string, defaultStatus: TestStatus): TestStatus =>
    testStatuses[testId] ?? defaultStatus;

  const startTest = (testId: string) => {
    setTestStatuses(prev => ({ ...prev, [testId]: 'In Progress' }));
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Diagnostic">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white">Test Requests</h2>
          <p className="text-gray-500 dark:text-gray-400">
            Search for a patient to view their prescription test orders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient by name or phone number..."
              value={searchQuery}
              onChange={e => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-100 text-lg transition-all"
            />
          </div>

          {searched && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found {searchResults.length} patient(s)
            </p>
          )}

          {!searched && (
            <div className="text-center py-16">
              <Microscope className="w-14 h-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">Search for a patient to see their test requests</p>
            </div>
          )}

          {searched && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">No patients found</p>
            </div>
          )}

          <div className="space-y-4">
            {searchResults.map(patient => (
              <div key={patient.id} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                <button
                  className="w-full p-5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                  onClick={() =>
                    setExpandedPatient(expandedPatient === patient.id ? null : patient.id)
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 flex items-center justify-center shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-lg text-gray-800 dark:text-white">{patient.name}</p>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5" />
                          {patient.phone}
                        </span>
                        <span>{patient.age} yrs, {patient.gender}</span>
                        <Badge variant="outline">{patient.bloodGroup}</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                      {patient.prescriptions.reduce((acc, p) => acc + p.tests.length, 0)} tests
                    </span>
                    {expandedPatient === patient.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedPatient === patient.id && (
                  <div className="border-t border-gray-200 dark:border-gray-700 p-5 space-y-5">
                    {patient.prescriptions.map(prescription => (
                      <div key={prescription.id}>
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <FileText className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-800 dark:text-white">{prescription.id}</span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">— {prescription.doctor}</span>
                          <span className="sm:ml-auto w-full sm:w-auto text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1">
                            <Calendar className="w-3.5 h-3.5" />
                            {prescription.date}
                          </span>
                        </div>

                        <div className="space-y-2 pl-2">
                          {prescription.tests.map((test) => {
                            const status = getTestStatus(test.id, test.status);
                            return (
                              <div
                                key={test.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                              >
                                <div className="flex items-center gap-3">
                                  <FlaskConical className="w-4 h-4 text-gray-400" />
                                  <div>
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{test.name}</p>
                                    {test.priority === 'Urgent' && (
                                      <Badge variant="danger" className="text-xs mt-0.5">Urgent</Badge>
                                    )}
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  <Badge
                                    variant={
                                      status === 'Completed' ? 'success' :
                                      status === 'In Progress' ? 'warning' :
                                      'default'
                                    }
                                  >
                                    {status}
                                  </Badge>
                                  {status === 'Pending' && (
                                    <button
                                      onClick={() => startTest(test.id)}
                                      className="px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                    >
                                      Start Test
                                    </button>
                                  )}
                                  {status === 'In Progress' && (
                                    <span className="text-sm text-cyan-600 dark:text-cyan-400 italic">Processing…</span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
