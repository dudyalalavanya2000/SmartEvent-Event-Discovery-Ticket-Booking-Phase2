import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

function AdminAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchAnalytics = async () => {
      try {
        const response = await api.get("/admin/dashboard");

        if (isMounted) {
          setAnalytics(response.data);
        }
      } catch (error) {
        console.error("Failed to load admin analytics:", error);

        if (isMounted) {
          toast.error(
            error.response?.data?.detail ||
              "Failed to load analytics"
          );
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchAnalytics();

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
        <h1>Admin Analytics</h1>
        <p>Loading analytics...</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="page-container">
        <h1>Admin Analytics</h1>
        <p>Unable to load analytics. Please refresh the page.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Admin Analytics</h1>
      <p>
        Analyze booking trends, ticket sales, and event revenue.
      </p>

      <section style={sectionStyle}>
        <div className="card">
          <h2>Monthly Booking Trends</h2>

          {analytics.monthly_booking_trends?.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={cellStyle}>Month</th>
                    <th style={cellStyle}>Bookings</th>
                    <th style={cellStyle}>Tickets Sold</th>
                    <th style={cellStyle}>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.monthly_booking_trends.map((item) => (
                    <tr key={item.month}>
                      <td style={cellStyle}>{item.month}</td>
                      <td style={cellStyle}>{item.bookings}</td>
                      <td style={cellStyle}>{item.tickets_sold}</td>
                      <td style={cellStyle}>
                        {formatCurrency(item.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No monthly booking data available.</p>
          )}
        </div>

        <div className="card">
          <h2>Top Revenue-Generating Events</h2>

          {analytics.top_revenue_events?.length > 0 ? (
            <div style={tableWrapperStyle}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th style={cellStyle}>Event</th>
                    <th style={cellStyle}>Tickets Sold</th>
                    <th style={cellStyle}>Bookings</th>
                    <th style={cellStyle}>Revenue</th>
                  </tr>
                </thead>

                <tbody>
                  {analytics.top_revenue_events.map((event) => (
                    <tr key={event.event_id}>
                      <td style={cellStyle}>
                        {event.event_title}
                      </td>
                      <td style={cellStyle}>
                        {event.tickets_sold}
                      </td>
                      <td style={cellStyle}>{event.bookings}</td>
                      <td style={cellStyle}>
                        {formatCurrency(event.revenue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No revenue data available.</p>
          )}
        </div>
      </section>
    </div>
  );
}

const sectionStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
  gap: "20px",
  marginTop: "25px",
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

export default AdminAnalytics;
