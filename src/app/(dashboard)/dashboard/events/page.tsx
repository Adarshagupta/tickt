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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="relative">
          <div className="absolute -left-4 top-0 h-12 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-r-full" />
          <h1 className="text-2xl font-bold text-indigo-950">Events</h1>
          <p className="mt-2 text-indigo-900/60">Browse and register for upcoming events</p>
        </div>
        {isOrganizer && (
          <Link
            href="/dashboard/events/create"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500"
          >
            Create Event
          </Link>
        )}
      </div>

      {isOrganizer && (
        <div className="space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-indigo-950 mb-4">Your Organization's Events</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {userOrgs.map((membership) =>
                membership.organization.mainEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200/50 transition-all hover:shadow-md"
                  >
                    <div className="absolute top-0 right-0 h-20 w-20">
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
                    </div>
                    <div className="relative">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-lg font-semibold text-indigo-950">{event.title}</h3>
                          <p className="mt-2 text-sm text-indigo-900/60 line-clamp-2">
                            {event.description}
                          </p>
                        </div>
                        <span className="ml-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-700">
                          {event.status.toLowerCase()}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-sm text-indigo-900/60">
                          {new Date(event.startDate).toLocaleDateString()}
                        </span>
                        <Link
                          href={`/dashboard/events/${event.id}`}
                          className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                        >
                          View details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-indigo-950 mb-4">All Events</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {publishedEvents.map((event) => (
            <div
              key={event.id}
              className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200/50 transition-all hover:shadow-md"
            >
              <div className="absolute top-0 right-0 h-20 w-20">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-violet-500/20 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="relative">
                <div className="text-sm font-medium text-indigo-600 mb-2">
                  {event.organization.name}
                </div>
                <h3 className="text-lg font-semibold text-indigo-950">{event.title}</h3>
                <p className="mt-2 text-sm text-indigo-900/60 line-clamp-2">
                  {event.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-indigo-900/60">
                    {new Date(event.startDate).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/dashboard/events/${event.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
} 