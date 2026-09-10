"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Sparkles } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-white animate-gradient" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-cyan-200/30 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl" />

      <div className="relative max-w-7xl mx-auto px-6 pt-28 pb-20 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: Text */}
        <div>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-100/60 rounded-full text-cyan-700 text-sm font-medium mb-6 animate-fade-in-up">
            <Sparkles size={16} />
            Trusted Healthcare Platform
          </div>

          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 animate-fade-in-up animation-delay-200">
            <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              Healthcare,{" "}
            </span>
            <span className="bg-gradient-to-r from-cyan-700 to-cyan-500 bg-clip-text text-transparent">
              Unified
            </span>
          </h1>

          <p className="text-lg text-gray-500 max-w-lg mb-8 leading-relaxed animate-fade-in-up animation-delay-400">
            MediSync connects doctors, patients, pharmacies, and diagnostic
            centers on one seamless platform. Manage appointments,
            prescriptions, and reports — all in one place.
          </p>

          <div className="flex flex-wrap gap-4 mb-10 animate-fade-in-up animation-delay-600">
            <Link
              href="/register"
              className="group inline-flex items-center gap-2 px-7 py-3.5 bg-gradient-to-r from-cyan-700 to-cyan-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5 transition-all"
            >
              Start Free
              <ArrowRight
                size={18}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center gap-2 px-7 py-3.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:border-cyan-300 hover:text-cyan-600 transition-all"
            >
              Explore Features
            </a>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-400 animate-fade-in-up animation-delay-800">
            <span className="flex items-center gap-1.5">
              <Shield size={14} className="text-green-500" /> HIPAA Compliant
            </span>
            <span>•</span>
            <span>100% Secure Data</span>
            <span>•</span>
            <span>24/7 Support</span>
          </div>
        </div>

        {/* Right: Hero Image */}
        <div className="hidden lg:block animate-fade-in-right animate-float">
          <div className="relative animate-pulse-glow rounded-3xl">
            <Image
              src="/homePage.png"
              alt="MediSync Healthcare Platform"
              width={600}
              height={500}
              className="rounded-3xl"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
