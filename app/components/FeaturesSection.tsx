"use client";

import {
  Stethoscope,
  Pill,
  FileSearch,
  CalendarCheck,
  ShieldCheck,
  Users,
} from "lucide-react";

const features = [
  {
    icon: Stethoscope,
    title: "Doctor Dashboard",
    desc: "Doctors can manage patient records, view appointments, and write prescriptions in real-time.",
    color: "from-cyan-400 to-cyan-600",
    bg: "bg-cyan-50",
  },
  {
    icon: Users,
    title: "Patient Portal",
    desc: "Patients access medical history, book appointments, and receive digital prescriptions instantly.",
    color: "from-blue-400 to-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: Pill,
    title: "Pharmacy Integration",
    desc: "Pharmacies receive prescriptions digitally and manage inventory with seamless fulfillment tracking.",
    color: "from-teal-400 to-teal-600",
    bg: "bg-teal-50",
  },
  {
    icon: FileSearch,
    title: "Diagnostic Center",
    desc: "Diagnostic centers upload test results directly, streamlining the patient-doctor workflow.",
    color: "from-indigo-400 to-indigo-600",
    bg: "bg-indigo-50",
  },
  {
    icon: CalendarCheck,
    title: "Smart Scheduling",
    desc: "Smart appointment scheduling that reduces wait times and optimizes doctor availability.",
    color: "from-sky-400 to-sky-600",
    bg: "bg-sky-50",
  },
  {
    icon: ShieldCheck,
    title: "Secure & Private",
    desc: "End-to-end encryption with role-based access ensures your medical data stays confidential.",
    color: "from-emerald-400 to-emerald-600",
    bg: "bg-emerald-50",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-white relative">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-4xl font-extrabold mt-3 mb-4 text-gray-900">
            Everything You Need in One Platform
          </h2>
          <p className="text-gray-500 text-lg">
            From consultations to prescriptions to diagnostics — MediSync
            handles every step of the healthcare journey.
          </p>
        </div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div
              key={i}
              className="group relative p-8 rounded-2xl border border-gray-100 hover:border-transparent hover:shadow-2xl hover:shadow-cyan-100/50 transition-all duration-500 hover:-translate-y-1 bg-white"
            >
              <div
                className={`w-14 h-14 ${f.bg} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}
              >
                <f.icon className="w-7 h-7 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {f.title}
              </h3>
              <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              <div
                className={`absolute bottom-0 left-8 right-8 h-1 bg-gradient-to-r ${f.color} rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
