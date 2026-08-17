"use client";

import React, { useState } from "react";
import { LogOut, X, Menu } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { DoctorProfileDrawer } from "./DoctorProfileDrawer";
import { PatientProfileDrawer } from "./PatientProfileDrawer";
import { PharmacyProfileDrawer } from "./PharmacyProfileDrawer";
import { DiagnosticProfileDrawer } from "./DiagnosticProfileDrawer";
import { AdminProfileDrawer } from "./AdminProfileDrawer";
import { AIChatbot } from "./AIChatbot";

interface SidebarItem {
  icon: React.ReactNode;
  label: string;
  href: string;
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  sidebarItems: SidebarItem[];
  userRole: string;
}

export function DashboardLayout({
  children,
  sidebarItems,
  userRole,
}: DashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout API call failed:", error);
    } finally {
      document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      // Clear all medication reminder session flags so popup re-appears on next login
      Object.keys(sessionStorage)
        .filter((k) => k.startsWith("medReminderShown"))
        .forEach((k) => sessionStorage.removeItem(k));
      router.replace("/login");
    }
  };

  return (
    <div className="dashboard-shell flex h-screen bg-[#f8fafc] dark:bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarCollapsed ? "w-14" : "w-64"
        } bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col shrink-0 shadow-sm z-10 transition-all duration-300 ease-in-out overflow-hidden`}
      >
        {/* Logo + Toggle */}
        <div className="p-4 flex items-center justify-between border-b border-transparent shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded bg-cyan-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              MS
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-gray-800 dark:text-white whitespace-nowrap">
                MediSync
              </span>
            )}
          </div>
          {!sidebarCollapsed && (
            <button
              onClick={() => setSidebarCollapsed(true)}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors shrink-0 ml-2"
              title="Collapse sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-2 space-y-1 mt-6 overflow-y-auto overflow-x-hidden">
          {sidebarItems.map((item, index) => {
            const isExactRoot =
              item.href.split("/").filter(Boolean).length <= 1;
            const isActive =
              pathname === item.href ||
              (!isExactRoot && pathname.startsWith(item.href + "/"));
            return (
              <Link
                key={index}
                href={item.href}
                suppressHydrationWarning
                title={sidebarCollapsed ? item.label : undefined}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  sidebarCollapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-[#eef8fb] text-[#0ab3b3]"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div
                  suppressHydrationWarning
                  className={`shrink-0 ${isActive ? "text-[#0ab3b3]" : "text-gray-400"}`}
                >
                  {item.icon}
                </div>
                {!sidebarCollapsed && (
                  <span className="whitespace-nowrap">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 mt-auto shrink-0">
          <button
            onClick={handleLogout}
            title={sidebarCollapsed ? "Logout" : undefined}
            className={`flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
              sidebarCollapsed ? "justify-center" : ""
            }`}
          >
            <LogOut className="w-5 h-5 text-gray-500 shrink-0" />
            {!sidebarCollapsed && (
              <span className="whitespace-nowrap">Logout</span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-6 shrink-0 shadow-sm z-0">
          <div className="flex items-center gap-4">
            {/* Hamburger — only visible when sidebar is collapsed */}
            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                title="Expand sidebar"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}
            <h1 className="text-[1.35rem] font-semibold text-gray-800 dark:text-white">
              {userRole} Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 -mr-1.5 rounded-lg transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-medium text-sm">
                {userRole?.charAt(0).toUpperCase() ?? "U"}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {userRole}
              </span>
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">{children}</div>
        </main>
      </div>

      {/* AI Chatbot — patient portal only */}
      {userRole?.toLowerCase() === "patient" && <AIChatbot />}

      {userRole?.toLowerCase() === "patient" ? (
        <PatientProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      ) : userRole?.toLowerCase() === "pharmacy" ? (
        <PharmacyProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      ) : userRole?.toLowerCase() === "diagnostic" ? (
        <DiagnosticProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      ) : userRole?.toLowerCase() === "admin" ? (
        <AdminProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      ) : (
        <DoctorProfileDrawer
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
        />
      )}
    </div>
  );
}
