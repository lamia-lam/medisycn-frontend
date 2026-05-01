"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function CTASection() {
  return (
    <section className="py-24 bg-gray-50 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-100/30 rounded-full blur-3xl" />

      <div className="relative max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
          Ready to Transform Your{" "}
          <span className="bg-gradient-to-r from-cyan-700 to-cyan-500 bg-clip-text text-transparent">
            Healthcare Experience
          </span>
          ?
        </h2>
        <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
          Join thousands of healthcare professionals already using MediSync.
          Create your free account today.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/register"
            className="group inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-700 to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all text-lg"
          >
            Get Started Free
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 border-2 border-gray-200 text-gray-700 font-bold rounded-xl hover:border-cyan-300 hover:text-cyan-600 transition-all text-lg"
          >
            Sign In
          </Link>
        </div>
      </div>
    </section>
  );
}
