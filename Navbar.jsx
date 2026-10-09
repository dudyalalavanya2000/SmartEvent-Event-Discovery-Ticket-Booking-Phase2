
import { Link, useNavigate } from "react-router-dom";
import NotificationDropdown from "./NotificationDropdown";

function Navbar() {
  const navigate = useNavigate();

  const token = localStorage.getItem("access_token");
  const userData = localStorage.getItem("user");

  let user = null;

  try {
    user = userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Failed to parse user data:", error);
  }

  const userRole = String(user?.role || "").toUpperCase();
  const isLoggedIn = Boolean(token);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    navigate("/login", { replace: true });
  };

  return (
    <nav className="border-b border-slate-200 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4">
        <Link
          to="/"
          className="flex items-center gap-2 text-xl font-bold text-blue-600"
        >
          🎟️ SmartEvent
        </Link>

        <div className="flex flex-wrap items-center gap-5">
          <Link
            to="/"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Events
          </Link>

          {isLoggedIn && userRole === "USER" && (
            <>
              <Link
                to="/bookings"
                className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
              >
                My Bookings
              </Link>

              <Link
                to="/tickets"
                className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
              >
                My Tickets
              </Link>
            </>
          )}

          <Link
            to="/verify-ticket"
            className="text-sm font-medium text-slate-700 transition hover:text-blue-600"
          >
            Verify Ticket
          </Link>

          {isLoggedIn && <NotificationDropdown />}

          {isLoggedIn && userRole === "ADMIN" && (
            <Link
              to="/admin"
              className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              Admin Dashboard
            </Link>
          )}

          {isLoggedIn && userRole === "ORGANIZER" && (
            <Link
              to="/organizer"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              Organizer Dashboard
            </Link>
          )}

          {isLoggedIn ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-600"
            >
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;