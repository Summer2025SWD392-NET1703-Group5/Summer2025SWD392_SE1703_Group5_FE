import React from "react";
import { Outlet } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import ManagerSidebar from "../../ManagerSidebar/ManagerSidebar";
import "./ManagerLayout.css";
import "react-toastify/dist/ReactToastify.css";

const ManagerLayout: React.FC = () => {
  return (
    <div className="manager-layout">
      <ManagerSidebar />
      <main className="manager-main-content">
        <Outlet />
      </main>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
        toastStyle={{
          fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        }}
      />
    </div>
  );
};

export default ManagerLayout;
