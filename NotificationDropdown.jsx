import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "react-toastify"

import api from "../services/api"

function NotificationDropdown() {
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const dropdownRef = useRef(null)

  useEffect(() => {
    fetchUnreadCount()
  }, [])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    )

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      )
    }
  }, [])

  const fetchUnreadCount = async () => {
    try {
      const response = await api.get(
        "/notifications/unread-count"
      )

      setUnreadCount(response.data.unread_count)
    } catch (error) {
      console.error(
        "Failed to fetch unread notification count:",
        error
      )
    }
  }

  const fetchNotifications = async () => {
    setLoading(true)

    try {
      const response = await api.get("/notifications/")

      setNotifications(response.data)
    } catch (error) {
      console.error(
        "Failed to fetch notifications:",
        error
      )

      toast.error(
        error.response?.data?.detail ||
          "Failed to load notifications"
      )
    } finally {
      setLoading(false)
    }
  }

  const toggleDropdown = async () => {
    const nextState = !isOpen

    setIsOpen(nextState)

    if (nextState) {
      await fetchNotifications()
      await fetchUnreadCount()
    }
  }

  const markAsRead = async (notificationId) => {
    try {
      await api.patch(
        `/notifications/${notificationId}/read`
      )

      setNotifications((currentNotifications) =>
        currentNotifications.map((notification) =>
          notification.id === notificationId
            ? {
                ...notification,
                is_read: true,
              }
            : notification
        )
      )

      setUnreadCount((currentCount) =>
        Math.max(0, currentCount - 1)
      )
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      )

      toast.error(
        error.response?.data?.detail ||
          "Failed to update notification"
      )
    }
  }

  const getNotificationIcon = (type) => {
    if (type === "BOOKING") {
      return "🎟️"
    }

    if (type === "EVENT") {
      return "⏰"
    }

    return "🔔"
  }

  return (
    <div
      className="relative"
      ref={dropdownRef}
    >
      <button
        type="button"
        onClick={toggleDropdown}
        className="relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
      >
        <span className="text-xl">
          🔔
        </span>

        <span className="hidden sm:inline">
          Notifications
        </span>

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
            {unreadCount > 99
              ? "99+"
              : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-xl bg-white shadow-xl ring-1 ring-slate-200 sm:w-96">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4">
            <div>
              <h3 className="font-bold text-slate-900">
                Notifications
              </h3>

              <p className="text-xs text-slate-500">
                {unreadCount} unread
              </p>
            </div>

            <span className="text-xl">
              🔔
            </span>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="p-6 text-center text-sm text-slate-500">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center">
                <div className="text-3xl">
                  🔔
                </div>

                <p className="mt-2 text-sm font-medium text-slate-700">
                  No notifications
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  You're all caught up!
                </p>
              </div>
            ) : (
              notifications
                .slice(0, 5)
                .map((notification) => (
                  <div
                    key={notification.id}
                    className={`border-b border-slate-100 p-4 ${
                      notification.is_read
                        ? "bg-white"
                        : "bg-indigo-50"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-lg shadow-sm">
                        {getNotificationIcon(
                          notification.type
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="text-sm font-semibold text-slate-800">
                            {notification.title}
                          </p>

                          {!notification.is_read && (
                            <span className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                          )}
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-600">
                          {notification.message}
                        </p>

                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-400">
                            {notification.created_at
                              ? new Date(
                                  notification.created_at
                                ).toLocaleString()
                              : "N/A"}
                          </span>

                          {!notification.is_read && (
                            <button
                              type="button"
                              onClick={() =>
                                markAsRead(
                                  notification.id
                                )
                              }
                              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                            >
                              Mark read
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>

          <div className="border-t border-slate-200 p-3">
            <Link
              to="/notifications"
              onClick={() => setIsOpen(false)}
              className="block rounded-lg bg-indigo-600 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-indigo-700"
            >
              View All Notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown