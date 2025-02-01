import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { EventImage } from "@/components/event-image"

export default async function HomePage() {
  const session = await getServerSession(authOptions)
  
  // Get all published events
  const events = await db.mainEvent.findMany({
    where: {
      status: "PUBLISHED",
    },
    include: {
      organization: true,
      subEvents: {
        where: {
          status: "PUBLISHED",
        },
      },
    },
    orderBy: {
      startDate: "asc",
    },
    take: 6, // Limit to 6 events for the home page
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute right-0 top-0 w-96 h-96 -translate-y-1/2 translate-x-1/2">
            <div className="absolute inset-0 rotate-45 transform opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-3xl" />
            </div>
          </div>
          <div className="absolute left-0 bottom-0 w-96 h-96 translate-y-1/2 -translate-x-1/2">
            <div className="absolute inset-0 -rotate-45 transform opacity-20">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl" />
            </div>
          </div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-indigo-950 sm:text-5xl lg:text-6xl tracking-tight">
              Your next event is just a click away
            </h1>
            <p className="mt-6 text-lg text-indigo-900/60 max-w-2xl mx-auto">
              Discover and register for amazing events happening around you. From workshops to competitions, find the perfect event for you.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-base font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500"
                  >
                    Get Started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-medium text-indigo-950 shadow-sm ring-1 ring-gray-200/50 transition-colors hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Events Section */}
      {events.length > 0 && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-indigo-950">Upcoming Events</h2>
            <p className="mt-4 text-lg text-indigo-900/60">
              Check out these exciting events and secure your spot today
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event.id}
                className="group relative overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200/50 transition-all hover:shadow-md"
              >
                <div className="aspect-[16/9] w-full">
                  <EventImage
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-full w-full"
                  />
                </div>
                <div className="relative p-6">
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
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-indigo-900/60">
                        By {event.organization.name}
                      </p>
                      <p className="mt-1 text-sm text-indigo-900/60">
                        {new Date(event.startDate).toLocaleDateString()}
                      </p>
                      {event.subEvents.length > 0 && (
                        <p className="mt-1 text-sm text-indigo-900/60">
                          {event.subEvents.length} sub-event{event.subEvents.length === 1 ? "" : "s"}
                        </p>
                      )}
                    </div>
                    <div className="mt-4">
                      <Link
                        href={session ? `/dashboard/events/${event.id}` : "/login"}
                        className="inline-flex items-center text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        {session ? "View details" : "Sign in to register"}
                        <svg className="ml-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {session && (
            <div className="mt-12 text-center">
              <Link
                href="/dashboard/events"
                className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-base font-medium text-indigo-950 shadow-sm ring-1 ring-gray-200/50 transition-colors hover:bg-gray-50"
              >
                View All Events
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
