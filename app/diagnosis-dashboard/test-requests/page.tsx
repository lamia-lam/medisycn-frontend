"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";
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
  Loader2,
  Stethoscope,
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

type TestStatus = "Pending" | "In Progress" | "Completed";

interface Test {
  id: string;      // frontend composite id: "${rxId}-${index}"
  name: string;
  status: TestStatus;
  priority: string;
  dbId: number;        // prescription ID
  testIndex: number;   // index in the tests JSON array
}

interface Prescription {
  id: string;
  doctor: string;
  department?: string;
  date: string;
  tests: Test[];
}

interface Patient {
  id: string;
  patientDbId: number;  // actual DB integer patient.id
  name: string;
  phone: string;
  age: number;
  gender: string;
  bloodGroup: string;
  prescriptions: Prescription[];
}

// Mock data removed

export default function TestRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedPatient, setExpandedPatient] = useState<string | null>(null);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>(
    {},
  );
  const [startingTests, setStartingTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.trim() === "") {
        setSearchResults([]);
        setSearched(false);
        return;
      }

      if (searchQuery.length > 5) {
        setIsLoading(true);
        try {
          const res = await fetch(
            `/api/diagnostic/test-requests?phone=${encodeURIComponent(searchQuery)}`,
          );
          if (res.ok) {
            const data = await res.json();
            setSearchResults(data);
            setSearched(true);
            if (data.length === 1) setExpandedPatient(data[0].id);
          } else {
            setSearchResults([]);
            setSearched(true);
          }
        } catch (err) {
          console.error(err);
          setSearchResults([]);
          setSearched(true);
        } finally {
          setIsLoading(false);
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getTestStatus = (
    testId: string,
    defaultStatus: TestStatus,
  ): TestStatus => testStatuses[testId] ?? defaultStatus;

  const startTest = async (
    testId: string,
    prescriptionDbId: number,
    testIndex: number,
    patientDbId: number,
    testName: string,
  ) => {
    setStartingTests((prev) => new Set(prev).add(testId));
    try {
      const res = await fetch("/api/diagnostic/test-requests/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prescriptionId: prescriptionDbId,
          testIndex,
          testName,
          patientId: patientDbId,
        }),
      });
      if (res.ok) {
        setTestStatuses((prev) => ({ ...prev, [testId]: "In Progress" }));
      } else {
        const errData = await res.json();
        alert(errData.error || "Failed to start test");
      }
    } catch (err) {
      console.error(err);
      alert("Network error — could not start test");
    } finally {
      setStartingTests((prev) => {
        const next = new Set(prev);
        next.delete(testId);
        return next;
      });
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Diagnostic">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold mb-1 text-gray-800 dark:text-white">
            Test Requests
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Search for a patient to view their prescription test orders
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search patient by phone number..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-12 py-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900/50 focus:outline-none focus:ring-2 focus:ring-cyan-500 text-gray-800 dark:text-gray-100 text-lg transition-all"
            />
            {isLoading && (
              <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-cyan-500 animate-spin" />
            )}
          </div>

          {searched && !isLoading && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found {searchResults.length} patient(s)
            </p>
          )}

          {!searched && (
            <div className="text-center py-16">
              <Microscope className="w-14 h-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                Search for a patient to see their test requests
              </p>
            </div>
          )}

          {searched && !isLoading && searchResults.length === 0 && (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                No patients found
              </p>
            </div>
          )}

          <div className="space-y-4">
            {(() => {
              // Flatten searchResults into doctorCards
              const doctorCards: {
                patient: (typeof searchResults)[0];
                doctorName: string;
                department?: string;
                prescriptions: (typeof searchResults)[0]["prescriptions"];
                cardId: string;
              }[] = [];

              searchResults.forEach((patient) => {
                // Group prescriptions by doctor
                const doctorGroups = patient.prescriptions.reduce(
                  (acc, rx) => {
                    if (!acc[rx.doctor]) acc[rx.doctor] = [];
                    acc[rx.doctor].push(rx);
                    return acc;
                  },
                  {} as Record<string, typeof patient.prescriptions>,
                );

                Object.entries(doctorGroups).forEach(
                  ([doctorName, prescriptions]) => {
                    doctorCards.push({
                      patient,
                      doctorName,
                      department: prescriptions[0].department,
                      prescriptions,
                      cardId: `${patient.id}-${doctorName}`,
                    });
                  },
                );
              });

              return doctorCards.map((card) => (
                <div
                  key={card.cardId}
                  className="bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
                >
                  <button
                    className="w-full p-5 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors"
                    onClick={() =>
                      setExpandedPatient(
                        expandedPatient === card.cardId ? null : card.cardId,
                      )
                    }
                  >
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 items-center">
                      <div className="flex items-center gap-4 pr-4">
                        <div className="w-12 h-12 rounded-full bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 flex items-center justify-center shrink-0">
                          <User className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-800 dark:text-white">
                            {card.patient.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Phone className="w-3.5 h-3.5" />
                              {card.patient.phone}
                            </span>
                            <span>
                              {card.patient.age} yrs, {card.patient.gender}
                            </span>
                            <Badge variant="outline">
                              {card.patient.bloodGroup}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:flex items-center justify-start pl-8 border-l border-gray-200 dark:border-gray-700 h-full">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                            <Stethoscope className="w-5 h-5" />
                          </div>
                          <div className="text-left">
                            <p className="font-bold text-gray-800 dark:text-white">
                              {card.doctorName}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {card.department || "General"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 ml-6">
                      <span className="text-sm text-gray-500 dark:text-gray-400 hidden sm:inline-block">
                        {card.prescriptions.reduce(
                          (acc, p) => acc + p.tests.length,
                          0,
                        )}{" "}
                        tests
                      </span>
                      {expandedPatient === card.cardId ? (
                        <ChevronUp className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </button>

                  {expandedPatient === card.cardId && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-5 space-y-6 bg-white dark:bg-gray-900/50">
                      {card.prescriptions.map((prescription) => (
                        <div key={prescription.id}>
                          <div className="flex flex-wrap items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-cyan-500" />
                            <span className="font-medium text-gray-700 dark:text-gray-200">
                              {prescription.date}
                            </span>
                            <span className="text-sm text-gray-400 dark:text-gray-500">
                              — Ref: {prescription.id}
                            </span>
                          </div>

                          <div className="space-y-3 pl-2">
                            {prescription.tests.map((test) => {
                              const status = getTestStatus(
                                test.id,
                                test.status,
                              );
                              return (
                                <div
                                  key={test.id}
                                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-800/80 rounded-lg border border-gray-100 dark:border-gray-700"
                                >
                                  <div className="flex items-center gap-3">
                                    <FlaskConical className="w-4 h-4 text-gray-400 shrink-0" />
                                    <div>
                                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100">
                                        {test.name}
                                      </p>
                                      {test.priority === "Urgent" && (
                                        <Badge
                                          variant="danger"
                                          className="text-xs mt-0.5"
                                        >
                                          Urgent
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                   <div className="flex items-center gap-3 shrink-0">
                                    <Badge
                                      variant={
                                        status === "Completed"
                                          ? "success"
                                          : status === "In Progress"
                                            ? "warning"
                                            : "default"
                                      }
                                    >
                                      {status}
                                    </Badge>
                                    {status === "Pending" && (
                                      <button
                                        onClick={() =>
                                          startTest(
                                            test.id,
                                            test.dbId,
                                            test.testIndex,
                                            card.patient.patientDbId,
                                            test.name,
                                          )
                                        }
                                        disabled={startingTests.has(test.id)}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                                      >
                                        {startingTests.has(test.id) ? (
                                          <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Starting…</>
                                        ) : (
                                          "Start Test"
                                        )}
                                      </button>
                                    )}
                                    {status === "In Progress" && (
                                      <a
                                        href="/diagnosis-dashboard/upload"
                                        className="text-sm text-cyan-600 dark:text-cyan-400 italic hover:underline"
                                      >
                                        → Upload Report
                                      </a>
                                    )}
                                    {status === "Completed" && (
                                      <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                                        ✓ Report Uploaded
                                      </span>
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
              ));
            })()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
