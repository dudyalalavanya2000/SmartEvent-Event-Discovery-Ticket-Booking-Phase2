import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchDashboard = async () => {
      try {
        const response = await api.get("/admin/dashboard");

        if (isMounted) {
          setStats(response.data);
        }
      } catch (error) {
        console.error("Failed to load admin dashboard:", error);

        if (isMounted) {
          const message =
            error.response?.data?.detail ||
            "Failed to load admin dashboard";

          toast.error(message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatCurrency = (value) =>
    `₹${Number(value || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  if (loading) {
    return (
      <div className="page-container">
        <h1>Admin Dashboard</h1>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="page-container">
        <h1>Admin Dashboard</h1>
        <p>Unable to load dashboard data. Please refresh.</p>
      </div>
    );
  }

  const metrics = [
    { label: "Total Users", value: stats.total_users ?? 0 },
    { label: "Total Events", value: stats.total_events ?? 0 },
    { label: "Tickets Sold", value: stats.total_tickets_sold ?? 0 },
    { label: "Total Bookings", value: stats.total_bookings ?? 0 },
    {
      label: "Total Revenue",
      value: formatCurrency(stats.total_revenue),
    },
  ];

  return (
    <div className="page-container">
      <div style={{ marginBottom: "30px" }}>
        <h1>Admin Dashboard</h1>
        <p>Monitor SmartEvent users, events, bookings, and revenue.</p>
      </div>

      <div style={gridStyle}>
        {metrics.map((metric) => (
          <div className="card" key={metric.label}>
            <h3>{metric.label}</h3>
            <p style={valueStyle}>{metric.value}</p>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <div className="card">
          <h2>Daily Sales</h2>

          {stats.daily_sales?.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={cellStyle}>Date</th>
                    <th style={cellStyle}>Tickets Sold</th>
                    <th style={cellStyle}>Bookings</th>
                    <th style={cellStyle}>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.daily_sales.map((item) => (
                    <tr key={item.date}>
                      <td style={cellStyle}>{item.date}</td>
                      <td style={cellStyle}>{item.tickets_sold}</td>
                      <td style={cellStyle}>{item.bookings}</td>
                      <td style={cellStyle}>
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No daily sales data available.</p>
          )}
        </div>

        <div className="card">
          <h2>Popular Events</h2>

          {stats.popular_events?.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={cellStyle}>Event</th>
                    <th style={cellStyle}>Tickets Sold</th>
                    <th style={cellStyle}>Bookings</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.popular_events.map((event) => (
                    <tr key={event.event_id}>
                      <td style={cellStyle}>{event.event_title}</td>
                      <td style={cellStyle}>{event.tickets_sold}</td>
                      <td style={cellStyle}>{event.bookings}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No popular events available.</p>
          )}
        </div>
      </div>
    </div>
  );
}

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
  gap: "20px",
};

const sectionStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "25px",
};

const valueStyle = {
  fontSize: "28px",
  fontWeight: "700",
  marginTop: "10px",
};

const tableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "15px",
};

const cellStyle = {
  padding: "10px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

export default AdminDashboard;
