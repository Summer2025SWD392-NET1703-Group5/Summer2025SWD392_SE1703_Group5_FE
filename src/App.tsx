import React, { Suspense, memo, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster, toast } from "react-hot-toast";
import { SimpleAuthProvider, useAuth } from "./contexts/SimpleAuthContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import LoadingProvider from "./contexts/LoadingContext";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ErrorBoundary from "./components/ErrorBoundary";
import FullScreenLoader from "./components/FullScreenLoader";
import StaffProtectedApp from "./components/StaffProtectedApp";

// Import auth components
import { GuestAllowedRoute, AdminRoute, AuthRequiredRoute } from "./components/auth";
import AdminOnlyRoute from "./components/auth/AdminOnlyRoute";
import { AssignedManagerRoute } from "./components/admin/routes/AssignedManagerRoute";

// Public Pages
import HomePage from "./pages/HomePage";
import NotFound from "./pages/NotFound";
import PromotionsPage from "./pages/PromotionsPage";

// Định nghĩa loader chung cho toàn bộ ứng dụng
const AppLoader = <FullScreenLoader text="Đang tải..." />;
const AdminLoader = <FullScreenLoader text="Đang tải trang quản trị..." />;

// Dashboard Route Wrapper - Role-based dashboard access
const DashboardRouteWrapper: React.FC = () => {
  const { user } = useAuth();

  // Only Admin users can access dashboard
  if (user?.role === "Admin") {
    return <LazyWrapper component={AdminPages.Dashboard} fallback={AdminLoader} />;
  } else if (user?.role === "Manager") {
    // Redirect managers to movies management as their default page
    return <Navigate to="/admin/movies" replace />;
  }

  // Default fallback - redirect to login if no valid role
  return <Navigate to="/login" replace />;
};

