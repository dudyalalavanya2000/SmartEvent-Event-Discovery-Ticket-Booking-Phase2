import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import api from "../../services/api";

function ManageEventsBookings() {
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState("");

  const fetchData = async () => {
    setLoading(true);

    try {
      const [eventsResponse, bookingsResponse] = await Promise.all([
        api.get("/admin/events"),
        api.get("/admin/bookings"),
      ]);

      setEvents(
        Array.isArray(eventsResponse.data)
          ? eventsResponse.data
          : eventsResponse.data?.items || []
      );

      setBookings(
        Array.isArray(bookingsResponse.data)
          ? bookingsResponse.data
          : bookingsResponse.data?.items || []
      );
    } catch (error) {
      console.error("Failed to load admin records:", error);
      toast.error(
        error.response?.data?.detail ||
          "Failed to load events and bookings."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const cancelEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to cancel this event?")) {
      return;
    }

    setProcessing(`event-${eventId}`);

    try {
      await api.patch(`/admin/events/${eventId}/cancel`);
      toast.success("Event cancelled successfully.");
      await fetchData();
    } catch (error) {
      console.error("Failed to cancel event:", error);
      toast.error(
        error.response?.data?.detail || "Failed to cancel event."
      );
    } finally {
      setProcessing("");
    }
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) {
      return;
    }

    setProcessing(`booking-${bookingId}`);

    try {
      await api.patch(`/admin/bookings/${bookingId}/cancel`);
      toast.success("Booking cancelled successfully.");
      await fetchData();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
      toast.error(
        error.response?.data?.detail || "Failed to cancel booking."
      );
    } finally {
      setProcessing("");
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <h1>Manage Events & Bookings</h1>
        <p>Loading records...</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Manage Events & Bookings</h1>
      <p>Review event and booking records and manage cancellations.</p>

      <section className="card" style={{ marginTop: "24px" }}>
        <h2>Events ({events.length})</h2>

        {events.length === 0 ? (
          <p>No events found.</p>
        ) : (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellStyle}>ID</th>
                  <th style={cellStyle}>Event</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const eventId = event.event_id ?? event.id;
                  const status = String(
                    event.status ?? event.event_status ?? ""
                  ).toUpperCase();

                  const cancelled =
                    status.includes("CANCEL") || status === "INACTIVE";

                  return (
                    <tr key={eventId}>
                      <td style={cellStyle}>{eventId}</td>
                      <td style={cellStyle}>
                        {event.title ?? event.event_title ?? "—"}
                      </td>
                      <td style={cellStyle}>{status || "—"}</td>
                      <td style={cellStyle}>
                        <button
                          type="button"
                          disabled={cancelled || processing === `event-${eventId}`}
                          onClick={() => cancelEvent(eventId)}
                        >
                          {processing === `event-${eventId}`
                            ? "Cancelling..."
                            : cancelled
                              ? "Cancelled"
                              : "Cancel Event"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="card" style={{ marginTop: "24px" }}>
        <h2>Bookings ({bookings.length})</h2>

        {bookings.length === 0 ? (
          <p>No bookings found.</p>
        ) : (
          <div style={tableWrapperStyle}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={cellStyle}>Booking ID</th>
                  <th style={cellStyle}>Event</th>
                  <th style={cellStyle}>Status</th>
                  <th style={cellStyle}>Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const bookingId = booking.booking_id ?? booking.id;
                  const status = String(
                    booking.status ?? booking.booking_status ?? ""
                  ).toUpperCase();

                  const cancelled = status.includes("CANCEL");

                  return (
                    <tr key={bookingId}>
                      <td style={cellStyle}>{bookingId}</td>
                      <td style={cellStyle}>
                        {booking.event_title ??
                          booking.event?.title ??
                          booking.event_id ??
                          "—"}
                      </td>
                      <td style={cellStyle}>{status || "—"}</td>
                      <td style={cellStyle}>
                        <button
                          type="button"
                          disabled={
                            cancelled ||
                            processing === `booking-${bookingId}`
                          }
                          onClick={() => cancelBooking(bookingId)}
                        >
                          {processing === `booking-${bookingId}`
                            ? "Cancelling..."
                            : cancelled
                              ? "Cancelled"
                              : "Cancel Booking"}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

const tableWrapperStyle = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "16px",
};

const cellStyle = {
  padding: "12px",
  textAlign: "left",
  borderBottom: "1px solid #ddd",
};

export default ManageEventsBookings;