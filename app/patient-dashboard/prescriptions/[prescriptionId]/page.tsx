"use client";

import { useState } from "react";
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
  CheckCircle2,
  AlertCircle,
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

type Medicine = {
  name: string;
  strength: string;
  dosage: string;
  frequency: string;
  timing: string;
  duration: string;
  instructions: string;
};

type PrescriptionRecord = {
  id: string;
  date: string;
  patient: {
    name: string;
    id: string;
    age: number;
    gender: string;
    phone: string;
    address: string;
  };
  doctor: {
    name: string;
    specialization: string;
    license: string;
    phone: string;
  };
  hospital: {
    name: string;
    address: string;
    phone: string;
    website: string;
  };
  diagnosis: string;
  symptoms: string;
  medicines: Medicine[];
  notes: string;
  followUp: string;
};

const prescriptionRecords: Record<string, PrescriptionRecord> = {
  "RX-2345": {
    id: "RX-2345",
    date: "2026-04-25",
    patient: {
      name: "John Doe",
      id: "P0042",
      age: 34,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Springfield, IL 62701",
    },
    doctor: {
      name: "Dr. Sarah Smith",
      specialization: "Internal Medicine",
      license: "MD-12345",
      phone: "+1 (555) 987-6543",
    },
    hospital: {
      name: "MediSync Health Center",
      address: "456 Healthcare Ave, Springfield, IL 62702",
      phone: "+1 (555) 111-2222",
      website: "www.medisync.health",
    },
    diagnosis: "Essential Hypertension",
    symptoms: "Elevated blood pressure (150/95 mmHg), occasional headaches, fatigue, dizziness upon standing",
    medicines: [
      {
        name: "Lisinopril",
        strength: "10mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Morning",
        duration: "30 days",
        instructions: "Take on an empty stomach. Avoid potassium supplements.",
      },
      {
        name: "Aspirin",
        strength: "81mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Night",
        duration: "30 days",
        instructions: "Take after dinner. Do not take on empty stomach.",
      },
      {
        name: "Amlodipine",
        strength: "5mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Evening",
        duration: "30 days",
        instructions: "Can be taken with or without food.",
      },
    ],
    notes:
      "Monitor blood pressure daily and maintain a log. Follow low-sodium diet. Regular exercise (30 min walk) recommended. Avoid alcohol and smoking. Report any swelling of ankles or persistent dizziness.",
    followUp: "2026-05-09",
  },
  "RX-2310": {
    id: "RX-2310",
    date: "2026-03-15",
    patient: {
      name: "John Doe",
      id: "P0042",
      age: 34,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Springfield, IL 62701",
    },
    doctor: {
      name: "Dr. Michael Brown",
      specialization: "Cardiology",
      license: "MD-67890",
      phone: "+1 (555) 555-7890",
    },
    hospital: {
      name: "MediSync Health Center",
      address: "456 Healthcare Ave, Springfield, IL 62702",
      phone: "+1 (555) 111-2222",
      website: "www.medisync.health",
    },
    diagnosis: "Atrial Fibrillation",
    symptoms: "Irregular heartbeat, palpitations, shortness of breath on exertion, occasional chest discomfort",
    medicines: [
      {
        name: "Warfarin",
        strength: "5mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Evening",
        duration: "90 days",
        instructions: "Take at the same time each day. Regular INR monitoring required.",
      },
      {
        name: "Metoprolol",
        strength: "25mg",
        dosage: "1 tablet",
        frequency: "Twice daily",
        timing: "Morning & Evening",
        duration: "90 days",
        instructions: "Take with food. Do not stop abruptly.",
      },
    ],
    notes:
      "Maintain consistent vitamin K intake. Avoid NSAIDs and aspirin unless directed. Report any unusual bruising or bleeding. Wear a medical alert bracelet.",
    followUp: "2026-04-15",
  },
  "RX-2278": {
    id: "RX-2278",
    date: "2026-02-28",
    patient: {
      name: "John Doe",
      id: "P0042",
      age: 34,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Springfield, IL 62701",
    },
    doctor: {
      name: "Dr. Emily Davis",
      specialization: "General Medicine",
      license: "MD-11223",
      phone: "+1 (555) 444-5566",
    },
    hospital: {
      name: "MediSync Health Center",
      address: "456 Healthcare Ave, Springfield, IL 62702",
      phone: "+1 (555) 111-2222",
      website: "www.medisync.health",
    },
    diagnosis: "Type 2 Diabetes Mellitus",
    symptoms: "Increased thirst, frequent urination, fatigue, blurred vision, HbA1c 7.8%",
    medicines: [
      {
        name: "Metformin",
        strength: "500mg",
        dosage: "1 tablet",
        frequency: "Twice daily",
        timing: "Morning & Evening",
        duration: "60 days",
        instructions: "Take with meals to reduce GI upset.",
      },
      {
        name: "Glipizide",
        strength: "5mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Morning (30 min before breakfast)",
        duration: "60 days",
        instructions: "Take 30 minutes before breakfast. Watch for signs of hypoglycemia.",
      },
    ],
    notes:
      "Monitor fasting blood sugar daily. Follow diabetic diet plan. Exercise 30 min daily. Keep glucose tablets on hand for hypoglycemia. HbA1c retest in 3 months.",
    followUp: "2026-04-28",
  },
  "RX-2245": {
    id: "RX-2245",
    date: "2026-02-10",
    patient: {
      name: "John Doe",
      id: "P0042",
      age: 34,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Springfield, IL 62701",
    },
    doctor: {
      name: "Dr. Robert Johnson",
      specialization: "Orthopedics",
      license: "MD-33445",
      phone: "+1 (555) 666-7788",
    },
    hospital: {
      name: "MediSync Health Center",
      address: "456 Healthcare Ave, Springfield, IL 62702",
      phone: "+1 (555) 111-2222",
      website: "www.medisync.health",
    },
    diagnosis: "Osteoarthritis – Right Knee",
    symptoms: "Knee pain worsening with activity, morning stiffness lasting 20-30 minutes, swelling, reduced range of motion",
    medicines: [
      {
        name: "Diclofenac",
        strength: "50mg",
        dosage: "1 tablet",
        frequency: "Twice daily",
        timing: "Morning & Evening",
        duration: "14 days",
        instructions: "Take with food. Do not exceed 14 days without review.",
      },
      {
        name: "Calcium + Vitamin D3",
        strength: "500mg/250IU",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "After lunch",
        duration: "90 days",
        instructions: "Take after a meal for better absorption.",
      },
    ],
    notes:
      "Apply ice pack for 15 min twice daily. Gentle range-of-motion exercises recommended. Avoid high-impact activities. Physiotherapy referral provided. X-ray follow-up in 6 weeks.",
    followUp: "2026-03-24",
  },
  "RX-2198": {
    id: "RX-2198",
    date: "2026-01-15",
    patient: {
      name: "John Doe",
      id: "P0042",
      age: 34,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Springfield, IL 62701",
    },
    doctor: {
      name: "Dr. Sarah Smith",
      specialization: "Internal Medicine",
      license: "MD-12345",
      phone: "+1 (555) 987-6543",
    },
    hospital: {
      name: "MediSync Health Center",
      address: "456 Healthcare Ave, Springfield, IL 62702",
      phone: "+1 (555) 111-2222",
      website: "www.medisync.health",
    },
    diagnosis: "Iron-Deficiency Anemia",
    symptoms: "Fatigue, pallor, shortness of breath on exertion, brittle nails, Hemoglobin 9.8 g/dL",
    medicines: [
      {
        name: "Ferrous Sulfate",
        strength: "325mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Morning (empty stomach)",
        duration: "90 days",
        instructions: "Take on empty stomach with vitamin C (orange juice). Avoid tea/coffee for 2 hours.",
      },
      {
        name: "Folic Acid",
        strength: "5mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Morning",
        duration: "90 days",
        instructions: "Can be taken with or without food.",
      },
    ],
    notes:
      "Include iron-rich foods (spinach, lentils, red meat) in diet. Repeat CBC in 6 weeks to monitor hemoglobin levels. Stool may appear dark — this is normal with iron supplementation.",
    followUp: "2026-02-26",
  },
  "RX-2156": {
    id: "RX-2156",
    date: "2025-12-20",
    patient: {
      name: "John Doe",
      id: "P0042",
      age: 34,
      gender: "Male",
      phone: "+1 (555) 123-4567",
      address: "123 Main Street, Springfield, IL 62701",
    },
    doctor: {
      name: "Dr. David Lee",
      specialization: "Dermatology",
      license: "MD-55667",
      phone: "+1 (555) 888-9900",
    },
    hospital: {
      name: "MediSync Health Center",
      address: "456 Healthcare Ave, Springfield, IL 62702",
      phone: "+1 (555) 111-2222",
      website: "www.medisync.health",
    },
    diagnosis: "Chronic Urticaria",
    symptoms: "Recurring hives for 6+ weeks, intense itching, wheals on trunk and limbs, worsening in evening",
    medicines: [
      {
        name: "Cetirizine",
        strength: "10mg",
        dosage: "1 tablet",
        frequency: "Once daily",
        timing: "Night",
        duration: "30 days",
        instructions: "Take at bedtime. May cause drowsiness.",
      },
      {
        name: "Hydroxyzine",
        strength: "25mg",
        dosage: "1 tablet",
        frequency: "As needed",
        timing: "For acute flare-ups",
        duration: "30 days",
        instructions: "Take during severe episodes. Do not drive after taking. Maximum 3 tablets per day.",
      },
    ],
    notes:
      "Avoid known triggers (hot showers, tight clothing, stress). Keep a symptom diary. Calamine lotion may be applied for local relief. If symptoms persist or worsen, allergy testing will be scheduled.",
    followUp: "2026-01-20",
  },
};

export default function PatientPrescriptionViewer() {
  const router = useRouter();
  const params = useParams();
  const [zoom, setZoom] = useState(100);

  const prescriptionId = params.prescriptionId as string;
  const rx = prescriptionRecords[prescriptionId];

  if (!rx) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Patient">
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            Prescription not found
          </p>
          <p className="text-sm text-gray-400">
            The prescription "{prescriptionId}" could not be located.
          </p>
          <button
            onClick={() => router.push("/patient-dashboard/prescriptions")}
            className="mt-2 text-cyan-600 hover:underline text-sm font-medium"
          >
            ← Back to Prescriptions
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
              onClick={() => router.push("/patient-dashboard/prescriptions")}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white leading-tight">
                Prescription Viewer
              </h2>
              <p className="text-sm text-gray-400 font-mono">{rx.id}</p>
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
                <div className="text-center mb-8 pb-6 border-b-2 border-cyan-600">
                  <div className="inline-flex items-center justify-center w-14 h-14 bg-cyan-600 rounded-xl mb-3">
                    <span className="text-xl font-bold text-white">MS</span>
                  </div>
                  <h1 className="text-2xl font-bold text-cyan-600 mb-1">
                    {rx.hospital.name}
                  </h1>
                  <p className="text-sm text-gray-500">{rx.hospital.address}</p>
                  <p className="text-sm text-gray-500">
                    Phone: {rx.hospital.phone} &nbsp;|&nbsp; {rx.hospital.website}
                  </p>
                </div>

                {/* Document Title */}
                <div className="text-center mb-8">
                  <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">
                    Medical Prescription
                  </p>
                  <h2 className="text-xl font-bold text-gray-800">{rx.diagnosis}</h2>
                  <p className="text-sm text-gray-400 font-mono mt-1">{rx.id}</p>
                </div>

                {/* Doctor & Patient Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-7">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Prescribing Doctor
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-gray-800">{rx.doctor.name}</p>
                      <p className="text-sm text-cyan-600">{rx.doctor.specialization}</p>
                      <p className="text-sm text-gray-500">License: {rx.doctor.license}</p>
                      <p className="text-sm text-gray-500">Phone: {rx.doctor.phone}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                      Patient Information
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-1">
                      <p className="font-semibold text-gray-800">{rx.patient.name}</p>
                      <p className="text-sm text-gray-500">ID: #{rx.patient.id}</p>
                      <p className="text-sm text-gray-500">
                        {rx.patient.age} years · {rx.patient.gender}
                      </p>
                      <p className="text-sm text-gray-500">{rx.patient.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Date & ID */}
                <div className="grid grid-cols-2 gap-5 mb-7">
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">Date Issued</p>
                    <p className="font-medium text-gray-800">{rx.date}</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-xs text-gray-400 mb-1">Prescription ID</p>
                    <p className="font-mono font-medium text-gray-800">{rx.id}</p>
                  </div>
                </div>

                {/* Diagnosis */}
                <div className="border-t border-gray-200 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Diagnosis
                  </p>
                  <div className="bg-cyan-50 border border-cyan-200 rounded-xl p-4">
                    <p className="text-gray-800 font-medium">{rx.diagnosis}</p>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="border-t border-gray-100 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Presenting Symptoms
                  </p>
                  <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <p className="text-gray-700 text-sm leading-relaxed">{rx.symptoms}</p>
                  </div>
                </div>

                {/* Prescribed Medications */}
                <div className="border-t border-gray-100 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-4">
                    Prescribed Medications
                  </p>
                  <div className="space-y-4">
                    {rx.medicines.map((medicine, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 rounded-xl overflow-hidden"
                      >
                        {/* Medicine Header */}
                        <div className="flex items-center justify-between px-5 py-4 bg-gray-50">
                          <div>
                            <p className="font-semibold text-gray-800">
                              {index + 1}.&nbsp;{medicine.name}{" "}
                              <span className="text-cyan-600">{medicine.strength}</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-0.5">
                              {medicine.dosage} · {medicine.frequency} · {medicine.timing}
                            </p>
                          </div>
                          <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium whitespace-nowrap">
                            {medicine.duration}
                          </span>
                        </div>

                        {/* Instructions */}
                        <div className="px-5 py-3 border-t border-gray-100 flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
                          <p className="text-sm text-gray-600">
                            <span className="font-medium text-gray-700">Instructions: </span>
                            {medicine.instructions}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="border-t border-gray-100 pt-6 mb-7">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                    Additional Notes
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-gray-700 text-sm leading-relaxed">{rx.notes}</p>
                  </div>
                </div>

                {/* Follow-up */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center gap-3 mb-7">
                  <Calendar className="w-5 h-5 text-blue-500 shrink-0" />
                  <p className="text-sm text-blue-800">
                    <span className="font-semibold">Follow-up Appointment: </span>
                    {rx.followUp}
                  </p>
                </div>

                {/* Signature Row */}
                <div className="pt-6 border-t border-gray-200 flex items-end justify-between gap-6">
                  <div>
                    <p className="text-xs text-gray-400 mb-3">Authorized Signature</p>
                    <div className="w-52 border-b-2 border-gray-300 pb-1 mb-2">
                      <p className="text-2xl italic text-gray-700 font-serif">
                        {rx.doctor.name}
                      </p>
                    </div>
                    <p className="text-sm text-gray-500">{rx.doctor.name}</p>
                    <p className="text-xs text-gray-400">{rx.doctor.specialization}</p>
                  </div>

                  <div className="text-right">
                    <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 px-4 py-2 rounded-lg mb-3">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span className="text-sm font-medium text-green-700">
                        Digitally Verified
                      </span>
                    </div>
                    <p className="text-xs text-gray-400">Generated: {rx.date}</p>
                    <p className="text-xs text-gray-400">MediSync Health System</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="mt-8 text-center text-xs text-gray-400 space-y-0.5 border-t border-gray-100 pt-4">
                  <p>
                    This is a computer-generated prescription and does not require a physical signature.
                  </p>
                  <p>Report generated on {rx.date}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
