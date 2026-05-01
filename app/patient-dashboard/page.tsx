"use client";

import { useRouter } from "next/navigation";

export default function PatientDashboard() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    localStorage.removeItem("token");
    localStorage.removeItem("role");

    router.replace("/login");
  };

  return (
    <div className="p-10">
      <h1 className="text-4xl mb-8">patient Dashboard</h1>

      <button
        onClick={handleLogout}
        className="bg-red-500 text-white px-5 py-2 rounded"
      >
        Logout
      </button>
    </div>
  );
}
