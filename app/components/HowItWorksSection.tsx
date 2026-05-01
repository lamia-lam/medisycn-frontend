"use client";

import {
  UserPlus,
  LayoutDashboard,
  HeartPulse,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create Your Account",
    desc: "Sign up as a Doctor, Patient, Pharmacy, or Diagnostic center in under a minute.",
  },
  {
    icon: LayoutDashboard,
    step: "02",
    title: "Access Your Dashboard",
    desc: "Get a role-specific dashboard tailored to your workflow and daily needs.",
  },
  {
    icon: HeartPulse,
    step: "03",
    title: "Start Collaborating",
    desc: "Connect with other healthcare stakeholders and manage everything digitally.",
  },
];

export default function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="py-24 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden"
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-100/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-cyan-600 font-semibold text-sm uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-4xl font-extrabold mt-3 mb-4 text-gray-900">
            Get Started in 3 Simple Steps
          </h2>
          <p className="text-gray-500 text-lg">
            MediSync is designed to be intuitive — no learning curve required.
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className="relative">
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-cyan-50 transition-all duration-500 h-full">
                {/* Step Number */}
                <span className="text-6xl font-black text-cyan-100 absolute top-4 right-6 select-none">
                  {s.step}
                </span>

                <div className="w-14 h-14 bg-gradient-to-br from-cyan-700 to-cyan-500 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-cyan-500/20">
                  <s.icon className="w-7 h-7 text-white" />
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {s.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{s.desc}</p>
              </div>

              {/* Connector arrow (not on last item) */}
              {i < steps.length - 1 && (
                <div className="hidden md:flex absolute top-1/2 -right-5 z-10 text-cyan-300">
                  <ArrowRight size={24} />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
