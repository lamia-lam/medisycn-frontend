"use client";

import {
  Stethoscope,
  User,
  Pill,
  Microscope,
  CheckCircle2,
} from "lucide-react";

const dashboards = [
  {
    icon: Stethoscope,
    role: "Doctor",
    gradient: "from-cyan-500 to-blue-500",
    features: [
      "View & manage patient records",
      "Write digital prescriptions",
      "Schedule appointments",
      "Access diagnostic reports",
    ],
  },
  {
    icon: User,
    role: "Patient",
    gradient: "from-blue-500 to-indigo-500",
    features: [
      "Book appointments online",
      "View medical history",
      "Receive prescriptions digitally",
      "Track health progress",
    ],
  },
  {
    icon: Pill,
    role: "Pharmacy",
    gradient: "from-teal-500 to-cyan-500",
    features: [
      "Receive prescriptions instantly",
      "Manage drug inventory",
      "Process & fulfill orders",
      "Track dispensing history",
    ],
  },
  {
    icon: Microscope,
    role: "Diagnostic",
    gradient: "from-indigo-500 to-purple-500",
    features: [
      "Upload test results",
      "Manage lab workflow",
      "Link reports to patients",
      "Generate analytical insights",
    ],
  },
];

export default function DashboardsSection() {
  return (
    <section id="dashboards" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            Role-Based Dashboards
          </span>
          <h2 className="text-4xl font-extrabold mt-3 mb-4 text-gray-900">
            A Dashboard for Every Role
          </h2>
          <p className="text-gray-500 text-lg">
            Each user type gets a dedicated, purpose-built dashboard experience.
          </p>
        </div>

        {/* Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboards.map((d, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-gray-100 bg-white overflow-hidden hover:shadow-2xl hover:shadow-cyan-100/40 transition-all duration-500 hover:-translate-y-1"
            >
              {/* Gradient header */}
              <div
                className={`bg-gradient-to-r ${d.gradient} p-6 flex items-center gap-3`}
              >
                <d.icon className="w-8 h-8 text-white" />
                <h3 className="text-xl font-bold text-white">{d.role}</h3>
              </div>

              {/* Feature list */}
              <div className="p-6">
                <ul className="space-y-3">
                  {d.features.map((feat, j) => (
                    <li
                      key={j}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <CheckCircle2 className="w-4 h-4 text-cyan-500 mt-0.5 shrink-0" />
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
