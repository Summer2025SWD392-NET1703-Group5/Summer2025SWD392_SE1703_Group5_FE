import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import Layout from "../components/Layout/Layout";
import { useLocation } from "react-router-dom";
import AdminLayout from "../components/Layout/AdminLayout/AdminLayout";
import Dashboard from "../pages/Dashboard/Dashboard";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      <Route element={<Layout key={location.pathname} showNavbar={true} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
      </Route>

      {/* Admin routes with nested structure */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users/*" element={<div />} />
        <Route path="users/all" element={<div />} />
        <Route path="users/add" element={<div>Add User</div>} />
        <Route path="users/roles" element={<div>User Roles</div>} />

        <Route path="movies/*" element={<div>Manage Movies</div>} />
        <Route path="movies/all" element={<div>All Movies</div>} />
        <Route path="movies/add" element={<div>Add Movie</div>} />
        <Route path="movies/genres" element={<div>Genres</div>} />
        <Route path="movies/ratings" element={<div>Ratings</div>} />

      </Route>
    </Routes>
  );
};

export default AppRoutes;