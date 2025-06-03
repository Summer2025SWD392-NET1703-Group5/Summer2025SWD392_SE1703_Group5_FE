import React from "react";
import { Outlet } from "react-router-dom";
import ManagerSidebar from "../../ManagerSidebar/ManagerSidebar";
import "./ManagerLayout.css";

const ManagerLayout: React.FC = () => {
  return (
    <div className="manager-layout">
      <ManagerSidebar />
      <main className="manager-main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default ManagerLayout;
