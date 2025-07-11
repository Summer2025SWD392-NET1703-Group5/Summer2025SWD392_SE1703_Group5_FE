import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/SimpleAuthContext";
import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminHeader from "../../components/admin/AdminHeader";
import { EnhancedDashboardProvider } from "../../contexts/EnhancedDashboardContext";

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div
        className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${
          sidebarCollapsed ? "ml-20" : "ml-64"
        }`}
      >
        <AdminHeader user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-6 bg-gradient-to-br from-slate-900/50 via-slate-800/50 to-slate-900/50 backdrop-blur-sm overflow-y-auto">
          <EnhancedDashboardProvider>
            <Outlet />
          </EnhancedDashboardProvider>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;