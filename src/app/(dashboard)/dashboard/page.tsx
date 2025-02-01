import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -left-4 top-0 h-12 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-r-full" />
        <h1 className="text-2xl font-bold text-indigo-950">
          Welcome back, {session.user.name || "User"}
        </h1>
        <p className="mt-2 text-indigo-900/60">
          Here's an overview of your ticketing activities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/events"
          className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200/50 transition-all hover:shadow-md"
        >
          <div className="absolute top-0 right-0 h-20 w-20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative flex flex-col">
            <h3 className="text-lg font-semibold text-indigo-950">Browse Events</h3>
            <p className="mt-2 text-sm text-indigo-900/60">
              Discover and register for upcoming events
            </p>
          </div>
          <div className="absolute -bottom-4 -right-4 h-24 w-24">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full opacity-50 transition-transform group-hover:scale-110" />
          </div>
        </Link>

        <Link
          href="/dashboard/tickets"
          className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200/50 transition-all hover:shadow-md"
        >
          <div className="absolute top-0 right-0 h-20 w-20">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className="relative flex flex-col">
            <h3 className="text-lg font-semibold text-indigo-950">My Tickets</h3>
            <p className="mt-2 text-sm text-indigo-900/60">
              View and manage your event tickets
            </p>
          </div>
          <div className="absolute -bottom-4 -right-4 h-24 w-24">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-full opacity-50 transition-transform group-hover:scale-110" />
          </div>
        </Link>

        {session.user.role === "ADMIN" && (
          <Link
            href="/dashboard/events/create"
            className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200/50 transition-all hover:shadow-md"
          >
            <div className="absolute top-0 right-0 h-20 w-20">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative flex flex-col">
              <h3 className="text-lg font-semibold text-indigo-950">Create Event</h3>
              <p className="mt-2 text-sm text-indigo-900/60">
                Set up a new event or competition
              </p>
            </div>
            <div className="absolute -bottom-4 -right-4 h-24 w-24">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full opacity-50 transition-transform group-hover:scale-110" />
            </div>
          </Link>
        )}
      </div>

      <div className="relative rounded-xl bg-white shadow-sm ring-1 ring-gray-200/50">
        <div className="absolute top-0 right-0 h-32 w-32">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200/50 transform rotate-45 translate-x-1/2 -translate-y-1/2 opacity-50" />
        </div>
        <div className="relative border-b border-gray-200/50 px-6 py-4">
          <h2 className="text-lg font-semibold text-indigo-950">Recent Activity</h2>
        </div>
        <div className="p-6">
          <div className="text-sm text-indigo-900/60">
            No recent activity to show
          </div>
        </div>
      </div>
    </div>
  )
} 