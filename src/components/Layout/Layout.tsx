import React, { useState, useEffect } from "react";
import Header from "../../components/Header/Header";
import HeaderLoginUser from "../../components/Header-Login/Header-Login-User";
import Footer from "../../components/Footer/Footer";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  const role = localStorage.getItem("role");
  console.log("Current user role from localStorage:", role);

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
