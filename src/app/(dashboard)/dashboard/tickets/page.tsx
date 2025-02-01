import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"

export default async function TicketsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return null
  }

  const tickets = await db.ticket.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      subEvent: {
        include: {
          mainEvent: {
            include: {
              organization: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -left-4 top-0 h-12 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-r-full" />
        <h1 className="text-2xl font-bold text-indigo-950">My Tickets</h1>
        <p className="mt-2 text-indigo-900/60">
          View and manage your event tickets
        </p>
      </div>

      <div className="relative rounded-xl bg-white shadow-sm ring-1 ring-gray-200/50 divide-y divide-gray-200/50">
        <div className="absolute top-0 right-0 h-32 w-32">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
        </div>
        {tickets.length === 0 ? (
          <div className="relative flex flex-col items-center justify-center px-6 py-12 text-center">
            <div className="rounded-full bg-indigo-50 p-3 mb-4">
              <svg className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
            <p className="text-sm text-indigo-900/60 mb-4">
              You haven't purchased any tickets yet
            </p>
            <Link 
              href="/dashboard/events" 
              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
            >
              Browse events
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="group relative overflow-hidden hover:bg-gray-50/75">
              <div className="absolute top-0 right-0 h-32 w-32 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="relative p-6">
                <div className="flex items-start justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-3">
                      <h3 className="truncate text-lg font-semibold text-indigo-950">
                        {ticket.subEvent.mainEvent.title}
                      </h3>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          ticket.status === "CONFIRMED"
                            ? "bg-green-50 text-green-700"
                            : ticket.status === "CANCELLED"
                            ? "bg-red-50 text-red-700"
                            : ticket.status === "PENDING"
                            ? "bg-yellow-50 text-yellow-700"
                            : "bg-gray-50 text-gray-700"
                        }`}
                      >
                        {ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase()}
                      </span>
                    </div>
                    <div className="mt-1">
                      <p className="text-sm text-indigo-900/60">
                        {ticket.subEvent.title}
                      </p>
                      <p className="mt-1 text-sm text-indigo-900/40">
                        {ticket.subEvent.mainEvent.organization.name}
                      </p>
                    </div>
                  </div>
                  <div className="ml-6 flex flex-shrink-0 items-center">
                    <Link
                      href={`/dashboard/tickets/${ticket.id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                    >
                      View ticket
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
} 