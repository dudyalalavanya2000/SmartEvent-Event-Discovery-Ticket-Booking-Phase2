
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import api from "../../services/api";

const initialInsights = {
  total_events: 0,
  total_tickets: 0,
  tickets_sold: 0,
  remaining_tickets: 0,
  booking_count: 0,
  revenue: 0,
};

const cardStyle = {
  background: "var(--card-bg, #ffffff)",
  border: "1px solid var(--border-color, #e5e7eb)",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
};

const statValueStyle = {
  fontSize: "28px",
  fontWeight: "700",
  marginTop: "10px",
  marginBottom: 0,
  overflowWrap: "anywhere",
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value || 0));

function OrganizerDashboard() {
  const navigate = useNavigate();

  const [events, setEvents] = useState([]);
  const [insights, setInsights] = useState(initialInsights);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInsights = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/events/my-events/insights");
      const data = response.data;

      if (!Array.isArray(data)) {
        throw new Error("Unexpected organizer insights response.");
      }

      setEvents(data);

      const totals = data.reduce(
        (result, event) => ({
          total_events: result.total_events + 1,
          total_tickets:
            result.total_tickets + Number(event.total_tickets || 0),
          tickets_sold:
            result.tickets_sold + Number(event.tickets_sold || 0),
          remaining_tickets:
            result.remaining_tickets +
            Number(event.remaining_tickets || 0),
          booking_count:
            result.booking_count + Number(event.booking_count || 0),
          revenue:
            result.revenue +
            Number(event.total_revenue ?? event.revenue ?? 0),
        }),
        { ...initialInsights }
      );

      setInsights(totals);
    } catch (err) {
      console.error("Failed to fetch organizer insights:", err);

      const message =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load organizer dashboard.";

      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInsights();
  }, [fetchInsights]);

  const chartData = events.map((event) => ({
    event:
      event.event_title?.length > 22
        ? `${event.event_title.slice(0, 22)}…`
        : event.event_title || `Event ${event.event_id}`,
    ticketsSold: Number(event.tickets_sold || 0),
    remainingTickets: Number(event.remaining_tickets || 0),
    revenue: Number(event.total_revenue ?? event.revenue ?? 0),
  }));

  if (loading) {
    return (
      <main className="page-container">
        <h1>Organizer Dashboard</h1>
        <p>Loading your event insights...</p>
      </main>
    );
  }

  if (error && events.length === 0) {
    return (
      <main className="page-container">
        <h1>Organizer Dashboard</h1>
        <p role="alert">{error}</p>
        <button type="button" onClick={fetchInsights}>
          Try Again
        </button>
      </main>
    );
  }

  const summaryCards = [
    { label: "Total Events", value: insights.total_events },
    { label: "Total Tickets", value: insights.total_tickets },
    { label: "Tickets Sold", value: insights.tickets_sold },
    { label: "Remaining Tickets", value: insights.remaining_tickets },
    { label: "Total Bookings", value: insights.booking_count },
    { label: "Total Revenue", value: formatCurrency(insights.revenue) },
  ];

  return (
    <main className="page-container">
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
          flexWrap: "wrap",
          marginBottom: "28px",
        }}
      >
        <div>
          <h1>Organizer Dashboard</h1>
          <p>Manage your events and monitor booking performance.</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/organizer/events/create")}
        >
          + Create Event
        </button>
      </header>

      <section
        aria-label="Organizer summary"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "18px",
          marginBottom: "30px",
        }}
      >
        {summaryCards.map((item) => (
          <article key={item.label} style={cardStyle}>
            <h3>{item.label}</h3>
            <p style={statValueStyle}>{item.value}</p>
          </article>
        ))}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "20px",
          marginBottom: "30px",
        }}
      >
        <article style={cardStyle}>
          <h2>Ticket Sales by Event</h2>
          <p>Compare sold tickets with remaining inventory.</p>

          {chartData.length === 0 ? (
            <p>No event data available yet.</p>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 10, left: 0, bottom: 55 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="event"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={75}
                  />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar
                    dataKey="ticketsSold"
                    name="Tickets Sold"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="remainingTickets"
                    name="Remaining Tickets"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>

        <article style={cardStyle}>
          <h2>Revenue by Event</h2>
          <p>Revenue from confirmed bookings reported by the API.</p>

          {chartData.length === 0 ? (
            <p>No revenue data available yet.</p>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 15, right: 15, left: 15, bottom: 55 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="event"
                    angle={-25}
                    textAnchor="end"
                    interval={0}
                    height={75}
                  />
                  <YAxis
                    tickFormatter={(value) =>
                      `₹${Number(value).toLocaleString("en-IN")}`
                    }
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(value)}
                  />
                  <Bar
                    dataKey="revenue"
                    name="Revenue"
                    fill="#8b5cf6"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </article>
      </section>

      <section style={{ ...cardStyle, marginBottom: "30px" }}>
        <h2>Event Booking Statistics</h2>

        {events.length === 0 ? (
          <p>You haven't created any events yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {[
                    "Event",
                    "Total Tickets",
                    "Sold",
                    "Remaining",
                    "Bookings",
                    "Revenue",
                    "Action",
                  ].map((heading) => (
                    <th
                      key={heading}
                      style={{
                        padding: "12px",
                        textAlign: "left",
                        borderBottom: "1px solid #e5e7eb",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {events.map((event) => (
                  <tr key={event.event_id}>
                    <td style={{ padding: "12px" }}>
                      {event.event_title}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {event.total_tickets}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {event.tickets_sold}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {event.remaining_tickets}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {event.booking_count}
                    </td>
                    <td style={{ padding: "12px" }}>
                      {formatCurrency(
                        event.total_revenue ?? event.revenue ?? 0
                      )}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <button
                        type="button"
                        onClick={() =>
                          navigate(
                            `/organizer/events/${event.event_id}/bookings`
                          )
                        }
                      >
                        View Bookings
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={cardStyle}>
        <h2>Quick Actions</h2>
        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/organizer/events")}
          >
            Manage Events
          </button>
          <button
            type="button"
            onClick={() => navigate("/organizer/events/create")}
          >
            Create New Event
          </button>
          <button type="button" onClick={fetchInsights}>
            Refresh Insights
          </button>
        </div>
      </section>
    </main>
  );
}

export default OrganizerDashboard;