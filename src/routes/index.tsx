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
import ManageCinemaBranch from "../pages/ManageCinemaBranch/ManageCinemaBranch";
import ManageShowtime from "../pages/ManageShowtime/ManageShowtime";
import ManageMoviePage from "../pages/ManageMovie/ManageMoviePage";
import ManagePromotion from "../pages/ManagePromotion/ManagePromotion";
import ManagerLayout from "../components/Layout/ManagerLayout/ManagerLayout";
import ManageCinemaRoom from "../pages/ManageCinemaRoom/ManageCinemaRoom";
import BookingMovie from "../pages/BookingMovie/BookingMovie";
import QRCodeScanner from "../pages/QRCodeScan/QRCodeScan";
import ManagerDashboard from "../pages/ManagerDashboard/ManagerDashboard";
import ShowtimesPage from "../pages/ShowtimesPage/ShowtimesPage";
import StaffBooking from "../pages/StaffBooking/StaffBooking";


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
        <Route path="/movie/:id" element={<MovieDetail />} />
        <Route path="/booking" element={<BookingMovie />} />
        <Route path="/showtimes" element={<ShowtimesPage />} />
        {/* Staff routes inside main Layout */}
        <Route path="/staff/scan" element={<QRCodeScanner />} />
      </Route>

      {/* Staff routes */}
      <Route element={<Layout key={location.pathname} showNavbar={true} />}>
        <Route path="/staff" element={<StaffBooking />} />
        <Route path="/staff/booking" element={<StaffBooking />} />
      </Route>

      {/* Admin routes with nested structure */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="users" element={<ManageUser />} />
        <Route path="movies" element={<ManageMoviePage />} />
        <Route path="movies/all" element={<div>All Movies</div>} />
        <Route path="movies/add" element={<div>Add Movie</div>} />
        <Route path="movies/genres" element={<div>Genres</div>} />
        <Route path="movies/ratings" element={<div>Ratings</div>} />
        <Route path="cinemas" element={<ManageCinemaBranch />} />
        <Route path="promotions" element={<ManagePromotion />} />
      </Route>

      {/* Manager routes with nested structure */}
      <Route path="/manager" element={<ManagerLayout />}>

        <Route index element={<ManageCinemaRoom/>} />

        <Route index element={<ManagerDashboard />} />
        <Route path="manager-dashboard" element={<ManagerDashboard />} />

        <Route path="showtimes" element={<ManageShowtime />} />
        <Route path="cinemarooms" element={<ManageCinemaRoom />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
