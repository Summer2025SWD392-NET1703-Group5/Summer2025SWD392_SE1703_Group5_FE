import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Thêm import useNavigate
import Header from "../../components/Header/Header";
import HeaderLoginUser from "../../components/Header-Login/Header-Login-User";
import Footer from "../../components/Footer/Footer";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  const navigate = useNavigate(); // Khởi tạo useNavigate
  const role = localStorage.getItem("role");
  console.log("Current user role from localStorage:", role);

  // Điều hướng nếu role là Admin
  useEffect(() => {
    if (role === "Admin") {
      console.log("User role is Admin, navigating to /admin");
      navigate("/admin");
    } else if (role === "Manager") {
      console.log("User role is Manager, navigating to /manager");
      navigate("/manager");
    }
  }, [role, navigate]); // Phụ thuộc vào role và navigate

  const renderHeader = () => {
    if (!showNavbar) return null;
    console.log("Rendering header with role:", role);
    switch (role) {
      case "Customer":
        return <HeaderLoginUser />;
      default:
        return <Header />;
    }
  };

  return (
    <div className="homepage-root">
      <div className="homepage-content">
        {renderHeader()}
        <Outlet />
        {children}
      </div>
      <Footer />
    </div>
  );
};

export default Layout;