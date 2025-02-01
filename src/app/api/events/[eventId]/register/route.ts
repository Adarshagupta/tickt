import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const routeContextSchema = z.object({
  params: z.object({
    eventId: z.string().min(1),
  }),
})

export async function POST(
  request: Request,
  context: z.infer<typeof routeContextSchema>
) {
  try {
    // Validate the route context
    const { params } = routeContextSchema.parse(context)

    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if event exists and is published
    const event = await db.mainEvent.findUnique({
      where: { 
        id: params.eventId,
        status: "PUBLISHED"
      },
      include: {
        subEvents: {
          where: {
            status: "PUBLISHED"
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found or not published" },
        { status: 404 }
      )
    }

    // If event has sub-events, don't allow direct registration
    if (event.subEvents.length > 0) {
      return NextResponse.json(
        { error: "This event has sub-events. Please register for specific sub-events instead." },
        { status: 400 }
      )
    }

    try {
      // Create a default sub-event for the main event if it doesn't have any
      const defaultSubEvent = await db.subEvent.create({
        data: {
          mainEventId: params.eventId,
          title: event.title,
          description: event.description,
          startDate: event.startDate,
          endDate: event.endDate,
          venue: event.venue,
          status: "PUBLISHED",
          eventType: "GENERAL",
          price: 0,
        },
      })

      // Check if user is already registered
      const existingTicket = await db.ticket.findFirst({
        where: {
          userId: session.user.id,
          subEventId: defaultSubEvent.id,
        },
      })

      if (existingTicket) {
        return NextResponse.json(
          { error: "You are already registered for this event" },
          { status: 400 }
        )
      }

      // Create ticket (registration)
      const ticket = await db.ticket.create({
        data: {
          userId: session.user.id,
          subEventId: defaultSubEvent.id,
          ticketNumber: `${event.title.slice(0, 3).toUpperCase()}-${Date.now()}`,
          status: "CONFIRMED",
          price: 0,
        },
      })

      return NextResponse.json({ 
        data: ticket,
        message: "Successfully registered for the event"
      })
    } catch (dbError) {
      console.error("[EVENT_REGISTER_DB]", dbError)
      return NextResponse.json(
        { error: "Failed to process registration" },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("[EVENT_REGISTER]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 