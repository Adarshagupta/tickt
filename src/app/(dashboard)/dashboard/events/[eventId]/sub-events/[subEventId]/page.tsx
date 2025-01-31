import { getServerSession } from "next-auth/next"
import { notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { SubEventClient } from "./client"
import type { SubEvent, Ticket } from ".prisma/client"

interface SubEventPageProps {
  params: {
    eventId: string
    subEventId: string
  }
}

export default async function SubEventPage({ params }: SubEventPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await Promise.resolve(params)
  const { eventId, subEventId } = resolvedParams

  if (!session?.user) {
    return null
  }

  const subEvent = await db.subEvent.findUnique({
    where: {
      id: subEventId,
    },
    include: {
      mainEvent: {
        include: {
          organization: {
            include: {
              members: {
                where: {
                  userId: session.user.id,
                  role: {
                    in: ["OWNER", "ADMIN"],
                  },
                },
              },
            },
          },
        },
      },
      tickets: {
        where: {
          userId: session.user.id,
          status: "CONFIRMED"
        }
      }
    },
  })

  if (!subEvent || subEvent.mainEvent.id !== eventId) {
    notFound()
  }

  const isOrganizer = subEvent.mainEvent.organization.members.length > 0

  // If not an organizer and event is in draft, return 404
  if (!isOrganizer && subEvent.status !== "PUBLISHED") {
    notFound()
  }

  return <SubEventClient 
    subEvent={{
      ...subEvent,
      registrations: subEvent.tickets
    }} 
    isOrganizer={isOrganizer} 
  />
} 