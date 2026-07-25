"use client";

import { X, Shield } from "lucide-react";

interface AdminProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdminProfileDrawer({ isOpen, onClose }: AdminProfileDrawerProps) {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white dark:bg-gray-900 shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md z-10">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-cyan-500" />
              Admin Profile
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex flex-col items-center mb-8">
              <div className="w-24 h-24 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center mb-4 border-4 border-white dark:border-gray-800 shadow-lg">
                <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">A</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">System Admin</h3>
              <p className="text-gray-500 dark:text-gray-400">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
