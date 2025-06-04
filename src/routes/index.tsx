import { Routes, Route } from "react-router-dom";
import HomePage from "../pages/HomePage/HomePage";
import LoginPage from "../pages/LoginPage/LoginPage";
import Profile from "../pages/ProfilePage/ProfilePage";
import Layout from "../components/Layout/Layout";
import { useLocation } from "react-router-dom";
import ViewMoviePage from "../pages/ViewMoviePage/ViewMoviePage";
import AdminLayout from "../components/Layout/AdminLayout/AdminLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import MovieDetail from "../pages/MovieDetail/MovieDetail";
import ManageUser from "../pages/ManageUser/ManageUser";
import ManageCinemaRoom from "../pages/ManageCinemaRoom/ManageCinemaRoom";
import ManageMoviePage from "../pages/ManageMovie/ManageMoviePage";
import ManagePromotion from "../pages/ManagePromotion/ManagePromotion";
import ManagerLayout from "../components/Layout/ManagerLayout/ManagerLayout";
import ManageCinemaBranch from "../pages/ManageCinemaBranch/ManageCinemaBranch";

const AppRoutes = () => {
  const location = useLocation();

  return (
    <Routes>
      {/* Public routes with layout */}
      <Route element={<Layout key={location.pathname} showNavbar={true} />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movie" element={<ViewMoviePage />} />
        <Route path="/movieDetail/:id" element={<MovieDetail />} />
      </Route>

      {/* Admin routes with nested structure */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users/*" element={<ManageUser />} />
        <Route path="users/all" element={<ManageUser />} />
        <Route path="users/add" element={<div>Add User</div>} />
        <Route path="users/roles" element={<div>User Roles</div>} />

        <Route path="movies/*" element={<ManageMoviePage />} />
        <Route path="movies/all" element={<div>All Movies</div>} />
        <Route path="movies/add" element={<div>Add Movie</div>} />
        <Route path="movies/genres" element={<div>Genres</div>} />
        <Route path="movies/ratings" element={<div>Ratings</div>} />
        <Route path="cinemas" element={<ManageCinemaBranch />} />
        <Route path="promotions" element={<ManagePromotion />} />
      </Route>

      {/* Manager routes with nested structure */}
      <Route path="/manager" element={<ManagerLayout />}>
        <Route index element={<ManageCinemaRoom />} />
        <Route path="cinemarooms" element={<ManageCinemaRoom />} />{" "}
        {/* Added nested route */}
      </Route>
    </Routes>
  );
};

export default AppRoutes;
