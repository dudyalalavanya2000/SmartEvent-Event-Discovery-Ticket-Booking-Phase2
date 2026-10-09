
import { useEffect, useState } from "react"
import { toast } from "react-toastify"

import api from "../services/api"
import EventCard from "../components/EventCard"

function Home() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState("")
  const [category, setCategory] = useState("")
  const [loading, setLoading] = useState(true)

  const fetchEvents = async () => {
    setLoading(true)

    try {
      const params = {}

      if (search.trim()) {
        params.search = search.trim()
      }

      if (category) {
        params.category = category
      }

      const response = await api.get("/events/", {
        params,
      })

      setEvents(response.data)
    } catch (error) {
      toast.error(
        error.response?.data?.detail ||
          "Unable to load events"
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
  }, [category])

  const handleSearch = (event) => {
    event.preventDefault()
    fetchEvents()
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <main className="mx-auto max-w-7xl px-6 py-10">

        {/* Hero */}
        <section className="rounded-3xl bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-12 text-white shadow-lg">
          <h1 className="text-4xl font-bold">
            Discover Amazing Events
          </h1>

          <p className="mt-3 max-w-2xl text-lg text-blue-100">
            Find concerts, technology events, sports,
            business conferences and more.
          </p>
        </section>

        {/* Search and Filter */}
        <section className="mt-8 rounded-2xl bg-white p-5 shadow-md">
          <form
            onSubmit={handleSearch}
            className="flex flex-col gap-4 md:flex-row"
          >
            <input
              type="text"
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search events by title..."
              className="flex-1 rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(event.target.value)
              }
              className="rounded-lg border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
            >
              <option value="">
                All Categories
              </option>

              <option value="Music">
                Music
              </option>

              <option value="Tech">
                Tech
              </option>

              <option value="Sports">
                Sports
              </option>

              <option value="Business">
                Business
              </option>
            </select>

            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
            >
              Search
            </button>
          </form>
        </section>

        {/* Events */}
        <section className="mt-10">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800">
              Upcoming Events
            </h2>

            <span className="text-slate-500">
              {events.length} event(s)
            </span>
          </div>

          {loading ? (
            <div className="py-20 text-center text-lg text-slate-500">
              Loading events...
            </div>
          ) : events.length === 0 ? (
            <div className="rounded-2xl bg-white p-12 text-center shadow">
              <p className="text-lg text-slate-500">
                No events found.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                />
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  )
}

export default Home
