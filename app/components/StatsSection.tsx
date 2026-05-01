"use client";

const stats = [
  { value: "10K+", label: "Active Users" },
  { value: "500+", label: "Doctors Onboarded" },
  { value: "50K+", label: "Prescriptions Processed" },
  { value: "99.9%", label: "Uptime Guarantee" },
];

export default function StatsSection() {
  return (
    <section className="py-20 bg-gradient-to-r from-cyan-700 to-cyan-500 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      </div>

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((s, i) => (
            <div key={i} className="text-center">
              <div className="text-4xl lg:text-5xl font-black text-white mb-2">
                {s.value}
              </div>
              <div className="text-cyan-100 font-medium text-sm uppercase tracking-wider">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
