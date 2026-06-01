"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../../components/DashboardLayout";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  ArrowLeft,
  Plus,
  X,
  Save,
  Send,
  User,
  Pill,
  ClipboardList,
  CheckCircle2,
  Microscope,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

// ── Sidebar ───────────────────────────────────────────────────────────────────
const sidebarItems = [
  { icon: <Activity className="w-5 h-5" />, label: "Dashboard",     href: "/doctor-dashboard" },
  { icon: <Users    className="w-5 h-5" />, label: "Patients",      href: "/doctor-dashboard/patients" },
  { icon: <FileText className="w-5 h-5" />, label: "Prescriptions", href: "/doctor-dashboard/prescriptions" },
  { icon: <Calendar className="w-5 h-5" />, label: "Appointments",  href: "/doctor-dashboard/appointments" },
];

// ── Medicine options (extend as needed) ───────────────────────────────────────
const medicinesOptions = [
  "Lisinopril 10mg", "Aspirin 81mg", "Metformin 500mg", "Amlodipine 5mg",
  "Atorvastatin 20mg", "Omeprazole 20mg", "Levothyroxine 50mcg",
  "Albuterol Inhaler", "Amoxicillin 500mg", "Ibuprofen 400mg",
];

// ── Types ─────────────────────────────────────────────────────────────────────
interface PatientOption {
  id: number;           // Patient.id (DB primary key)
  name: string;
  age: number | null;
  gender: string | null;
  phone: string | null;
}

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  durationDays: number | "";
  instructions: string;
}

interface DiagnosticTest {
  name: string;
  urgency: string;
  instructions: string;
}

const defaultMedicine = (): Medicine => ({
  name: "", dosage: "", frequency: "",
  durationDays: "", instructions: "",
});

const defaultTest = (): DiagnosticTest => ({
  name: "", urgency: "Routine", instructions: "",
});

// ── Shared class strings ──────────────────────────────────────────────────────
const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400 appearance-none";
const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