// Admin Pages - Nhóm các trang admin theo chức năng để tối ưu code splitting
const AdminPages = {
  Layout: React.lazy(() => import(/* webpackChunkName: "admin-layout" */ "./pages/admin/AdminLayout")),
  Dashboard: React.lazy(() => import(/* webpackChunkName: "admin-core" */ "./pages/admin/AdminDashboard")),
  Analytics: React.lazy(() => import(/* webpackChunkName: "admin-core" */ "./pages/admin/Analytics")),

  // Movie management
  MovieManagement: React.lazy(
    () => import(/* webpackChunkName: "admin-movies" */ "./pages/admin/movies/MovieManagement")
  ),
  AddMovie: React.lazy(() => import(/* webpackChunkName: "admin-movies" */ "./pages/admin/movies/AddMovie")),
  EditMovie: React.lazy(() => import(/* webpackChunkName: "admin-movies" */ "./pages/admin/movies/EditMovie")),
  MovieDetail: React.lazy(() => import(/* webpackChunkName: "admin-movies" */ "./pages/admin/movies/MovieDetail")),

  // Customer management
  CustomersList: React.lazy(
    () => import(/* webpackChunkName: "admin-customers" */ "./pages/admin/customers/CustomersList")
  ),
  AddCustomer: React.lazy(
    () => import(/* webpackChunkName: "admin-customers" */ "./pages/admin/customers/AddCustomer")
  ),
  EditCustomer: React.lazy(
    () => import(/* webpackChunkName: "admin-customers" */ "./pages/admin/customers/EditCustomer")
  ),
  CustomerReviews: React.lazy(
    () => import(/* webpackChunkName: "admin-customers" */ "./pages/admin/customers/CustomerReviews")
  ),

  // Cinema management
  CinemasList: React.lazy(() => import(/* webpackChunkName: "admin-cinemas" */ "./pages/admin/cinemas/CinemasList")),
  AddCinema: React.lazy(() => import(/* webpackChunkName: "admin-cinemas" */ "./pages/admin/cinemas/AddCinema")),
  CinemaEditor: React.lazy(() => import(/* webpackChunkName: "admin-cinemas" */ "./pages/admin/cinemas/CinemaEditor")),

  // Room management
  CinemaRoomsList: React.lazy(
    () => import(/* webpackChunkName: "admin-rooms" */ "./pages/admin/cinema-rooms/CinemaRoomsList")
  ),
  CinemaRoomEditor: React.lazy(
    () => import(/* webpackChunkName: "admin-rooms" */ "./pages/admin/cinema-rooms/CinemaRoomEditor")
  ),
  SeatLayoutPage: React.lazy(
    () => import(/* webpackChunkName: "admin-rooms" */ "./pages/admin/cinema-rooms/SeatLayoutPage")
  ),

  // Showtimes management
  ShowtimesList: React.lazy(
    () => import(/* webpackChunkName: "admin-showtimes" */ "./pages/admin/showtimes/ShowtimesList")
  ),
  AddShowtime: React.lazy(
    () => import(/* webpackChunkName: "admin-showtimes" */ "./pages/admin/showtimes/AddShowtime")
  ),
  EditShowtime: React.lazy(
    () => import(/* webpackChunkName: "admin-showtimes" */ "./pages/admin/showtimes/EditShowtime")
  ),
  ShowtimeDetail: React.lazy(
    () => import(/* webpackChunkName: "admin-showtimes" */ "./pages/admin/showtimes/ShowtimeDetail")
  ),

  // Bookings management
  BookingsList: React.lazy(
    () => import(/* webpackChunkName: "admin-bookings" */ "./pages/admin/bookings/BookingsList")
  ),

  // Ticket Pricing management
  TicketPricingManagement: React.lazy(
    () => import(/* webpackChunkName: "admin-pricing" */ "./pages/admin/ticket-pricing/TicketPricingManagement")
  ),

  // Promotions management
  PromotionsList: React.lazy(
    () => import(/* webpackChunkName: "admin-promotions" */ "./pages/admin/promotions/PromotionsList")
  ),
  AddPromotion: React.lazy(
    () => import(/* webpackChunkName: "admin-promotions" */ "./pages/admin/promotions/AddPromotionPage")
  ),
  EditPromotion: React.lazy(
    () => import(/* webpackChunkName: "admin-promotions" */ "./pages/admin/promotions/EditPromotion")
  ),

  // Reports management
  DailyReports: React.lazy(
    () => import(/* webpackChunkName: "admin-reports" */ "./pages/admin/reports/DailyReportsPage")
  ),
  MonthlyReports: React.lazy(
    () => import(/* webpackChunkName: "admin-reports" */ "./pages/admin/reports/MonthlyReportsPage")
  ),
  CustomReports: React.lazy(
    () => import(/* webpackChunkName: "admin-reports" */ "./pages/admin/reports/CustomReportsPage")
  ),
};

// Public Pages - Nhóm các trang public theo chức năng
const PublicPages = {
  MovieList: React.lazy(() => import(/* webpackChunkName: "public-movies" */ "./pages/MovieList")),
  MovieDetail: React.lazy(() => import(/* webpackChunkName: "public-movies" */ "./pages/MovieDetail")),

  // Booking flow
  BookingPage: React.lazy(() => import(/* webpackChunkName: "booking-flow" */ "./pages/BookingPage")),
  ShowtimePage: React.lazy(() => import(/* webpackChunkName: "booking-flow" */ "./pages/ShowtimePage")),
  SeatSelection: React.lazy(() => import(/* webpackChunkName: "booking-flow" */ "./pages/SeatSelectionPage")),
  PaymentPage: React.lazy(() => import(/* webpackChunkName: "booking-flow" */ "./pages/PaymentPage")),
  BookingSuccess: React.lazy(() => import(/* webpackChunkName: "booking-flow" */ "./pages/BookingSuccessPage")),

  // Cinema info
  CinemaList: React.lazy(() => import(/* webpackChunkName: "public-cinemas" */ "./pages/CinemaListPage")),
  CinemaDetail: React.lazy(() => import(/* webpackChunkName: "public-cinemas" */ "./pages/CinemaDetailPage")),

  // User profile
  ProfileLayout: React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/ProfileLayout")),
  ProfileInfo: React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/ProfileInfo")),
  BookingHistory: React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/BookingHistory")),
  MyTickets: React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/components/MyTickets")),
  TicketDetail: React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/TicketDetail")),
  Notifications: React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/components/Notifications")),
  Security: React.lazy(() => import(/* webpackChunkName: "profile" */ "./pages/profile/components/Security")),

  // Auth pages
  Login: React.lazy(() => import(/* webpackChunkName: "auth" */ "./pages/LoginPage")),
  Register: React.lazy(() => import(/* webpackChunkName: "auth" */ "./pages/RegisterPage")),
  RegisterSuccess: React.lazy(() => import(/* webpackChunkName: "auth" */ "./pages/RegisterSuccessPage")),
  ForgotPassword: React.lazy(() => import(/* webpackChunkName: "auth" */ "./pages/ForgotPasswordPage")),

  // Legal
  Terms: React.lazy(() => import(/* webpackChunkName: "legal" */ "./pages/TermsPage")),
  Privacy: React.lazy(() => import(/* webpackChunkName: "legal" */ "./pages/PrivacyPage")),

  // Staff
  TicketScanner: React.lazy(() => import(/* webpackChunkName: "staff" */ "./pages/staff/TicketScanner")),
};

