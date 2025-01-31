import { db } from "@/lib/db"
import { notFound } from "next/navigation"

interface VerifyPageProps {
  params: {
    token: string
  }
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const resolvedParams = await Promise.resolve(params)
  const token = resolvedParams.token

  try {
    // Decode and parse the verification data
    const verificationData = JSON.parse(Buffer.from(token, 'base64').toString())
    
    // Fetch ticket details
    const ticket = await db.ticket.findUnique({
      where: {
        id: verificationData.t,
        userId: verificationData.u,
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
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full space-y-4">
            <div className="text-red-600 text-xl font-bold text-center">
              Invalid or Used Ticket
            </div>
            <p className="text-gray-600 text-center">
              This ticket is either invalid or has already been used.
            </p>
          </div>
        </div>
      )
    }

    const isCorrectEvent = ticket.subEvent.id === verificationData.s && 
                          ticket.subEvent.mainEvent.id === verificationData.e

    if (!isCorrectEvent) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full space-y-4">
            <div className="text-red-600 text-xl font-bold text-center">
              Invalid Event
            </div>
            <p className="text-gray-600 text-center">
              This ticket is not valid for this event.
            </p>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              {ticket.subEvent.mainEvent.title}
            </h1>
            <p className="text-lg text-gray-600">{ticket.subEvent.title}</p>
            <p className="text-sm text-gray-500">
              {ticket.subEvent.mainEvent.organization.name}
            </p>
          </div>

          <div className="border-t border-b border-gray-200 py-4 space-y-3">
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
          </div>

          <form action="/api/verify" method="POST">
            <input type="hidden" name="ticketId" value={ticket.id} />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Mark Attendance
            </button>
          </form>
        </div>
      </div>
    )
  } catch {
    notFound()
  }
} 