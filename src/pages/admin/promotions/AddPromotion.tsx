// src/pages/admin/promotions/AddPromotion.tsx
import React from 'react';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';
import AddPromotionPage from './AddPromotionPage';

const AddPromotion: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <AdminHeader
          user={user}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main>
          <AddPromotionPage />
        </main>
      </div>
    </div>
  );
};

export default AddPromotion;