// Helper component để xử lý lazy loading với ErrorBoundary
const LazyWrapper = ({
  component: Component,
  fallback = AppLoader,
}: {
  component: React.ComponentType<any>;
  fallback?: React.ReactNode;
}) => (
  <ErrorBoundary>
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  </ErrorBoundary>
);

// Tối ưu Provider để tránh re-render không cần thiết
const OptimizedProviders = memo(({ children }: { children: React.ReactNode }) => {
  console.log("[App] Khởi tạo OptimizedProviders - Chỉ render 1 lần khi app khởi động");

  return (
    <NotificationProvider>
      <DashboardProvider>
        <LoadingProvider>{children}</LoadingProvider>
      </DashboardProvider>
    </NotificationProvider>
  );
});

OptimizedProviders.displayName = "OptimizedProviders";

function App() {
  // Thêm CSS để giới hạn toast
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .toast-container-limited > div:nth-child(n+4) {
        display: none !important;
      }
      .toast-container-limited {
        max-height: 300px;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <ErrorBoundary>
      <SimpleAuthProvider>
        <OptimizedProviders>
          <StaffProtectedApp>
            <div className="App min-h-screen bg-slate-900 flex flex-col">
              {/* Toast notifications */}
              <Toaster
                position="top-right"
                containerStyle={{
                  top: 20,
                  right: 20,
                  maxHeight: '300px', // Giới hạn chiều cao để chỉ hiển thị ~3 toast
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column-reverse', // Toast mới nhất ở trên
                }}
                containerClassName="toast-container-limited"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: "#1E293B",
                    color: "#F8FAFC",
                    border: "1px solid #334155",
                    marginBottom: '8px',
                  },
                  success: {
                    iconTheme: {
                      primary: "#10B981",
                      secondary: "#F8FAFC",
                    },
                  },
                  error: {
                    iconTheme: {
                      primary: "#EF4444",
                      secondary: "#F8FAFC",
                    },
                  },
                }}
              />

              <Routes>
                {/* Staff Routes - Standalone without layout */}
                <Route
                  path="/staff/scanner"
                  element={
                    <Suspense fallback={AppLoader}>
                      <AuthRequiredRoute allowAdminAccess={true} requireCinemaAssignment={true}>
                        <LazyWrapper component={PublicPages.TicketScanner} />
                      </AuthRequiredRoute>
                    </Suspense>
                  }
                />

                {/* Admin Routes with persistent layout */}
                <Route
                  path="/admin/*"
                  element={
                    <AdminRoute>
                      <Suspense fallback={AdminLoader}>
                        <LazyWrapper component={AdminPages.Layout} fallback={AdminLoader} />
                      </Suspense>
                    </AdminRoute>
                  }
                >
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route
                    path="dashboard"
                    element={
                      <Suspense fallback={AdminLoader}>
                        <DashboardRouteWrapper />
                      </Suspense>
                    }
                  />
                  <Route
                    path="movies"
                    element={
                      <Suspense fallback={AdminLoader}>
                        <LazyWrapper component={AdminPages.MovieManagement} fallback={AdminLoader} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="movies/add"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.AddMovie} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="movies/:id/edit"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.EditMovie} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="movies/:id"
                    element={
                      <Suspense fallback={AdminLoader}>
                        <LazyWrapper component={AdminPages.MovieDetail} fallback={AdminLoader} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="users"
                    element={
                      <Suspense fallback={AdminLoader}>
                        <LazyWrapper component={AdminPages.CustomersList} fallback={AdminLoader} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="analytics"
                    element={
                      <Suspense fallback={AdminLoader}>
                        <LazyWrapper component={AdminPages.Analytics} fallback={AdminLoader} />
                      </Suspense>
                    }
                  />

                  {/* Other admin routes */}
                  <Route
                    path="bookings"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.BookingsList} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="ticket-pricing"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.TicketPricingManagement} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="customers"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.CustomersList} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="customers/new"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.AddCustomer} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="customers/:id"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.EditCustomer} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="customers/reviews"
                    element={
                      <Suspense fallback={AdminLoader}>
                        <LazyWrapper component={AdminPages.CustomerReviews} fallback={AdminLoader} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="cinemas"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.CinemasList} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="cinemas/new"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.AddCinema} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="cinemas/:id/edit"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.CinemaEditor} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="cinema-rooms"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.CinemaRoomsList} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="cinema-rooms/new"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.CinemaRoomEditor} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="cinema-rooms/:id"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.CinemaRoomEditor} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="cinema-rooms/:roomId/seats"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.SeatLayoutPage} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="showtimes"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.ShowtimesList} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="showtimes/add"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.AddShowtime} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="showtimes/:id"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.EditShowtime} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="showtimes/:id/detail"
                    element={
                      <AssignedManagerRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.ShowtimeDetail} fallback={AdminLoader} />
                        </Suspense>
                      </AssignedManagerRoute>
                    }
                  />
                  <Route
                    path="promotions"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.PromotionsList} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="promotions/add"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.AddPromotion} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="promotions/:id"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.EditPromotion} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />

                  {/* Reports routes */}
                  <Route
                    path="reports/daily"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.DailyReports} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="reports/monthly"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.MonthlyReports} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                  <Route
                    path="reports/custom"
                    element={
                      <AdminOnlyRoute>
                        <Suspense fallback={AdminLoader}>
                          <LazyWrapper component={AdminPages.CustomReports} fallback={AdminLoader} />
                        </Suspense>
                      </AdminOnlyRoute>
                    }
                  />
                </Route>

                {/* Public Routes with Header/Footer */}
                <Route
                  path="/*"
                  element={
                    <GuestAllowedRoute>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Suspense fallback={AppLoader}>
                            <Routes>
                              <Route path="/" element={<HomePage />} />
                              <Route path="/promotions" element={<PromotionsPage />} />
                              <Route path="/login" element={<LazyWrapper component={PublicPages.Login} />} />
                              <Route path="/register" element={<LazyWrapper component={PublicPages.Register} />} />
                              <Route
                                path="/register-success"
                                element={<LazyWrapper component={PublicPages.RegisterSuccess} />}
                              />
                              <Route
                                path="/forgot-password"
                                element={<LazyWrapper component={PublicPages.ForgotPassword} />}
                              />
                              <Route path="/movies" element={<LazyWrapper component={PublicPages.MovieList} />} />
                              <Route
                                path="/movies/:id/:slug"
                                element={<LazyWrapper component={PublicPages.MovieDetail} />}
                              />
                              <Route path="/movies/:id" element={<LazyWrapper component={PublicPages.MovieDetail} />} />
                              <Route path="/cinemas" element={<LazyWrapper component={PublicPages.CinemaList} />} />
                              <Route
                                path="/cinemas/:id"
                                element={<LazyWrapper component={PublicPages.CinemaDetail} />}
                              />
                              <Route path="/showtimes" element={<LazyWrapper component={PublicPages.ShowtimePage} />} />
                              <Route
                                path="/showtimes/:id"
                                element={<LazyWrapper component={PublicPages.ShowtimePage} />}
                              />
                              <Route path="/terms" element={<LazyWrapper component={PublicPages.Terms} />} />
                              <Route path="/privacy" element={<LazyWrapper component={PublicPages.Privacy} />} />
                              <Route path="*" element={<NotFound />} />
                            </Routes>
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    </GuestAllowedRoute>
                  }
                />

                {/* Booking Flow Routes - Accessible by authenticated users */}
                <Route
                  path="/booking/:showtimeId"
                  element={
                    <AuthRequiredRoute>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Suspense fallback={AppLoader}>
                            <LazyWrapper component={PublicPages.BookingPage} />
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    </AuthRequiredRoute>
                  }
                />

                <Route
                  path="/booking/:showtimeId/seats"
                  element={
                    <AuthRequiredRoute>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Suspense fallback={AppLoader}>
                            <LazyWrapper component={PublicPages.SeatSelection} />
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    </AuthRequiredRoute>
                  }
                />

                {/* Payment route removed - now integrated into BookingPage */}
                {/*
                <Route
                  path="/payment/:bookingId"
                  element={
                    <AuthRequiredRoute>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Suspense fallback={AppLoader}>
                            <LazyWrapper component={PublicPages.PaymentPage} />
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    </AuthRequiredRoute>
                  }
                />
                */}

                <Route
                  path="/booking-success/:bookingId"
                  element={
                    <AuthRequiredRoute>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Suspense fallback={AppLoader}>
                            <LazyWrapper component={PublicPages.BookingSuccess} />
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    </AuthRequiredRoute>
                  }
                />

                {/* User Profile Routes */}
                <Route
                  path="/profile"
                  element={
                    <AuthRequiredRoute>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Suspense fallback={AppLoader}>
                            <LazyWrapper component={PublicPages.ProfileLayout} />
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    </AuthRequiredRoute>
                  }
                >
                  <Route
                    index
                    element={
                      <Suspense fallback={AppLoader}>
                        <LazyWrapper component={PublicPages.ProfileInfo} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="bookings"
                    element={
                      <Suspense fallback={AppLoader}>
                        <LazyWrapper component={PublicPages.BookingHistory} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="notifications"
                    element={
                      <Suspense fallback={AppLoader}>
                        <LazyWrapper component={PublicPages.Notifications} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="tickets"
                    element={
                      <Suspense fallback={AppLoader}>
                        <LazyWrapper component={PublicPages.MyTickets} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="tickets/:id"
                    element={
                      <Suspense fallback={AppLoader}>
                        <LazyWrapper component={PublicPages.TicketDetail} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="security"
                    element={
                      <Suspense fallback={AppLoader}>
                        <LazyWrapper component={PublicPages.Security} />
                      </Suspense>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <Suspense fallback={AppLoader}>
                        <LazyWrapper component={PublicPages.Security} />
                      </Suspense>
                    }
                  />
                </Route>

                {/* Other Auth Required Routes */}
                <Route
                  path="/my-tickets"
                  element={
                    <AuthRequiredRoute>
                      <>
                        <Header />
                        <main className="flex-1">
                          <Suspense fallback={AppLoader}>
                            <LazyWrapper component={PublicPages.MyTickets} />
                          </Suspense>
                        </main>
                        <Footer />
                      </>
                    </AuthRequiredRoute>
                  }
                />

                {/* Legacy Routes - Redirect */}
                <Route path="/tickets" element={<Navigate to="/my-tickets" replace />} />
              </Routes>
            </div>
          </StaffProtectedApp>
        </OptimizedProviders>
      </SimpleAuthProvider>
    </ErrorBoundary>
  );
}

export default App;
