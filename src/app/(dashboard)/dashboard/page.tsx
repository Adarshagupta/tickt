import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    return null
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {session.user.name || "User"}
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s an overview of your ticketing activities
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link
          href="/dashboard/events"
          className="block rounded-lg border p-6 hover:border-indigo-500 hover:shadow-sm"
        >
          <h3 className="text-lg font-medium">Browse Events</h3>
          <p className="mt-2 text-sm text-gray-600">
            Discover and register for upcoming events
          </p>
        </Link>

        <Link
          href="/dashboard/tickets"
          className="block rounded-lg border p-6 hover:border-indigo-500 hover:shadow-sm"
        >
          <h3 className="text-lg font-medium">My Tickets</h3>
          <p className="mt-2 text-sm text-gray-600">
            View and manage your event tickets
          </p>
        </Link>

        {session.user.role === "ADMIN" && (
          <Link
            href="/dashboard/events/create"
            className="block rounded-lg border p-6 hover:border-indigo-500 hover:shadow-sm"
          >
            <h3 className="text-lg font-medium">Create Event</h3>
            <p className="mt-2 text-sm text-gray-600">
              Set up a new event or competition
            </p>
          </Link>
        )}
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
        <div className="rounded-md border">
          <div className="p-4 text-sm text-gray-500">
            No recent activity to show
          </div>
        </div>
      </div>
    </div>
  )
} 