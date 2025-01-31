import { getServerSession } from "next-auth/next"
import { notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import Link from "next/link"
import { QRCodeGenerator } from "./client"

interface TicketPageProps {
  params: {
    ticketId: string
  }
}

export default async function TicketPage({ params }: TicketPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await Promise.resolve(params)
  const ticketId = resolvedParams.ticketId

  if (!session?.user) {
    return null
  }

  const ticket = await db.ticket.findUnique({
    where: {
      id: ticketId,
      userId: session.user.id, // Ensure the ticket belongs to the user
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
  })

  if (!ticket || ticket.status !== "CONFIRMED") {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <Link
          href="/dashboard/tickets"
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          ← Back to tickets
        </Link>
        <h1 className="mt-2 text-2xl font-bold tracking-tight">Ticket Details</h1>
      </div>

      <div className="bg-white rounded-lg border p-6 space-y-6">
        <div>
          <h2 className="text-xl font-semibold">
            {ticket.subEvent.mainEvent.title} - {ticket.subEvent.title}
          </h2>
          <p className="text-gray-500">
            {ticket.subEvent.mainEvent.organization.name}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-medium">
              {new Date(ticket.subEvent.startDate).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Time</p>
            <p className="font-medium">
              {new Date(ticket.subEvent.startDate).toLocaleTimeString()}
            </p>
          </div>
          <div>
            <p className="text-gray-500">Venue</p>
            <p className="font-medium">{ticket.subEvent.venue}</p>
          </div>
          <div>
            <p className="text-gray-500">Ticket Number</p>
            <p className="font-medium">{ticket.ticketNumber}</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <div className="flex flex-col items-center justify-center space-y-4">
            <h3 className="text-lg font-medium">QR Code</h3>
            <QRCodeGenerator 
              ticketNumber={ticket.ticketNumber}
              userId={session.user.id}
              eventId={ticket.subEvent.mainEvent.id}
              subEventId={ticket.subEvent.id}
              ticketId={ticket.id}
              eventTitle={ticket.subEvent.mainEvent.title}
              subEventTitle={ticket.subEvent.title}
              startDate={ticket.subEvent.startDate.toISOString()}
              venue={ticket.subEvent.venue}
              organizationName={ticket.subEvent.mainEvent.organization.name}
            />
            <p className="text-sm text-gray-500">
              Present this QR code at the event for check-in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
