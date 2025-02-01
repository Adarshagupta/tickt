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
              organization: true
            }
          }
        }
      }
    }
  })

  if (!ticket || ticket.status !== "CONFIRMED") {
    notFound()
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-8">
        <Link
          href="/dashboard/tickets"
          className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to tickets
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Event Header */}
        <div className="px-6 py-8 border-b border-gray-100">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            {ticket.subEvent.mainEvent.title}
          </h1>
          <h2 className="text-lg text-gray-600 mb-4">
            {ticket.subEvent.title}
          </h2>
          <p className="text-sm text-gray-500">
            Organized by {ticket.subEvent.mainEvent.organization.name}
          </p>
        </div>

        {/* Event Details */}
        <div className="px-6 py-6 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Date</p>
              <p className="text-gray-900">
                {new Date(ticket.subEvent.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Time</p>
              <p className="text-gray-900">
                {new Date(ticket.subEvent.startDate).toLocaleTimeString()}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Venue</p>
              <p className="text-gray-900">{ticket.subEvent.venue || 'TBA'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Ticket Number</p>
              <p className="font-mono text-gray-900">{ticket.ticketNumber}</p>
            </div>
          </div>
        </div>

        {/* Attendee Details */}
        <div className="px-6 py-6 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Attendee Details</h3>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Full Name</p>
              <p className="text-gray-900">{ticket.attendeeName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Date of Birth</p>
              <p className="text-gray-900">
                {ticket.attendeeDob ? new Date(ticket.attendeeDob).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Government ID</p>
              <p className="text-gray-900">{ticket.attendeeGovId || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">ID Type</p>
              <p className="text-gray-900">
                {ticket.attendeeGovIdType ? ticket.attendeeGovIdType.replace('_', ' ') : 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="px-6 py-8 bg-gray-50">
          <div className="flex flex-col items-center">
            <h3 className="text-lg font-medium text-gray-900 mb-6">Entry Pass</h3>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <QRCodeGenerator 
                ticketNumber={ticket.ticketNumber}
                userId={session.user.id}
                eventId={ticket.subEvent.mainEvent.id}
                subEventId={ticket.subEvent.id}
                ticketId={ticket.id}
                eventTitle={ticket.subEvent.mainEvent.title}
                subEventTitle={ticket.subEvent.title}
                startDate={ticket.subEvent.startDate.toISOString()}
                venue={ticket.subEvent.venue || ''}
                organizationName={ticket.subEvent.mainEvent.organization.name}
              />
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Present this QR code at the event for check-in
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 
