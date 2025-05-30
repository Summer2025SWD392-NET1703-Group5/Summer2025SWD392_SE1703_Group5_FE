import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

interface DashboardStats {
  totalUsers: number;
  totalMovies: number;
  totalBookings: number;
  totalRevenue: number;
  totalCinemas: number;
  activeShowtimes: number;
}

interface RecentBooking {
  id: string;
  movieTitle: string;
  userName: string;
  date: string;
  amount: number;
  status: "confirmed" | "pending" | "cancelled";
}

interface TopMovie {
  id: string;
  title: string;
  bookings: number;
  revenue: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMovies: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalCinemas: 0,
    activeShowtimes: 0,
  });

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [topMovies, setTopMovies] = useState<TopMovie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Mock data - replace with actual API calls
        setTimeout(() => {
          setStats({
            totalUsers: 1250,
            totalMovies: 45,
            totalBookings: 3420,
            totalRevenue: 125000,
            totalCinemas: 8,
            activeShowtimes: 120,
          });

          setRecentBookings([
            {
              id: "1",
              movieTitle: "Avengers: Endgame",
              userName: "John Doe",
              date: "2025-05-29",
              amount: 15.99,
              status: "confirmed",
            },
            {
              id: "2",
              movieTitle: "Spider-Man: No Way Home",
              userName: "Jane Smith",
              date: "2025-05-29",
              amount: 12.99,
              status: "confirmed",
            },
            {
              id: "3",
              movieTitle: "The Batman",
              userName: "Mike Johnson",
              date: "2025-05-28",
              amount: 14.99,
              status: "pending",
            },
            {
              id: "4",
              movieTitle: "Doctor Strange",
              userName: "Sarah Wilson",
              date: "2025-05-28",
              amount: 13.99,
              status: "confirmed",
            },
            {
              id: "5",
              movieTitle: "Black Panther",
              userName: "Tom Brown",
              date: "2025-05-27",
              amount: 15.99,
              status: "cancelled",
            },
          ]);

          setTopMovies([
            { id: "1", title: "Avengers: Endgame", bookings: 450, revenue: 6750 },
            { id: "2", title: "Spider-Man: No Way Home", bookings: 380, revenue: 4940 },
            { id: "3", title: "The Batman", bookings: 320, revenue: 4800 },
            { id: "4", title: "Doctor Strange", bookings: 290, revenue: 4060 },
          ]);

          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      confirmed: "status-confirmed",
      pending: "status-pending",
      cancelled: "status-cancelled",
    };
    return <span className={`status-badge ${statusClasses[status as keyof typeof statusClasses]}`}>{status}</span>;
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Admin Dashboard</h1>
          <p>Welcome back! Here's what's happening at your cinema today.</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary">
            <span>📊</span>
            Generate Report
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon users-icon">👥</div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-number">{stats.totalUsers.toLocaleString()}</p>
            <span className="stat-change positive">+12% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon movies-icon">🎬</div>
          <div className="stat-content">
            <h3>Active Movies</h3>
            <p className="stat-number">{stats.totalMovies}</p>
            <span className="stat-change positive">+3 new releases</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bookings-icon">🎫</div>
          <div className="stat-content">
            <h3>Total Bookings</h3>
            <p className="stat-number">{stats.totalBookings.toLocaleString()}</p>
            <span className="stat-change positive">+8% this week</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon revenue-icon">💰</div>
          <div className="stat-content">
            <h3>Total Revenue</h3>
            <p className="stat-number">${stats.totalRevenue.toLocaleString()}</p>
            <span className="stat-change positive">+15% from last month</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon cinemas-icon">🏢</div>
          <div className="stat-content">
            <h3>Cinema Locations</h3>
            <p className="stat-number">{stats.totalCinemas}</p>
            <span className="stat-change neutral">Across 5 cities</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon showtimes-icon">🕐</div>
          <div className="stat-content">
            <h3>Active Showtimes</h3>
            <p className="stat-number">{stats.activeShowtimes}</p>
            <span className="stat-change neutral">Today's schedule</span>
          </div>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-section">
          <div className="recent-bookings">
            <div className="section-header">
              <h2>Recent Bookings</h2>
              <Link to="/admin/bookings/all" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="bookings-table">
              <table>
                <thead>
                  <tr>
                    <th>Movie</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map((booking) => (
                    <tr key={booking.id}>
                      <td className="movie-title">{booking.movieTitle}</td>
                      <td>{booking.userName}</td>
                      <td>{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="amount">${booking.amount}</td>
                      <td>{getStatusBadge(booking.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="dashboard-sidebar">
          <div className="top-movies">
            <div className="section-header">
              <h2>Top Movies</h2>
              <Link to="/admin/reports/movies" className="view-all-link">
                View All →
              </Link>
            </div>
            <div className="top-movies-list">
              {topMovies.map((movie, index) => (
                <div key={movie.id} className="top-movie-item">
                  <div className="movie-rank">#{index + 1}</div>
                  <div className="movie-info">
                    <h4>{movie.title}</h4>
                    <p>{movie.bookings} bookings</p>
                    <p className="movie-revenue">${movie.revenue.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
