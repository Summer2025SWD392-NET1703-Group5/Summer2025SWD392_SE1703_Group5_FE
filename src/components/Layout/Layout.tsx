import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/Header/Header";
import HeaderLoginUser from "../../components/Header-Login/Header-Login-User";
import HeaderLoginStaff from "../Header-Login/Header-Login-Staff";
import Footer from "../../components/Footer/Footer";
import { Outlet } from "react-router-dom";

interface LayoutProps {
  children?: React.ReactNode;
  showNavbar?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showNavbar = true }) => {
  const navigate = useNavigate();
  const role = localStorage.getItem("role");
  console.log("Current user role from localStorage:", role);

  // Only redirect on initial login, not on every render
  useEffect(() => {
    const currentPath = window.location.pathname;

    // Only redirect if user is on root path or login path
    if (currentPath === "/" || currentPath === "/login") {
      if (role === "Admin") {
        navigate("/admin");
      } else if (role === "Manager") {
        navigate("/manager");
      } else if (role === "Staff") {
        navigate("/staff");
      }
    }
  }, [role, navigate]); // Add role and navigate back to dependencies

  const renderHeader = () => {
    if (!showNavbar) return null;
    console.log("Rendering header with role:", role);
    switch (role) {
      case "Customer":
        return <HeaderLoginUser />;
      case "Staff":
        return <HeaderLoginStaff />;
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
