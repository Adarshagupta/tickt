import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function EventsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  // Get user's organizations
  const userOrgs = await db.organizationMember.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      organization: {
        include: {
          mainEvents: {
            include: {
              subEvents: true,
            },
          },
        },
      },
    },
  })

  // Get all published events for regular users
  const publishedEvents = await db.mainEvent.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      organization: true,
      subEvents: true,
    },
  })

  const isOrganizer = userOrgs.length > 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Events</h1>
        {isOrganizer && (
          <Link
            href="/dashboard/events/create"
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            Create Event
          </Link>
        )}
      </div>

      {isOrganizer && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Your Organization's Events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userOrgs.map((membership) =>
                membership.organization.mainEvents.map((event) => (
                  <div
                    key={event.id}
                    className="rounded-lg border bg-white p-6 shadow-sm"
                  >
                    <h3 className="text-lg font-medium">{event.title}</h3>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {event.description}
                    </p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/dashboard/events/${event.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        View details
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold mb-4">All Events</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-lg border bg-white p-6 shadow-sm"
            >
              <div className="text-sm text-gray-500 mb-2">
                {event.organization.name}
              </div>
              <h3 className="text-lg font-medium">{event.title}</h3>
              <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                {event.description}
              </p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleDateString()}
                </span>
                <Link
                  href={`/dashboard/events/${event.id}`}
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                >
                  View details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 