// ─────────────────────────────────────────────────────────────────────────────
export default function NewPrescriptionPage() {
  const router = useRouter();

  // ── Patient list (fetched from API) ─────────────────────────────────────────
  const [patients, setPatients]         = useState<PatientOption[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError]     = useState("");

  // ── Form state ───────────────────────────────────────────────────────────────
  const [selectedPatientId, setSelectedPatientId] = useState<number | string>("");
  const [nameSearch, setNameSearch] = useState("");
  const [showNameDropdown, setShowNameDropdown] = useState(false);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [showPhoneDropdown, setShowPhoneDropdown] = useState(false);
  const [diagnosis,  setDiagnosis]  = useState("");
  const [symptoms,   setSymptoms]   = useState("");
  const [notes,      setNotes]      = useState("");
  const [medicines,  setMedicines]  = useState<Medicine[]>([defaultMedicine()]);
  const [tests,      setTests]      = useState<DiagnosticTest[]>([]);

  // ── Quick Register Modal State ───────────────────────────────────────────────
  const [showQuickRegisterModal, setShowQuickRegisterModal] = useState(false);
  const [qrName, setQrName] = useState("");
  const [qrPhone, setQrPhone] = useState("");
  const [qrAge, setQrAge] = useState("");
  const [qrGender, setQrGender] = useState("");
  const [qrLoading, setQrLoading] = useState(false);
  const [qrError, setQrError] = useState("");

  const handleQuickRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setQrLoading(true);
    setQrError("");
    try {
      const res = await fetch("/api/doctor/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: qrName,
          phone: qrPhone,
          age: qrAge,
          gender: qrGender,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to register patient");
      }
      const newPatient = await res.json();
      const mappedPatient: PatientOption = {
        id: newPatient.id,
        name: newPatient.user.name,
        phone: newPatient.user.phone,
        age: newPatient.age,
        gender: newPatient.gender,
      };
      setPatients((prev) => [...prev, mappedPatient]);
      setSelectedPatientId(mappedPatient.id);
      setNameSearch(mappedPatient.name);
      setPhoneSearch(mappedPatient.phone || "");
      setShowQuickRegisterModal(false);
    } catch (err: any) {
      setQrError(err.message || "An error occurred");
    } finally {
      setQrLoading(false);
    }
  };

  // ── Submit state ─────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted]   = useState(false);

  // ── Load patients belonging to this doctor ───────────────────────────────────
  useEffect(() => {
    async function fetchPatients() {
      try {
        const res = await fetch("/api/doctor/patients");
        if (!res.ok) throw new Error("Failed to load patients");
        const data = await res.json();
        // data: [{ id, user: { name, phone }, age, gender, ... }]
        const mapped: PatientOption[] = data.map((p: {
          id: number;
          user: { name: string; phone?: string | null };
          age?: number | null;
          gender?: string | null;
        }) => ({
          id: p.id,
          name: p.user.name,
          age: p.age ?? null,
          gender: p.gender ?? null,
          phone: p.user.phone ?? null,
        }));
        setPatients(mapped);
      } catch {
        setPatientsError("Could not load patient list.");
      } finally {
        setPatientsLoading(false);
      }
    }
    fetchPatients();
  }, []);

  // Close patient search dropdowns when clicking outside
  useEffect(() => {
    const handleOutsideClick = () => {
      setShowNameDropdown(false);
      setShowPhoneDropdown(false);
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // ── Medicine helpers ─────────────────────────────────────────────────────────
  const addMedicine    = () => setMedicines([...medicines, defaultMedicine()]);
  const removeMedicine = (i: number) => setMedicines(medicines.filter((_, idx) => idx !== i));
  const updateMedicine = (i: number, field: keyof Medicine, value: string | number) => {
    const updated = [...medicines];
    updated[i] = { ...updated[i], [field]: value };
    setMedicines(updated);
  };

  // ── Test helpers ─────────────────────────────────────────────────────────────
  const addTest    = () => setTests([...tests, defaultTest()]);
  const removeTest = (i: number) => setTests(tests.filter((_, idx) => idx !== i));
  const updateTest = (i: number, field: keyof DiagnosticTest, value: string | number) => {
    const updated = [...tests];
    updated[i] = { ...updated[i], [field]: value };
    setTests(updated);
  };

  // ── Submit handler ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId) return;

    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/doctor/prescription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          diagnosis,
          symptoms,
          medicines,
          tests: tests.length > 0 ? tests : null,
          notes: notes || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Failed to save prescription");
      }

      setSubmitted(true);
      setTimeout(() => router.push("/doctor-dashboard/prescriptions"), 1600);
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedPatient = patients.find((p) => p.id === selectedPatientId);

  // ── Success screen ───────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Prescription Saved!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Redirecting to prescriptions list…
          </p>
        </div>
      </DashboardLayout>
    );
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6 max-w-4xl">

        {/* Header */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => router.push("/doctor-dashboard/prescriptions")}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-0.5">
              Create New Prescription
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Fill in the prescription details below
            </p>
          </div>
        </div>

        {/* Global submit error */}
        {submitError && (
          <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {submitError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Patient Information ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 rounded-t-xl">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                <User className="w-4 h-4 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Patient Information</h3>
            </div>

            <div className="p-6">
              {patientsError ? (
                <div className="flex items-center gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {patientsError}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4" onClick={(e) => e.stopPropagation()}>
                    {/* Patient Name Search */}
                    <div className="relative">
                      <label className={labelClass}>Patient Name</label>
                      {patientsLoading ? (
                        <div className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm text-gray-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Loading patients…
                        </div>
                      ) : (
                        <>
                          <input
                            type="text"
                            value={nameSearch}
                            onChange={(e) => {
                              const val = e.target.value;
                              setNameSearch(val);
                              setShowNameDropdown(true);
                              setSelectedPatientId("");
                              setPhoneSearch("");
                            }}
                            onFocus={() => setShowNameDropdown(true)}
                            placeholder="Search or type patient name..."
                            className={inputClass}
                            required
                          />
                          {showNameDropdown && nameSearch && (
                            <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                              {Array.from(new Set(patients
                                .filter(p => p.name.toLowerCase().includes(nameSearch.toLowerCase()))
                                .map(p => p.name)
                              )).length === 0 ? (
                                <div className="px-4 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                                  No matching patient name
                                </div>
                              ) : (
                                Array.from(new Set(patients
                                  .filter(p => p.name.toLowerCase().includes(nameSearch.toLowerCase()))
                                  .map(p => p.name)
                                )).map((uniqueName) => (
                                  <button
                                    key={uniqueName}
                                    type="button"
                                    onClick={() => {
                                      setNameSearch(uniqueName);
                                      setShowNameDropdown(false);
                                      // If only 1 patient has this name, automatically fill ID & phone
                                      const matches = patients.filter(p => p.name === uniqueName);
                                      if (matches.length === 1) {
                                        setPhoneSearch(matches[0].phone || "");
                                        setSelectedPatientId(matches[0].id);
                                      } else {
                                        setPhoneSearch("");
                                        setSelectedPatientId("");
                                      }
                                    }}
                                    className="w-full text-left px-4 py-2.5 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-sm text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                  >
                                    {uniqueName}
                                  </button>
                                ))
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Patient Phone Search */}
                    <div className="relative">
                      <label className={labelClass}>Patient Phone Number</label>
                      <input
                        type="text"
                        value={phoneSearch}
                        disabled={!nameSearch}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPhoneSearch(val);
                          setShowPhoneDropdown(true);
                          const match = patients.find(
                            (p) => p.name === nameSearch && p.phone === val
                          );
                          if (match) setSelectedPatientId(match.id);
                          else setSelectedPatientId("");
                        }}
                        onFocus={() => setShowPhoneDropdown(true)}
                        placeholder={nameSearch ? "Select or type phone number..." : "Enter patient name first..."}
                        className={`${inputClass} ${!nameSearch ? "bg-gray-100 dark:bg-gray-800/80 cursor-not-allowed" : ""}`}
                        required
                      />
                      {showPhoneDropdown && phoneSearch && nameSearch && (
                        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {patients.filter(p => p.name === nameSearch && p.phone?.toLowerCase().includes(phoneSearch.toLowerCase())).length === 0 ? (
                            <div className="px-4 py-3 text-sm flex flex-col gap-3">
                              <span className="text-gray-500 dark:text-gray-400">No phone matches for this name</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setQrName(nameSearch);
                                  setQrPhone(phoneSearch);
                                  setQrAge("");
                                  setQrGender("");
                                  setQrError("");
                                  setShowQuickRegisterModal(true);
                                  setShowPhoneDropdown(false);
                                  setShowNameDropdown(false);
                                }}
                                className="w-full text-center px-4 py-2 bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300 rounded-lg text-sm font-medium hover:bg-cyan-200 dark:hover:bg-cyan-900/60 transition-colors"
                              >
                                Quick Register Patient
                              </button>
                            </div>
                          ) : (
                            patients
                              .filter(p => p.name === nameSearch && p.phone?.toLowerCase().includes(phoneSearch.toLowerCase()))
                              .map((p) => (
                                <button
                                  key={p.id}
                                  type="button"
                                  onClick={() => {
                                    setSelectedPatientId(p.id);
                                    setPhoneSearch(p.phone || "");
                                    setShowPhoneDropdown(false);
                                  }}
                                  className="w-full text-left px-4 py-2.5 hover:bg-cyan-50 dark:hover:bg-cyan-900/30 text-sm text-gray-800 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700 last:border-0"
                                >
                                  {p.phone}
                                </button>
                              ))
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedPatient ? (
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-5 flex flex-col justify-center">
                      <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-2">
                        Patient Details
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-white mb-1.5 text-lg">
                        {selectedPatient.name}
                      </p>
                      {selectedPatient.age && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <strong>Age:</strong> {selectedPatient.age} years
                        </p>
                      )}
                      {selectedPatient.gender && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          <strong>Gender:</strong> {selectedPatient.gender}
                        </p>
                      )}
                      {selectedPatient.phone && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Phone:</strong> {selectedPatient.phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 flex items-center justify-center">
                      <p className="text-sm text-gray-400 text-center">
                        Select patient name and select their phone number to see full details
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>

          {/* ── Clinical Information ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Clinical Information</h3>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Diagnosis</label>
                <input
                  type="text"
                  value={diagnosis}
                  onChange={(e) => setDiagnosis(e.target.value)}
                  placeholder="Enter primary diagnosis"
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Presenting Symptoms</label>
                <textarea
                  value={symptoms}
                  onChange={(e) => setSymptoms(e.target.value)}
                  placeholder="Describe patient symptoms…"
                  rows={3}
                  className={`${inputClass} resize-none`}
                  required
                />
              </div>
            </div>
          </section>

          {/* ── Medications ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
                  <Pill className="w-4 h-4 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-800 dark:text-white">Medications</h3>
              </div>
              <button
                type="button"
                onClick={addMedicine}
                className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800 rounded-lg text-sm font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Medicine
              </button>
            </div>

            <div className="p-6 space-y-4">
              {medicines.map((medicine, index) => (
                <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Medicine {index + 1}
                    </span>
                    {medicines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Medicine Name</label>
                      <select
                        value={medicine.name}
                        onChange={(e) => updateMedicine(index, "name", e.target.value)}
                        className={inputClass}
                        required
                      >
                        <option value="">Select medicine…</option>
                        {medicinesOptions.map((med, i) => (
                          <option key={i} value={med}>{med}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={labelClass}>Dosage</label>
                      <input type="text" value={medicine.dosage}
                        onChange={(e) => updateMedicine(index, "dosage", e.target.value)}
                        placeholder="e.g., 1 tablet, 2 capsules"
                        className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Frequency</label>
                      <input type="text" value={medicine.frequency}
                        onChange={(e) => updateMedicine(index, "frequency", e.target.value)}
                        placeholder="e.g., 1+0+1"
                        className={inputClass} required />
                    </div>
                    <div>
                      <label className={labelClass}>Duration (Days)</label>
                      <input type="number" value={medicine.durationDays}
                        onChange={(e) => updateMedicine(index, "durationDays", e.target.value ? Number(e.target.value) : "")}
                        placeholder="e.g., 3"
                        className={inputClass} required />
                    </div>
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Special Instructions</label>
                      <input type="text" value={medicine.instructions}
                        onChange={(e) => updateMedicine(index, "instructions", e.target.value)}
                        placeholder="e.g., Take with food, Avoid alcohol"
                        className={inputClass} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Diagnostic Tests ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                  <Microscope className="w-4 h-4 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-white">Diagnostic Tests</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Lab / imaging tests ordered for this prescription</p>
                </div>
              </div>
              <button
                type="button"
                onClick={addTest}
                className="inline-flex items-center gap-2 px-4 py-2 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Test
              </button>
            </div>

            <div className="p-6">
              {tests.length === 0 ? (
                <div className="border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center mx-auto mb-3">
                    <Microscope className="w-6 h-6 text-orange-400" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">No diagnostic tests added yet.</p>
                  <p className="text-xs text-gray-400 mt-1">Click &quot;Add Test&quot; to order lab or imaging tests.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {tests.map((test, index) => (
                    <div key={index} className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-5 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                        <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                          Test {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeTest(index)}
                          className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="lg:col-span-1">
                          <label className={labelClass}>Test Name</label>
                          <input
                            type="text"
                            value={test.name}
                            onChange={(e) => updateTest(index, "name", e.target.value)}
                            placeholder="e.g., Complete Blood Count, Chest X-Ray, ECG"
                            className={inputClass}
                            required
                          />
                        </div>
                        <div>
                          <label className={labelClass}>Urgency</label>
                          <select value={test.urgency}
                            onChange={(e) => updateTest(index, "urgency", e.target.value)}
                            className={inputClass}>
                            <option>Routine</option>
                            <option>Urgent</option>
                            <option>STAT (Immediate)</option>
                          </select>
                        </div>
                        <div className="lg:col-span-2">
                          <label className={labelClass}>Special Instructions</label>
                          <input type="text" value={test.instructions}
                            onChange={(e) => updateTest(index, "instructions", e.target.value)}
                            placeholder="e.g., Fasting required, collect morning sample"
                            className={inputClass} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* ── Additional Information ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">Additional Information</h3>
            </div>
            <div className="p-6">
              <label className={labelClass}>Doctor&apos;s Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional instructions, diet recommendations, lifestyle advice…"
                rows={4}
                className={`${inputClass} resize-none`}
              />
            </div>
          </section>

          {/* ── Form Actions ── */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pb-4">
            <button
              type="button"
              onClick={() => router.push("/doctor-dashboard/prescriptions")}
              className="w-full sm:w-auto px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <Save className="w-4 h-4" />
              Save Draft
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              {submitting ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Saving…</>
              ) : (
                <><Send className="w-4 h-4" /> Send Prescription</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* ── Quick Register Modal ── */}
      {showQuickRegisterModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800 dark:text-white">Quick Register Patient</h3>
              <button type="button" onClick={() => setShowQuickRegisterModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleQuickRegister} className="p-6 space-y-4">
              {qrError && (
                <div className="px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
                  {qrError}
                </div>
              )}
              <div>
                <label className={labelClass}>Patient Name</label>
                <input type="text" value={qrName} onChange={(e) => setQrName(e.target.value)} className={inputClass} required />
              </div>
              <div>
                <label className={labelClass}>Phone Number</label>
                <input type="text" value={qrPhone} onChange={(e) => setQrPhone(e.target.value)} className={inputClass} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Age</label>
                  <input type="number" value={qrAge} onChange={(e) => setQrAge(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Gender</label>
                  <select value={qrGender} onChange={(e) => setQrGender(e.target.value)} className={inputClass}>
                    <option value="">Select...</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowQuickRegisterModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600">
                  Cancel
                </button>
                <button type="submit" disabled={qrLoading} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-cyan-600 rounded-lg hover:bg-cyan-700 disabled:opacity-50 transition-colors">
                  {qrLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {qrLoading ? "Saving..." : "Save Patient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
