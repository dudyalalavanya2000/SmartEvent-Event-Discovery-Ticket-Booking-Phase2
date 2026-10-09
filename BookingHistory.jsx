import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import api from "../services/api"

function BookingHistory() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings/my-bookings")
      setBookings(response.data)
    } catch (error) {
      console.error(error)
      toast.error(
        error.response?.data?.detail || "Failed to load booking history"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">
            My Bookings
          </h1>

          <p className="mt-2 text-slate-600">
            View your event booking history and ticket details.
          </p>
        </div>

        {loading ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <p className="text-slate-600">Loading your bookings...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold text-slate-800">
              No bookings yet
            </h2>

            <p className="mt-2 text-slate-500">
              Explore events and book your first ticket.
            </p>

            <Link
              to="/"
              className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-bold text-slate-900">
                        Booking #{booking.id}
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          booking.booking_status === "CONFIRMED"
                            ? "bg-green-100 text-green-700"
                            : booking.booking_status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {booking.booking_status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                          Event ID
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {booking.event_id}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                          Tickets
                        </p>
                        <p className="mt-1 font-semibold text-slate-800">
                          {booking.ticket_quantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-medium uppercase text-slate-400">
                          Total Amount
                        </p>
                        <p className="mt-1 font-semibold text-indigo-600">
                          ₹{Number(booking.total_price).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      Booked on{" "}
                      {booking.created_at
                        ? new Date(booking.created_at).toLocaleString()
                        : "N/A"}
                    </p>
                  </div>

                  {booking.booking_status === "CONFIRMED" && (
                    <Link
                      to="/tickets"
                      className="rounded-lg bg-indigo-600 px-5 py-3 text-center font-semibold text-white hover:bg-indigo-700"
                    >
                      View Tickets
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

export default BookingHistory
