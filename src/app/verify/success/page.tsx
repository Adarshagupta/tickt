import { db } from "@/lib/db"
import { CheckCircle2 } from "lucide-react"

interface SuccessPageProps {
  searchParams: {
    ticket: string
  }
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const ticket = await db.ticket.findUnique({
    where: {
      id: searchParams.ticket,
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

  if (!ticket) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full space-y-6">
        <div className="flex flex-col items-center justify-center space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <h1 className="text-2xl font-bold text-gray-900 text-center">
            Attendance Marked Successfully
          </h1>
          <p className="text-gray-600 text-center">
            Ticket has been verified and marked as used.
          </p>
        </div>

        <div className="border-t pt-4">
          <div className="space-y-2">
            <h2 className="font-semibold text-gray-900">
              {ticket.subEvent.mainEvent.title} - {ticket.subEvent.title}
            </h2>
            <p className="text-sm text-gray-500">
              {ticket.subEvent.mainEvent.organization.name}
            </p>
            <p className="text-sm text-gray-500">
              Marked at: {new Date(ticket.usedAt!).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
} 