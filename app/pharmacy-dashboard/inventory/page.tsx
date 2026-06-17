"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LayoutDashboard,
  Search,
  Package,
  History,
  Filter,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
} from "lucide-react";
import { DashboardLayout } from "../../components/DashboardLayout";
import { Badge } from "../../components/Badge";
import { AutocompleteInput } from "../../components/AutocompleteInput";

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

type Medicine = {
  id: number;
  name: string;
  genericName: string;
  category: string;
  stockQty: number;
  lowStockThreshold: number;
  status: string;
  expiryDate: string;
};

type InventoryStats = {
  total: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type MedicineFormData = {
  name: string;
  genericName: string;
  category: string;
  stockQty: string;
  addStockQty: string;
  lowStockThreshold: string;
  expiryDate: string;
};

const emptyForm: MedicineFormData = {
  name: "",
  genericName: "",
  category: "",
  stockQty: "",
  addStockQty: "",
  lowStockThreshold: "50",
  expiryDate: "",
};

function medicineToForm(medicine: Medicine): MedicineFormData {
  return {
    name: medicine.name,
    genericName: medicine.genericName,
    category: medicine.category,
    stockQty: String(medicine.stockQty),
    addStockQty: "",
    lowStockThreshold: String(medicine.lowStockThreshold),
    expiryDate: medicine.expiryDate,
  };
}

export default function MedicineInventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [stats, setStats] = useState<InventoryStats>({
    total: 0,
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [formData, setFormData] = useState<MedicineFormData>(emptyForm);
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError("");

    const params = new URLSearchParams({
      page: String(page),
      limit: "50",
    });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filterStatus !== "all") params.set("status", filterStatus);

    try {
      const res = await fetch(`/api/pharmacy/inventory?${params}`);
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to load inventory");
        return;
      }

      setMedicines(data.medicines);
      setStats(data.stats);
      setPagination(data.pagination);
    } catch {
      setError("Failed to load inventory");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, filterStatus]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const openAddModal = () => {
    setEditingMedicine(null);
    setFormData(emptyForm);
    setFormError("");
    setIsModalOpen(true);
  };

  const openEditModal = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData(medicineToForm(medicine));
    setFormError("");
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingMedicine(null);
    setFormData(emptyForm);
    setFormError("");
  };

  const handleInputChange = (field: keyof MedicineFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setFormError("");

    if (
      !formData.name.trim() ||
      !formData.genericName.trim() ||
      !formData.category.trim() ||
      !formData.expiryDate
    ) {
      setFormError("Please fill in all required fields");
      return;
    }

    setSaving(true);

    try {
      if (editingMedicine) {
        const payload: Record<string, string | number> = {
          name: formData.name.trim(),
          genericName: formData.genericName.trim(),
          category: formData.category.trim(),
          lowStockThreshold: formData.lowStockThreshold,
          expiryDate: formData.expiryDate,
        };

        if (formData.addStockQty.trim()) {
          payload.addStockQty = formData.addStockQty;
        } else {
          payload.stockQty = formData.stockQty;
        }

        const res = await fetch(
          `/api/pharmacy/inventory/${editingMedicine.id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Failed to update medicine");
          return;
        }
      } else {
        const res = await fetch("/api/pharmacy/inventory", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: formData.name.trim(),
            genericName: formData.genericName.trim(),
            category: formData.category.trim(),
            stockQty: formData.stockQty || "0",
            lowStockThreshold: formData.lowStockThreshold || "50",
            expiryDate: formData.expiryDate,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          setFormError(data.error || "Failed to add medicine");
          return;
        }
      }

      closeModal();
      await fetchInventory();
    } catch {
      setFormError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

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

  if (loading && medicines.length === 0) {
    return (
      <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
        <div className="flex h-[80vh] items-center justify-center">
          <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout sidebarItems={sidebarItems} userRole="Pharmacy">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-medium text-gray-800 dark:text-white mb-1">
              Medicine Inventory
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Manage and monitor your pharmacy inventory
            </p>
          </div>
          <button
            onClick={openAddModal}
            className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5" />
            Add Medicine
          </button>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
              {stats.total}
            </p>
          </div>

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
              {stats.inStock}
            </p>
          </div>

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
              {stats.lowStock}
            </p>
          </div>

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
              {stats.outOfStock}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6 shadow-sm">
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
                onChange={(e) => {
                  setFilterStatus(e.target.value);
                  setPage(1);
                }}
                className="pl-11 pr-10 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900/40 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent appearance-none cursor-pointer text-sm text-gray-700 dark:text-gray-300 min-w-[180px] transition-all"
              >
                <option value="all">All Status</option>
                <option value="in-stock">In Stock</option>
                <option value="low-stock">Low Stock</option>
                <option value="out-of-stock">Out of Stock</option>
              </select>
            </div>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Showing{" "}
            <span className="font-semibold text-cyan-600">
              {medicines.length}
            </span>{" "}
            of {pagination.total} medicines
            {pagination.totalPages > 1 && (
              <span>
                {" "}
                (page {pagination.page} of {pagination.totalPages})
              </span>
            )}
          </p>

          <div className="overflow-x-auto relative">
            {loading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-gray-800/60 flex items-center justify-center z-10 rounded-lg">
                <Loader2 className="w-6 h-6 text-cyan-500 animate-spin" />
              </div>
            )}
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
                {medicines.map((medicine, index) => {
                  const statusInfo = getStatusInfo(medicine.status);
                  const StatusIcon = statusInfo.icon;

                  return (
                    <tr
                      key={medicine.id}
                      onClick={() => openEditModal(medicine)}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer ${
                        index !== medicines.length - 1
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

          {medicines.length === 0 && !loading && (
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

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1 || loading}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                disabled={pagination.page >= pagination.totalPages || loading}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                  {editingMedicine ? "Edit Medicine" : "Add New Medicine"}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {editingMedicine
                    ? "Update medicine details or restock with a new batch."
                    : "Fill in the details below to add a medicine to inventory."}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {formError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AutocompleteInput
                  label="Medicine Name"
                  required
                  field="name"
                  minChars={1}
                  placeholder="e.g. Paracetamol 500mg Tablet"
                  value={formData.name}
                  onChange={(v) => handleInputChange("name", v)}
                  onSelectMedicine={(item) => {
                    setFormData((prev) => ({
                      ...prev,
                      name: item.name,
                      genericName: item.genericName,
                      category: item.category,
                    }));
                  }}
                />

                <AutocompleteInput
                  label="Generic Name"
                  required
                  field="genericName"
                  minChars={1}
                  placeholder="e.g. Acetaminophen 500mg"
                  value={formData.genericName}
                  onChange={(v) => handleInputChange("genericName", v)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AutocompleteInput
                  label="Category"
                  required
                  field="category"
                  minChars={0}
                  placeholder="Select or enter category"
                  value={formData.category}
                  onChange={(v) => handleInputChange("category", v)}
                />

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.lowStockThreshold}
                    onChange={(e) =>
                      handleInputChange("lowStockThreshold", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                  />
                </div>
              </div>

              {editingMedicine ? (
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900/40 rounded-xl border border-gray-100 dark:border-gray-700">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock Management
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Current stock:{" "}
                    <span className="font-semibold text-gray-700 dark:text-gray-300">
                      {editingMedicine.stockQty} units
                    </span>
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Set Stock Quantity
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Override total stock"
                        value={formData.stockQty}
                        onChange={(e) =>
                          handleInputChange("stockQty", e.target.value)
                        }
                        disabled={!!formData.addStockQty.trim()}
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400 disabled:opacity-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Add Stock (New Batch)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="Units to add"
                        value={formData.addStockQty}
                        onChange={(e) =>
                          handleInputChange("addStockQty", e.target.value)
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Stock Quantity
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formData.stockQty}
                    onChange={(e) =>
                      handleInputChange("stockQty", e.target.value)
                    }
                    className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white placeholder-gray-400"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Expiry Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) =>
                    handleInputChange("expiryDate", e.target.value)
                  }
                  className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-400/40 dark:text-white"
                />
                {editingMedicine && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Update this when adding a new batch with a different expiry
                    date.
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={closeModal}
                disabled={saving}
                className="px-5 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors font-medium text-sm disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors font-medium text-sm shadow-sm disabled:opacity-50"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingMedicine ? "Save Changes" : "Add Medicine"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
