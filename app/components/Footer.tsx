"use client";

import Link from "next/link";
import { Mail, Phone, MapPin } from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Features", href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Dashboards", href: "#dashboards" },
    { label: "Pricing", href: "#" },
  ],
  Roles: [
    { label: "For Doctors", href: "/register" },
    { label: "For Patients", href: "/register" },
    { label: "For Pharmacies", href: "/register" },
    { label: "For Diagnostics", href: "/register" },
  ],
  Company: [
    { label: "About Us", href: "#" },
    { label: "Careers", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Contact", href: "#contact" },
  ],
};

export default function Footer() {
  return (
    <footer id="contact" className="bg-gray-900 text-gray-300 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-16">
          {/* Brand */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                MS
              </div>
              <span className="text-xl font-bold text-white">MediSync</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-sm leading-relaxed">
              Connecting every corner of healthcare — from consultations
              to prescriptions to diagnostics — on one unified platform.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-cyan-400" />
                <span>support@medisync.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-cyan-400" />
                <span>+880 1234 567890</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-cyan-400" />
                <span>Dhaka, Bangladesh</span>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h4 className="text-white font-semibold mb-4">{heading}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-cyan-400 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} MediSync. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-cyan-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
