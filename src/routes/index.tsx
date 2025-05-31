import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import Profile from "../pages/ProfilePage/ProfilePage"; // Import trang Profile
import Layout from "../components/Layout/Layout";
import { useLocation } from "react-router-dom";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route element={<Layout key={location.pathname} showNavbar={true} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<Profile />} /> 
      </Route>
    </Routes>
  );
};

export default AppRoutes;