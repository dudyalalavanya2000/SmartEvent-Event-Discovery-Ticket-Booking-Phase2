import { Link } from "react-router-dom"

function EventCard({ event }) {
  const status = event.event_status

  const statusStyles = {
    UPCOMING: "bg-blue-100 text-blue-700",
    ONGOING: "bg-yellow-100 text-yellow-700",
    COMPLETED: "bg-gray-100 text-gray-700",
    CANCELLED: "bg-red-100 text-red-700",
  }

  const statusMessages = {
    UPCOMING: "Booking available",
    ONGOING: "Event is currently ongoing",
    COMPLETED: "Event completed",
    CANCELLED: "Event cancelled",
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl">

      {event.banner_image ? (
        <img
          src={event.banner_image}
          alt={event.title}
          className="h-48 w-full object-cover"
        />
      ) : (
        <div className="flex h-48 items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
          <span className="text-5xl">🎫</span>
        </div>
      )}

      <div className="p-5">

        <div className="mb-3 flex items-center justify-between gap-3">

          <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
            {event.category}
          </span>

          <span className="font-bold text-green-600">
            ₹{event.ticket_price}
          </span>

        </div>

        {/* Event Status */}
        <div className="mb-3 flex items-center justify-between gap-3">

          <span
            className={`rounded-full px-3 py-1 text-xs font-bold ${
              statusStyles[status] || "bg-gray-100 text-gray-700"
            }`}
          >
            {status}
          </span>

          <span className="text-xs font-medium text-slate-500">
            {statusMessages[status] || "Event status unavailable"}
          </span>

        </div>

        <h2 className="text-xl font-bold text-slate-800">
          {event.title}
        </h2>

        <p className="mt-2 line-clamp-2 text-sm text-slate-600">
          {event.description}
        </p>

        <div className="mt-4 space-y-2 text-sm text-slate-500">

          <p>📍 {event.location}</p>

          <p>
            📅{" "}
            {new Date(event.event_date).toLocaleString()}
          </p>

          <p>
            🎟️ {event.available_tickets} tickets available
          </p>

        </div>

        {/* Cancellation Notice */}
        {status === "CANCELLED" && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700">
            ⚠️ This event has been cancelled.
          </div>
        )}

        {/* Ongoing Notice */}
        {status === "ONGOING" && (
          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm font-medium text-yellow-700">
            🔴 This event is currently ongoing. Booking is closed.
          </div>
        )}

        {/* Completed Notice */}
        {status === "COMPLETED" && (
          <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600">
            ✓ This event has already been completed.
          </div>
        )}

        <Link
          to={`/events/${event.id}`}
          className="mt-5 block rounded-lg bg-blue-600 px-4 py-3 text-center font-semibold text-white transition hover:bg-blue-700"
        >
          View Event
        </Link>

      </div>

    </div>
  )
}

export default EventCard