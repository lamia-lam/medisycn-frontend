"use client";

import Navbar from "./components/Navbar";
import HeroSection from "./components/HeroSection";
import FeaturesSection from "./components/FeaturesSection";
//import StatsSection from "./components/StatsSection";
import HowItWorksSection from "./components/HowItWorksSection";
import DashboardsSection from "./components/DashboardsSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      {/* <StatsSection /> */}
      <HowItWorksSection />
      <DashboardsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
