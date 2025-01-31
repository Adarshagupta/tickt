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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Tickets</h1>
        <p className="text-muted-foreground">
          View and manage your event tickets
        </p>
      </div>

      <div className="divide-y divide-gray-200 rounded-lg border bg-white">
        {tickets.length === 0 ? (
          <div className="p-4 text-center text-sm text-gray-500">
            You don't have any tickets yet.{" "}
            <Link href="/dashboard/events" className="text-indigo-600 hover:text-indigo-500">
              Browse events
            </Link>
          </div>
        ) : (
          tickets.map((ticket) => (
            <div key={ticket.id} className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">
                    {ticket.subEvent.mainEvent.title} - {ticket.subEvent.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {ticket.subEvent.mainEvent.organization.name}
                  </p>
                </div>
                <div className="ml-4">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      ticket.status === "CONFIRMED"
                        ? "bg-green-100 text-green-800"
                        : ticket.status === "CANCELLED"
                        ? "bg-red-100 text-red-800"
                        : ticket.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {ticket.status.charAt(0) + ticket.status.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>

              <div className="mt-4 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">
                      {new Date(ticket.subEvent.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Ticket Number</p>
                    <p className="font-medium">{ticket.ticketNumber}</p>
                  </div>
                </div>
              </div>

              {ticket.status === "CONFIRMED" && !ticket.checkedIn && (
                <div className="mt-4">
                  <Link
                    href={`/dashboard/tickets/${ticket.id}`}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View QR Code →
                  </Link>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
} 