import { useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"
import api from "../services/api"

function VerifyTicket() {
  const [ticketCode, setTicketCode] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleVerify = async (e) => {
    e.preventDefault()

    const code = ticketCode.trim()

    if (!code) {
      toast.error("Please enter a ticket code.")
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await api.get(
        `/tickets/verify/${encodeURIComponent(code)}`
      )

      setResult(response.data)

      if (response.data.valid) {
        toast.success("Ticket verified successfully!")
      } else {
        toast.error("Invalid ticket.")
      }
    } catch (error) {
      if (error.response?.status === 404) {
        setResult({
          valid: false,
          message: "Ticket not found.",
        })
        toast.error("Ticket not found.")
      } else {
        setResult({
          valid: false,
          message:
            error.response?.data?.detail ||
            "Unable to verify the ticket.",
        })
        toast.error("Unable to verify ticket.")
      }
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (date) => {
    if (!date) return "N/A"

    return new Date(date).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    })
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-3 text-5xl">🎟️</div>

          <h1 className="text-3xl font-bold text-slate-900">
            Verify Ticket
          </h1>

          <p className="mt-2 text-slate-600">
            Enter the ticket code to verify ticket authenticity.
          </p>
        </div>

        {/* Verification Form */}
        <div className="rounded-2xl bg-white p-6 shadow-md">
          <form onSubmit={handleVerify}>
            <label
              htmlFor="ticketCode"
              className="mb-2 block text-sm font-semibold text-slate-700"
            >
              Ticket Code
            </label>

            <input
              id="ticketCode"
              type="text"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="Example: TICKET-80D32C7A5559"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Verifying..." : "Verify Ticket"}
            </button>
          </form>
        </div>

        {/* Verification Result */}
        {result && (
          <div className="mt-6">
            {result.valid ? (
              <div className="overflow-hidden rounded-2xl border border-green-200 bg-white shadow-md">
                {/* Success Header */}
                <div className="bg-green-50 px-6 py-5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500 text-2xl text-white">
                      ✓
                    </div>

                    <div>
                      <h2 className="text-xl font-bold text-green-800">
                        Ticket Verified
                      </h2>

                      <p className="text-sm text-green-700">
                        {result.message}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Ticket Information */}
                <div className="p-6">
                  <h3 className="mb-4 text-lg font-bold text-slate-900">
                    Ticket Information
                  </h3>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <p className="text-sm text-slate-500">
                        Ticket Code
                      </p>
                      <p className="font-semibold text-slate-900">
                        {result.ticket_code}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Ticket ID
                      </p>
                      <p className="font-semibold text-slate-900">
                        #{result.ticket_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Booking ID
                      </p>
                      <p className="font-semibold text-slate-900">
                        #{result.booking_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Booking Status
                      </p>
                      <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                        {result.booking_status}
                      </span>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Ticket Quantity
                      </p>
                      <p className="font-semibold text-slate-900">
                        {result.ticket_quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-500">
                        Total Price
                      </p>
                      <p className="font-semibold text-slate-900">
                        ₹{Number(result.total_price).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Event Information */}
                  {result.event && (
                    <div className="mt-6 rounded-xl bg-slate-50 p-5">
                      <h3 className="mb-4 text-lg font-bold text-slate-900">
                        Event Details
                      </h3>

                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-slate-500">
                            Event
                          </p>
                          <p className="text-lg font-bold text-slate-900">
                            {result.event.title}
                          </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                          <div>
                            <p className="text-sm text-slate-500">
                              Category
                            </p>
                            <p className="font-semibold text-slate-800">
                              {result.event.category}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-slate-500">
                              Ticket Price
                            </p>
                            <p className="font-semibold text-slate-800">
                              ₹
                              {Number(
                                result.event.ticket_price
                              ).toFixed(2)}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-slate-500">
                              Location
                            </p>
                            <p className="font-semibold text-slate-800">
                              {result.event.location}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-slate-500">
                              Event Date
                            </p>
                            <p className="font-semibold text-slate-800">
                              {formatDate(result.event.event_date)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500 text-2xl text-white">
                    ✕
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-red-800">
                      Invalid Ticket
                    </h2>

                    <p className="text-sm text-red-700">
                      {result.message || "This ticket could not be verified."}
                    </p>
                  </div>
                </div>

                {result.ticket_code && (
                  <div className="mt-5 rounded-lg bg-red-50 p-4">
                    <p className="text-sm text-red-600">
                      Ticket Code
                    </p>

                    <p className="font-semibold text-red-900">
                      {result.ticket_code}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Back Links */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm">
          <Link
            to="/tickets"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            ← My Tickets
          </Link>

          <Link
            to="/"
            className="font-semibold text-blue-600 hover:text-blue-800"
          >
            Events
          </Link>
        </div>
      </div>
    </div>
  )
}

export default VerifyTicket