"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";
import {
  Activity,
  Users,
  FileText,
  Calendar,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  History,
  X,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

const sidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/doctor-dashboard",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Patients",
    href: "/doctor-dashboard/patients",
  },
  {
    icon: <FileText className="w-5 h-5" />,
    label: "Prescriptions",
    href: "/doctor-dashboard/prescriptions",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Appointments",
    href: "/doctor-dashboard/appointments",
  },
];

type Status = "Active" | "Inactive" | "Critical";

function getStatusBadgeVariant(status: Status) {
  if (status === "Active") return "success";
  if (status === "Critical") return "danger";
  return "default";
}

export default function PatientsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterGender, setFilterGender] = useState("all");
  const [patients, setPatients] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<any>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await fetch("/api/doctor/patients/my-patients");
        if (res.ok) {
          const data = await res.json();
          setPatients(data);
        }
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "",
    phone: "",
    dateOfBirth: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddPatient = async () => {
    if (
      !formData.name ||
      !formData.age ||
      !formData.gender ||
      !formData.phone
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const res = await fetch("/api/doctor/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          age: formData.age,
          gender: formData.gender,
          dateOfBirth: formData.dateOfBirth || null,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to register patient");
        return;
      }

      // Re-fetch patients to get the updated list
      const fetchRes = await fetch("/api/doctor/patients/my-patients");
      if (fetchRes.ok) {
        const data = await fetchRes.json();
        setPatients(data);
      }

      setIsAddPatientOpen(false);
      setFormData({
        name: "",
        age: "",
        gender: "",
        phone: "",
        dateOfBirth: "",
      });
    } catch (err) {
      console.error(err);
      alert("An error occurred while adding patient");
    }
  };

  const handleDeletePatient = async (dbId: number, name: string) => {
    if (
      !confirm(`Remove "${name}" from your patient list? This cannot be undone.`)
    )
      return;

    try {
      const res = await fetch(`/api/doctor/patients/${dbId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Failed to remove patient");
        return;
      }

      setPatients((prev) => prev.filter((p) => p.dbId !== dbId));
    } catch (err) {
      console.error(err);
      alert("An error occurred while removing the patient");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);
    const matchesGender =
      filterGender === "all" || patient.gender.toLowerCase() === filterGender;
    return matchesSearch && matchesGender;
  });

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Doctor">
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-1">
              Patient Management
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage and monitor your patients
            </p>
          </div>
          <button
            onClick={() => setIsAddPatientOpen(true)}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Patient
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: "Total Patients",
              value: patients.length,
              color: "text-cyan-600",
              bg: "bg-cyan-50 dark:bg-cyan-900/20",
            },
            {
              label: "Male Patients",
              value: patients.filter((p) => p.gender.toLowerCase() === "male")
                .length,
              color: "text-blue-600",
              bg: "bg-blue-50 dark:bg-blue-900/20",
            },
            {
              label: "Female Patients",
              value: patients.filter((p) => p.gender.toLowerCase() === "female")
                .length,
              color: "text-pink-600",
              bg: "bg-pink-50 dark:bg-pink-900/20",
            },
            {
              label: "Other Genders",
              value: patients.filter(
                (p) => !["male", "female"].includes(p.gender.toLowerCase()),
              ).length,
              color: "text-purple-500",
              bg: "bg-purple-50 dark:bg-purple-900/20",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`${stat.bg} rounded-xl p-4 border border-transparent`}
            >
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                {stat.label}
              </p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          {/* Search & Filter Bar */}
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or phone"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <select
                    value={filterGender}
                    onChange={(e) => setFilterGender(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white appearance-none cursor-pointer"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Showing{" "}
              <span className="font-medium text-gray-600 dark:text-gray-300">
                {filteredPatients.length}
              </span>{" "}
              of {patients.length} patients
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-700">
                  <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Patient
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Age
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Gender
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Contact
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Last Visit
                  </th>
                  <th className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filteredPatients.map((patient) => (
                  <tr
                    key={patient.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/40 transition-colors"
                  >
                    {/* Patient Avatar + Name */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full ${patient.avatarColor} flex items-center justify-center font-semibold text-sm shrink-0`}
                        >
                          {patient.initials}
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {patient.name}
                          </p>
                          <p className="text-xs text-gray-400">{patient.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {patient.age}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-700 dark:text-gray-300">
                      {patient.gender}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {patient.phone}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                      {patient.lastVisit}
                    </td>
                    {/* Actions */}
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() =>
                            router.push(
                              `/doctor-dashboard/patients/${patient.dbId}/history`,
                            )
                          }
                          title="View History"
                          className="p-2 rounded-lg text-gray-500 hover:bg-cyan-50 hover:text-cyan-600 dark:hover:bg-cyan-900/30 transition-colors"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setSelectedPatient(patient)}
                          title="View Details"
                          className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {/* <button
                          title="Edit"
                          className="p-2 rounded-lg text-gray-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-900/30 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button> */}
                        <button
                          onClick={() =>
                            handleDeletePatient(patient.dbId, patient.name)
                          }
                          title="Delete"
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/30 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredPatients.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                <Users className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">
                No patients found
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>

        {/* Add Patient Modal */}
        {isAddPatientOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    Add New Patient
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Fill in the patient information below to add them to your
                    patient list.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddPatientOpen(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Patient Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Age <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      placeholder="Enter age"
                      value={formData.age}
                      onChange={(e) => handleInputChange("age", e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Gender <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) =>
                        handleInputChange("gender", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white appearance-none cursor-pointer"
                    >
                      <option value="" disabled>
                        Select gender
                      </option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) =>
                      handleInputChange("dateOfBirth", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                <button
                  onClick={() => setIsAddPatientOpen(false)}
                  className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddPatient}
                  className="px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm shadow-sm"
                >
                  Add Patient
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Patient Details Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-cyan-700 to-cyan-500 p-6 relative rounded-t-xl shrink-0">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-full bg-white/20 border border-white/20 flex items-center justify-center font-bold text-2xl text-white shadow-sm shrink-0">
                    {selectedPatient.initials}
                  </div>
                  <div className="flex-1 text-white">
                    <h3 className="text-2xl font-semibold mb-1">
                      {selectedPatient.name}
                    </h3>
                    <div className="flex items-center gap-3 text-sm text-cyan-100">
                      <span className="bg-black/10 px-2 py-0.5 rounded-md font-medium">
                        {selectedPatient.id}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${selectedPatient.status === "Active" ? "bg-green-400" : "bg-gray-400"}`}
                        ></span>
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPatient(null)}
                  className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 space-y-8">
                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <User className="w-4 h-4 text-cyan-600" />
                    Personal Information
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-y-6 gap-x-4">
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Age
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.age || "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Gender
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.gender || "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Date of Birth
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.dateOfBirth
                          ? new Date(
                              selectedPatient.dateOfBirth,
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Blood Group
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.bloodGroup || "-"}
                      </p>
                    </div>
                    <div className="col-span-2 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Contact Number
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.phone || "-"}
                      </p>
                    </div>
                    <div className="col-span-2 md:col-span-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-800">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        Address
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.address || "No address provided"}
                      </p>
                    </div>
                  </div>
                </div>

                <hr className="border-gray-100 dark:border-gray-700" />

                <div>
                  <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 uppercase tracking-wider mb-5 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-600" />
                    Medical Overview
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-cyan-50 dark:bg-cyan-900/20 p-4 rounded-xl border border-cyan-100 dark:border-cyan-800/30">
                      <p className="text-sm text-cyan-600 dark:text-cyan-400 mb-1 font-medium">
                        Known Conditions
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.condition || "None recorded"}
                      </p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-800/30">
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1 font-medium">
                        Last Visit Date
                      </p>
                      <p className="font-semibold text-gray-800 dark:text-gray-200">
                        {selectedPatient.lastVisit
                          ? new Date(
                              selectedPatient.lastVisit,
                            ).toLocaleDateString()
                          : "-"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
