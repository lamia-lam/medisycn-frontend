"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useRouter } from "next/navigation";

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

const patientsOptions = [
  {
    id: "P001",
    name: "John Doe",
    age: 45,
    gender: "Male",
    phone: "+1 (555) 123-4567",
  },
  {
    id: "P002",
    name: "Jane Smith",
    age: 32,
    gender: "Female",
    phone: "+1 (555) 234-5678",
  },
  {
    id: "P003",
    name: "Mike Johnson",
    age: 28,
    gender: "Male",
    phone: "+1 (555) 345-6789",
  },
  {
    id: "P004",
    name: "Sarah Williams",
    age: 55,
    gender: "Female",
    phone: "+1 (555) 456-7890",
  },
];

const medicinesOptions = [
  "Lisinopril 10mg",
  "Aspirin 81mg",
  "Metformin 500mg",
  "Amlodipine 5mg",
  "Atorvastatin 20mg",
  "Omeprazole 20mg",
  "Levothyroxine 50mcg",
  "Albuterol Inhaler",
  "Amoxicillin 500mg",
  "Ibuprofen 400mg",
];

interface Medicine {
  name: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  instructions: string;
}

const defaultMedicine = (): Medicine => ({
  name: "",
  dosage: "",
  frequency: "Once daily",
  timing: "Morning",
  duration: "7 days",
  instructions: "",
});

const inputClass =
  "w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400 appearance-none";

const labelClass =
  "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

export default function NewPrescriptionPage() {
  const router = useRouter();

  const [selectedPatient, setSelectedPatient] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [notes, setNotes] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([defaultMedicine()]);
  const [submitted, setSubmitted] = useState(false);

  const addMedicine = () => setMedicines([...medicines, defaultMedicine()]);

  const removeMedicine = (index: number) =>
    setMedicines(medicines.filter((_, i) => i !== index));

  const updateMedicine = (
    index: number,
    field: keyof Medicine,
    value: string,
  ) => {
    const updated = [...medicines];
    updated[index][field] = value;
    setMedicines(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => router.push("/doctor-dashboard/prescriptions"), 1500);
  };

  const selectedPatientData = patientsOptions.find(
    (p) => p.id === selectedPatient,
  );

  if (submitted) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
            Prescription Sent!
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Redirecting to prescriptions list…
          </p>
        </div>
      </DashboardLayout>
    );
  }

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

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* ── Patient Information ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="w-8 h-8 rounded-lg bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                <User className="w-4 h-4 text-cyan-600" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Patient Information
              </h3>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>Select Patient</label>
                  <select
                    value={selectedPatient}
                    onChange={(e) => setSelectedPatient(e.target.value)}
                    className={inputClass}
                    required
                  >
                    <option value="">Choose a patient…</option>
                    {patientsOptions.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id})
                      </option>
                    ))}
                  </select>
                </div>

                {selectedPatientData ? (
                  <div className="bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800 rounded-xl p-4">
                    <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-400 uppercase tracking-wide mb-2">
                      Patient Details
                    </p>
                    <p className="font-semibold text-gray-800 dark:text-white mb-0.5">
                      {selectedPatientData.name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedPatientData.age} years ·{" "}
                      {selectedPatientData.gender}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedPatientData.phone}
                    </p>
                    <p className="text-xs font-mono text-gray-400 mt-1">
                      {selectedPatientData.id}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-900/40 border border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-4 flex items-center justify-center">
                    <p className="text-sm text-gray-400 text-center">
                      Select a patient to see their details
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* ── Clinical Information ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center">
                <ClipboardList className="w-4 h-4 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Clinical Information
              </h3>
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
                <h3 className="font-semibold text-gray-800 dark:text-white">
                  Medications
                </h3>
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
                <div
                  key={index}
                  className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                >
                  {/* Medicine card header */}
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

                  {/* Medicine fields */}
                  <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {/* Medicine name full-width */}
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Medicine Name</label>
                      <select
                        value={medicine.name}
                        onChange={(e) =>
                          updateMedicine(index, "name", e.target.value)
                        }
                        className={inputClass}
                        required
                      >
                        <option value="">Select medicine…</option>
                        {medicinesOptions.map((med, i) => (
                          <option key={i} value={med}>
                            {med}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Dosage</label>
                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) =>
                          updateMedicine(index, "dosage", e.target.value)
                        }
                        placeholder="e.g., 1 tablet, 2 capsules"
                        className={inputClass}
                        required
                      />
                    </div>

                    <div>
                      <label className={labelClass}>Frequency</label>
                      <select
                        value={medicine.frequency}
                        onChange={(e) =>
                          updateMedicine(index, "frequency", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option>Once daily</option>
                        <option>Twice daily</option>
                        <option>Three times daily</option>
                        <option>Four times daily</option>
                        <option>Every 4 hours</option>
                        <option>Every 6 hours</option>
                        <option>As needed</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Timing</label>
                      <select
                        value={medicine.timing}
                        onChange={(e) =>
                          updateMedicine(index, "timing", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option>Morning</option>
                        <option>Afternoon</option>
                        <option>Evening</option>
                        <option>Night</option>
                        <option>Before meals</option>
                        <option>After meals</option>
                        <option>With meals</option>
                      </select>
                    </div>

                    <div>
                      <label className={labelClass}>Duration</label>
                      <select
                        value={medicine.duration}
                        onChange={(e) =>
                          updateMedicine(index, "duration", e.target.value)
                        }
                        className={inputClass}
                      >
                        <option>3 days</option>
                        <option>5 days</option>
                        <option>7 days</option>
                        <option>10 days</option>
                        <option>14 days</option>
                        <option>21 days</option>
                        <option>30 days</option>
                        <option>60 days</option>
                        <option>90 days</option>
                      </select>
                    </div>

                    {/* Instructions full-width */}
                    <div className="lg:col-span-2">
                      <label className={labelClass}>Special Instructions</label>
                      <input
                        type="text"
                        value={medicine.instructions}
                        onChange={(e) =>
                          updateMedicine(index, "instructions", e.target.value)
                        }
                        placeholder="e.g., Take with food, Avoid alcohol"
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Additional Information ── */}
          <section className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                <FileText className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-800 dark:text-white">
                Additional Information
              </h3>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className={labelClass}>Doctor's Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional instructions, diet recommendations, lifestyle advice…"
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </div>
              <div className="max-w-xs">
                <label className={labelClass}>Follow-up Date</label>
                <input
                  type="date"
                  value={followUpDate}
                  onChange={(e) => setFollowUpDate(e.target.value)}
                  className={inputClass}
                />
              </div>
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
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
              Send to Pharmacy
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
