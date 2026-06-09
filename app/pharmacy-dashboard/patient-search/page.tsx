"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  User,
  Phone,
  Calendar,
  FileText,
  Eye,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";

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

const patientsData = [
  {
    id: "P001",
    name: "John Doe",
    initials: "JD",
    phone: "+1 (555) 123-4567",
    age: 45,
    gender: "Male",
    bloodGroup: "A+",
    lastVisit: "2026-05-20",
    totalPrescriptions: 8,
  },
  {
    id: "P002",
    name: "Jane Smith",
    initials: "JS",
    phone: "+1 (555) 234-5678",
    age: 32,
    gender: "Female",
    bloodGroup: "B+",
    lastVisit: "2026-05-18",
    totalPrescriptions: 5,
  },
  {
    id: "P003",
    name: "Mike Johnson",
    initials: "MJ",
    phone: "+1 (555) 345-6789",
    age: 28,
    gender: "Male",
    bloodGroup: "O+",
    lastVisit: "2026-05-15",
    totalPrescriptions: 3,
  },
  {
    id: "P004",
    name: "Sarah Williams",
    initials: "SW",
    phone: "+1 (555) 456-7890",
    age: 55,
    gender: "Female",
    bloodGroup: "AB+",
    lastVisit: "2026-05-12",
    totalPrescriptions: 12,
  },
  {
    id: "P005",
    name: "Robert Brown",
    initials: "RB",
    phone: "+1 (555) 567-8901",
    age: 62,
    gender: "Male",
    bloodGroup: "A-",
    lastVisit: "2026-05-10",
    totalPrescriptions: 15,
  },
  {
    id: "P006",
    name: "Emily Davis",
    initials: "ED",
    phone: "+1 (555) 678-9012",
    age: 38,
    gender: "Female",
    bloodGroup: "O-",
    lastVisit: "2026-05-08",
    totalPrescriptions: 7,
  },
];

export default function PatientSearch() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(patientsData);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim() === "") {
      setSearchResults(patientsData);
    } else {
      const filtered = patientsData.filter(
        (patient) =>
          patient.name.toLowerCase().includes(query.toLowerCase()) ||
          patient.phone.includes(query),
      );
      setSearchResults(filtered);
    }
  };

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
            Patient Search
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Search patients by name or phone number to view their prescriptions
          </p>
        </div>

        {/* Search + Results */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by patient name or phone number..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-base transition-all"
            />
          </div>

          {/* Result count */}
          {searchQuery && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Found{" "}
              <span className="font-semibold text-cyan-600">
                {searchResults.length}
              </span>{" "}
              patient(s) matching &quot;{searchQuery}&quot;
            </p>
          )}

          {/* Patient Cards Grid */}
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {searchResults.map((patient) => (
                <div
                  key={patient.id}
                  className="bg-gray-50/70 dark:bg-gray-900/30 rounded-xl border border-gray-100 dark:border-gray-700 p-5 hover:shadow-md hover:border-cyan-200 dark:hover:border-cyan-800/50 transition-all duration-200"
                >
                  {/* Patient Header */}
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
                          {patient.id}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-50 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-800/40">
                      {patient.bloodGroup}
                    </span>
                  </div>

                  {/* Patient Details Grid */}
                  <div className="grid grid-cols-2 gap-y-2.5 gap-x-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="w-4 h-4 text-gray-400 shrink-0" />
                      <span className="truncate">{patient.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <User className="w-4 h-4 text-gray-400 shrink-0" />
                      <span>
                        {patient.age} yrs, {patient.gender}
                      </span>
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

                  {/* CTA Button */}
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
          ) : (
            /* Empty State */
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
                No patients found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try searching with a different name or phone number
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
