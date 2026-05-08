"use client";

import React, { useState } from "react";
import { LogOut, X, Bell } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { DoctorProfileDrawer } from "./DoctorProfileDrawer";

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

  const handleLogout = () => {
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.replace("/login");
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-gray-900 font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col shrink-0 shadow-sm z-10">
        <div className="p-4 flex items-center justify-between border-b border-transparent">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-cyan-600 text-white flex items-center justify-center font-bold text-sm">
              MS
            </div>
            <span className="font-semibold text-gray-800 dark:text-white">
              MediSync
            </span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 space-y-1 mt-6 overflow-y-auto">
          {sidebarItems.map((item, index) => {
            // Use exact match for the root dashboard route.
            // For deeper routes (e.g. /patients, /prescriptions), also match sub-paths.
            const isExactRoot = item.href.split("/").filter(Boolean).length <= 1;
            const isActive =
              pathname === item.href ||
              (!isExactRoot && pathname.startsWith(item.href + "/"));
            return (
              <a
                key={index}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? "bg-[#eef8fb] text-[#0ab3b3]"
                    : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                }`}
              >
                <div
                  className={`${isActive ? "text-[#0ab3b3]" : "text-gray-400"}`}
                >
                  {item.icon}
                </div>
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="p-4 mt-auto">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
          >
            <LogOut className="w-5 h-5 text-gray-500" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between px-8 shrink-0 shadow-sm z-0">
          <h1 className="text-[1.35rem] font-semibold text-gray-800 dark:text-white">
            {userRole} Dashboard
          </h1>

          <div className="flex items-center gap-6">
            <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-800"></span>
            </button>
            <button 
              onClick={() => setIsProfileOpen(true)}
              className="flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 p-1.5 -mr-1.5 rounded-lg transition-colors cursor-pointer text-left"
            >
              <div className="w-8 h-8 rounded-full bg-cyan-600 text-white flex items-center justify-center font-medium text-sm">
                D
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

      <DoctorProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />
    </div>
  );
}
