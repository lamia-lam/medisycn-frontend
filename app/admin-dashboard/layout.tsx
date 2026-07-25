import React from "react";
import { DashboardLayout } from "../components/DashboardLayout";
import { Activity, Users, Settings } from "lucide-react";

const adminSidebarItems = [
  {
    icon: <Activity className="w-5 h-5" />,
    label: "Dashboard",
    href: "/admin-dashboard",
  },
  {
    icon: <Users className="w-5 h-5" />,
    label: "Users & Approvals",
    href: "/admin-dashboard/users",
  },
];

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayout sidebarItems={adminSidebarItems} userRole="Admin">
      {children}
    </DashboardLayout>
  );
}
