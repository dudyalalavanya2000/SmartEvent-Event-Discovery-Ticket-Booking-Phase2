import { Link, useParams } from "react-router-dom"

import Navbar from "../components/Navbar"


function BookingConfirmation() {
  const { bookingId } = useParams()

  return (
    <div className="min-h-screen bg-slate-100">

      <Navbar />

      <main className="flex min-h-[80vh] items-center justify-center px-6">

        <div className="w-full max-w-lg rounded-3xl bg-white p-10 text-center shadow-xl">

          <div className="text-6xl">
            ✅
          </div>

          <h1 className="mt-5 text-3xl font-bold text-green-600">
            Booking Confirmed!
          </h1>

          <p className="mt-4 text-slate-600">
            Your ticket booking was successfully completed.
          </p>

          <div className="mt-6 rounded-xl bg-slate-50 p-4">

            <p className="text-sm text-slate-500">
              Booking ID
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">
              #{bookingId}
            </p>

          </div>

          <div className="mt-8 flex flex-col gap-3">

            <Link
              to="/bookings"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              View My Bookings
            </Link>

            <Link
              to="/"
              className="rounded-lg border border-slate-300 px-6 py-3 font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse More Events
            </Link>

          </div>

        </div>

      </main>

    </div>
  )
}


export default BookingConfirmation