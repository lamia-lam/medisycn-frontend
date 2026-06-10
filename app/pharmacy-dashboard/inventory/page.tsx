"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
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

const medicinesData = [
  {
    id: 1,
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Analgesic",
    stockQty: 450,
    status: "In Stock",
    expiryDate: "2027-12-31",
  },
  {
    id: 2,
    name: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    category: "Antibiotic",
    stockQty: 23,
    status: "Low Stock",
    expiryDate: "2027-08-15",
  },
  {
    id: 3,
    name: "Ibuprofen",
    genericName: "Ibuprofen",
    category: "Analgesic",
    stockQty: 380,
    status: "In Stock",
    expiryDate: "2028-03-20",
  },
  {
    id: 4,
    name: "Metformin",
    genericName: "Metformin Hydrochloride",
    category: "Antidiabetic",
    stockQty: 0,
    status: "Out of Stock",
    expiryDate: "2027-06-30",
  },
  {
    id: 5,
    name: "Omeprazole",
    genericName: "Omeprazole",
    category: "Antacid",
    stockQty: 12,
    status: "Low Stock",
    expiryDate: "2027-11-10",
  },
  {
    id: 6,
    name: "Amlodipine",
    genericName: "Amlodipine Besylate",
    category: "Antihypertensive",
    stockQty: 200,
    status: "In Stock",
    expiryDate: "2028-01-25",
  },
  {
    id: 7,
    name: "Atenolol",
    genericName: "Atenolol",
    category: "Antihypertensive",
    stockQty: 45,
    status: "Low Stock",
    expiryDate: "2027-09-18",
  },
  {
    id: 8,
    name: "Aspirin",
    genericName: "Acetylsalicylic Acid",
    category: "Antiplatelet",
    stockQty: 150,
    status: "In Stock",
    expiryDate: "2028-05-12",
  },
  {
    id: 9,
    name: "Cetirizine",
    genericName: "Cetirizine Hydrochloride",
    category: "Antihistamine",
    stockQty: 320,
    status: "In Stock",
    expiryDate: "2027-10-08",
  },
  {
    id: 10,
    name: "Azithromycin",
    genericName: "Azithromycin",
    category: "Antibiotic",
    stockQty: 8,
    status: "Low Stock",
    expiryDate: "2027-07-22",
  },
];

export default function MedicineInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredMedicines = medicinesData.filter((medicine) => {
    const matchesSearch =
      medicine.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.genericName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      medicine.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      filterStatus === "all" ||
      medicine.status.toLowerCase().replace(/ /g, "-") === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case "In Stock":
        return {
          variant: "success" as const,
          icon: CheckCircle2,
          color: "text-green-600 dark:text-green-400",
        };
      case "Low Stock":
        return {
          variant: "warning" as const,
          icon: AlertTriangle,
          color: "text-yellow-600 dark:text-yellow-400",
        };
      case "Out of Stock":
        return {
          variant: "danger" as const,
          icon: XCircle,
          color: "text-red-600 dark:text-red-400",
        };
      default:
        return {
          variant: "default" as const,
          icon: AlertTriangle,
          color: "text-gray-600 dark:text-gray-400",
        };
    }
  };

  const totalMedicines = medicinesData.length;
  const inStock = medicinesData.filter((m) => m.status === "In Stock").length;
  const lowStock = medicinesData.filter((m) => m.status === "Low Stock").length;
  const outOfStock = medicinesData.filter(
    (m) => m.status === "Out of Stock",
  ).length;

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
            Medicine Inventory
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Manage and monitor your pharmacy inventory
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Total Medicines
              </p>
              <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-800 dark:text-white">
              {totalMedicines}
            </p>
          </div>

          {/* In Stock */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                In Stock
              </p>
              <div className="w-9 h-9 rounded-lg bg-green-50 dark:bg-green-900/30 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {inStock}
            </p>
          </div>

          {/* Low Stock */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Low Stock
              </p>
              <div className="w-9 h-9 rounded-lg bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
              {lowStock}
            </p>
          </div>

          {/* Out of Stock */}
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Out of Stock
              </p>
              <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/30 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {outOfStock}
            </p>
          </div>
        </div>

        {/* Table Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
          {/* Search + Filter */}
          <div className="flex flex-col lg:flex-row gap-3 mb-5">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by medicine name, generic name, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 text-sm transition-all"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-11 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer text-sm text-gray-700 dark:text-gray-300 min-w-[180px] transition-all"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          {/* Result count */}
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing{" "}
            <span className="font-semibold text-cyan-600">
              {filteredMedicines.length}
            </span>{" "}
            of {totalMedicines} medicines
          </p>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-900/40 rounded-lg">
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-l-lg">
                    Medicine Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Generic Name
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Category
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Stock Quantity
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400">
                    Stock Status
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600 dark:text-gray-400 rounded-r-lg">
                    Expiry Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredMedicines.map((medicine, index) => {
                  const statusInfo = getStatusInfo(medicine.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={medicine.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors ${
                        index !== filteredMedicines.length - 1
                          ? "border-b border-gray-100 dark:border-gray-700"
                          : ""
                      }`}
                    >
                      <td className="px-4 py-4 font-semibold text-gray-800 dark:text-white">
                        {medicine.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {medicine.genericName}
                      </td>
                      <td className="px-4 py-4">
                        <Badge variant="default">{medicine.category}</Badge>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`font-semibold text-sm ${statusInfo.color}`}
                        >
                          {medicine.stockQty} units
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <Badge
                          variant={statusInfo.variant}
                          className="inline-flex items-center gap-1"
                        >
                          <StatusIcon className="w-3 h-3" />
                          {medicine.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-400">
                        {medicine.expiryDate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Empty State */}
          {filteredMedicines.length === 0 && (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-gray-300 dark:text-gray-500" />
              </div>
              <p className="font-medium text-gray-600 dark:text-gray-300 mb-1">
                No medicines found
              </p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                Try adjusting your search or filter
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
