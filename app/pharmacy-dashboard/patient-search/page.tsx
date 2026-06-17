"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  User,
  Calendar,
  FileText,
  Eye,
  Stethoscope,
  Loader2,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";

const sidebarItems = [
  {
    icon: <LayoutDashboard className="w-5 h-5" />,
    label: "Dashboard",
    href: "/pharmacy-dashboard",
  },
  {
    icon: <Search className="w-5 h-5" />,
    label: "Patient Search",
    href: "/pharmacy-dashboard/patient-search",
  },
  {
    icon: <Package className="w-5 h-5" />,
    label: "Medicine Inventory",
    href: "/pharmacy-dashboard/inventory",
  },
  {
    icon: <History className="w-5 h-5" />,
    label: "Dispensing History",
    href: "/pharmacy-dashboard/history",
  },
];

type PatientResult = {
  id: number;
  displayId: string;
  name: string;
  initials: string;
  age: number | null;
  gender: string | null;
  bloodGroup: string | null;
  doctorName: string;
  lastVisit: string;
  totalPrescriptions: number;
};

export default function PatientSearch() {
  const router = useRouter();
  const [phoneQuery, setPhoneQuery] = useState("");
  const [searchResults, setSearchResults] = useState<PatientResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();

    const query = phoneQuery.trim();
    if (!query) {
      setError("Please enter a patient phone number");
      setSearchResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ phone: query });
      const res = await fetch(`/api/pharmacy/patients/search?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to search patients");
        setSearchResults([]);
        return;
      }

      setSearchResults(data.patients ?? []);
    } catch {
      setError("Failed to search patients");
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
            Patient Search
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Search by patient phone number to view their prescriptions
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                inputMode="tel"
                placeholder="Enter patient phone number..."
                value={phoneQuery}
                onChange={(e) => setPhoneQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 disabled:opacity-60 text-white px-6 py-3.5 rounded-xl font-medium transition-colors shadow-sm shrink-0"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
              Search
            </button>
          </form>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm mb-4">
              {error}
            </div>
          )}

          {hasSearched && !loading && searchResults.length > 0 && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found{" "}
              <span className="font-semibold text-cyan-600">
                {searchResults.length}
              </span>{" "}
              patient(s)
            </p>
          )}

          {!hasSearched && !loading && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
                Search for a patient
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Enter the patient&apos;s phone number and click Search
              </p>
            </div>
          )}

          {hasSearched && !loading && searchResults.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-gray-50/70 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800/50 transition-all duration-200"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-[#eef8fb] text-[#0ab3b3] flex items-center justify-center font-semibold text-base shrink-0">
                        {patient.initials}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800 dark:text-white text-base">
                          {patient.name}
                        </p>
                        <p className="text-sm text-gray-400 dark:text-gray-500">
                          {patient.displayId}
                        </p>
                      </div>
                    </div>
                    {patient.bloodGroup && (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/40">
                        {patient.bloodGroup}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>
                        {patient.age != null ? `${patient.age} yrs` : "—"}
                        {patient.gender ? `, ${patient.gender}` : ""}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Stethoscope className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{patient.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>Last: {patient.lastVisit}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>{patient.totalPrescriptions} Prescriptions</span>
                    </div>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/pharmacy-dashboard/patient-search/${patient.id}/prescriptions`,
                      )
                    }
                    className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    <Eye className="w-4 h-4" />
                    View Prescriptions
                  </button>
                </div>
              ))}
            </div>
          )}

          {hasSearched && !loading && searchResults.length === 0 && !error && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
                No patient found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Check the phone number and try again
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
