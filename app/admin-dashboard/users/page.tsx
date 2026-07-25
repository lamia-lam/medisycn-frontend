"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Loader2 } from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  createdAt: string;
  doctor?: { license: string | null };
  pharmacy?: { license: string | null };
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<number | null>(null);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = () => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUsers(data.users);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const updateUserStatus = async (userId: number, newStatus: string) => {
    setUpdating(userId);
    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u)));
      } else {
        alert(data.error);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  // Filter users
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filter by tab
      if (activeFilter === "Pending" && user.status !== "PENDING") return false;
      if (activeFilter === "Approved" && user.status !== "APPROVED") return false;

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          user.name.toLowerCase().includes(query) ||
          (user.email && user.email.toLowerCase().includes(query)) ||
          (user.phone && user.phone.includes(query))
        );
      }
      return true;
    });
  }, [users, searchQuery, activeFilter]);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1180px] mx-auto pb-8">
      <div>
        <h2 className="text-[24px] font-semibold text-gray-900 dark:text-white mb-1.5">
          User management
        </h2>
        <p className="text-[14px] text-gray-500 dark:text-gray-400">
          Verify licenses and manage access for doctors, pharmacies, and diagnostics.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-[280px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-[16px] h-[16px] text-[#98A2B3]" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E4E7EB] dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-[14px] focus:outline-none focus:ring-2 focus:ring-[#155EEF]"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2">
          {["All", "Pending", "Approved"].map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`px-[14px] py-[7px] text-[13px] font-medium rounded-lg border transition-colors ${
                activeFilter === filter
                  ? "bg-[#EFF4FF] text-[#1849A9] border-[#B2CCFF] dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800"
                  : "bg-white text-[#667085] border-[#E4E7EB] hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-[#E4E7EB] dark:border-gray-700 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]" style={{ tableLayout: "fixed" }}>
             <colgroup>
              <col style={{ width: "22%" }} />
              <col style={{ width: "26%" }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "14%" }} />
              <col style={{ width: "18%" }} />
            </colgroup>
            <thead className="bg-[#FAFBFC] dark:bg-gray-900/50 border-b border-[#E4E7EB] dark:border-gray-700">
              <tr>
                <th className="px-[20px] py-[14px] text-[12px] font-semibold text-[#98A2B3] uppercase tracking-[0.02em]">Name</th>
                <th className="px-[20px] py-[14px] text-[12px] font-semibold text-[#98A2B3] uppercase tracking-[0.02em]">Contact</th>
                <th className="px-[20px] py-[14px] text-[12px] font-semibold text-[#98A2B3] uppercase tracking-[0.02em]">Role & license</th>
                <th className="px-[20px] py-[14px] text-[12px] font-semibold text-[#98A2B3] uppercase tracking-[0.02em]">Status</th>
                <th className="px-[20px] py-[14px] text-[12px] font-semibold text-[#98A2B3] uppercase tracking-[0.02em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E4E7EB] dark:divide-gray-700">
              {filteredUsers.map((user) => {
                const license = user.doctor?.license || user.pharmacy?.license || "N/A";
                
                return (
                  <tr key={user.id} className="hover:bg-[#FBFCFE] dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-[20px] py-[16px] align-middle">
                      <div className="flex items-center gap-[12px]">
                        <div className="w-[36px] h-[36px] rounded-full bg-[#EFF4FF] text-[#1849A9] dark:bg-blue-900/40 dark:text-blue-400 flex items-center justify-center text-[13px] font-semibold shrink-0">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-[14px] text-[#101828] dark:text-white leading-[1.4]">{user.name}</div>
                          <div className="text-[12.5px] text-[#98A2B3] leading-[1.4]">Joined {new Date(user.createdAt).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-[20px] py-[16px] align-middle">
                      <div className="text-[14px] text-[#101828] dark:text-gray-200 leading-[1.5]">{user.email || "-"}</div>
                      <div className="text-[13px] text-[#667085] leading-[1.5]">{user.phone || "-"}</div>
                    </td>
                    <td className="px-[20px] py-[16px] align-middle">
                      <div className="inline-block px-[10px] py-[3px] rounded-[6px] text-[12px] font-semibold bg-[#EFF4FF] text-[#1849A9] dark:bg-blue-900/30 dark:text-blue-400 mb-[6px] capitalize">
                        {user.role.toLowerCase()}
                      </div>
                      {user.role !== "PATIENT" && user.role !== "ADMIN" && (
                        <div className="text-[12.5px] text-[#667085] font-mono leading-[1.4]">License: {license}</div>
                      )}
                    </td>
                    <td className="px-[20px] py-[16px] align-middle">
                      {user.status === "PENDING" ? (
                        <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12.5px] font-semibold bg-[#FFFAEB] text-[#B54708] dark:bg-yellow-900/30 dark:text-yellow-500">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#F79009]"></span> Pending
                        </span>
                      ) : user.status === "APPROVED" ? (
                        <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12.5px] font-semibold bg-[#ECFDF3] text-[#027A48] dark:bg-green-900/30 dark:text-green-400">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#12B76A]"></span> Approved
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-[6px] px-[10px] py-[4px] rounded-full text-[12.5px] font-semibold bg-[#FEF3F2] text-[#B42318] dark:bg-red-900/30 dark:text-red-400">
                          <span className="w-[6px] h-[6px] rounded-full bg-[#F04438]"></span> Suspended
                        </span>
                      )}
                    </td>
                    <td className="px-[20px] py-[16px] align-middle text-right">
                      {user.role === "ADMIN" ? (
                        <span className="text-[13px] text-[#98A2B3] block text-right">—</span>
                      ) : (
                        <div className="flex flex-col gap-[6px] items-stretch max-w-[100px] ml-auto">
                          {user.status === "PENDING" && (
                            <button
                              onClick={() => updateUserStatus(user.id, "APPROVED")}
                              disabled={updating === user.id}
                              className="w-full text-center bg-[#12B76A] hover:bg-[#0E9F5C] text-white px-[14px] py-[7px] rounded-[7px] text-[13px] font-semibold whitespace-nowrap transition-colors"
                            >
                              Approve
                            </button>
                          )}
                          {(user.status === "APPROVED" || user.status === "PENDING") && (
                            <button
                              onClick={() => updateUserStatus(user.id, "SUSPENDED")}
                              disabled={updating === user.id}
                              className={`w-full text-center bg-white hover:bg-[#F2F4F7] border border-[#E4E7EB] px-[14px] py-[7px] rounded-[7px] text-[13px] font-semibold whitespace-nowrap transition-colors dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700 ${user.status === "APPROVED" ? "text-[#B42318]" : "text-[#667085] dark:text-gray-300"}`}
                            >
                              Suspend
                            </button>
                          )}
                          {user.status === "SUSPENDED" && (
                            <button
                              onClick={() => updateUserStatus(user.id, "APPROVED")}
                              disabled={updating === user.id}
                              className="w-full text-center bg-[#12B76A] hover:bg-[#0E9F5C] text-white px-[14px] py-[7px] rounded-[7px] text-[13px] font-semibold whitespace-nowrap transition-colors"
                            >
                              Restore
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-[20px] py-[32px] text-center text-[#98A2B3] text-[14px]">
                    No users found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
