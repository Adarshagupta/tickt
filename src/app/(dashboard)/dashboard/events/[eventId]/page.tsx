import { getServerSession } from "next-auth/next"
import { notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { EventClient } from "./client"
import type { SubEvent, Ticket } from ".prisma/client"

interface EventPageProps {
  params: {
    eventId: string
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const session = await getServerSession(authOptions)
  const resolvedParams = await Promise.resolve(params)
  const eventId = resolvedParams.eventId

  if (!session?.user) {
    return null
  }

  const event = await db.mainEvent.findUnique({
    where: {
      id: eventId,
    },
    include: {
      organization: true,
      subEvents: {
        orderBy: {
          startDate: "asc",
        },
        where: {
          // Only show published events to non-organizers
          OR: [
            { status: "PUBLISHED" },
          ],
        },
      },
    },
  })

  if (!event) {
    notFound()
  }

  // Check if user is an organizer of this event
  const isOrganizer = await db.organizationMember.findFirst({
    where: {
      userId: session.user.id,
      organizationId: event.organizationId,
      role: {
        in: ["OWNER", "ADMIN"],
      },
    },
  })

  // If organizer, fetch all sub-events including drafts
  const allSubEvents = isOrganizer ? await db.subEvent.findMany({
    where: {
      mainEventId: eventId,
    },
    orderBy: {
      startDate: "asc",
    },
  }) : event.subEvents

  // Check if user is registered for the main event
  const registration = await db.ticket.findFirst({
    where: {
      userId: session.user.id,
      subEventId: {
        in: allSubEvents.map((se: SubEvent) => se.id)
      },
      status: "CONFIRMED"
    },
  })

  // Get registration status for each sub-event
  const subEventRegistrations = await db.ticket.findMany({
    where: {
      userId: session.user.id,
      subEventId: {
        in: allSubEvents.map((se: SubEvent) => se.id)
      },
      status: "CONFIRMED"
    },
  })

  const subEventsWithRegistration = allSubEvents.map((subEvent: SubEvent) => ({
    ...subEvent,
    isRegistered: subEventRegistrations.some((reg: Ticket) => reg.subEventId === subEvent.id)
  }))

  return (
    <EventClient 
      event={event} 
      isOrganizer={!!isOrganizer} 
      isRegistered={!!registration}
      subEvents={subEventsWithRegistration}
    />
  )
} 