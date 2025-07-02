import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/SimpleAuthContext';
import AdminSidebar from '../../components/admin/AdminSidebar';
import AdminHeader from '../../components/admin/AdminHeader';
import { EnhancedDashboardProvider } from '../../contexts/EnhancedDashboardContext';

const AdminLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-500 ease-in-out ${sidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <AdminHeader user={user} onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 p-6 bg-slate-800 overflow-y-auto">
          <EnhancedDashboardProvider>
            <Outlet />
          </EnhancedDashboardProvider>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout; 