// src/pages/admin/cinema-rooms/AddCinemaRoom.tsx
import React from 'react';
import { useAuth } from '../../../contexts/SimpleAuthContext';
import AdminSidebar from '../../../components/admin/AdminSidebar';
import AdminHeader from '../../../components/admin/AdminHeader';
import CinemaRoomEditor from './CinemaRoomEditor';
import { useSearchParams } from 'react-router-dom';

const AddCinemaRoom: React.FC = () => {
  const { user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [searchParams] = useSearchParams();
  const cinemaId = searchParams.get('cinemaId');

  return (
    <div className="min-h-screen bg-slate-900 flex">
      <AdminSidebar collapsed={sidebarCollapsed} onToggle={setSidebarCollapsed} />

      <div className={`flex-1 transition-all duration-300 ${sidebarCollapsed ? 'ml-16' : 'ml-64'}`}>
        <AdminHeader
          user={user}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <main className="p-6">
          <CinemaRoomEditor />
        </main>
      </div>
    </div>
  );
};

export default AddCinemaRoom;
