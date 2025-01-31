import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const eventId = await Promise.resolve(params.eventId)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if event exists and is published
    const event = await db.mainEvent.findUnique({
      where: { 
        id: eventId,
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
        { message: "Event not found or not published" },
        { status: 404 }
      )
    }

    // If event has sub-events, don't allow direct registration
    if (event.subEvents.length > 0) {
      return NextResponse.json(
        { message: "This event has sub-events. Please register for specific sub-events instead." },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingRegistration = await db.eventRegistration.findFirst({
      where: {
        userId: session.user.id,
        mainEventId: eventId,
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { message: "You are already registered for this event" },
        { status: 400 }
      )
    }

    // Create registration
    const registration = await db.eventRegistration.create({
      data: {
        userId: session.user.id,
        mainEventId: eventId,
        status: "CONFIRMED",
      },
    })

    return NextResponse.json({ registration })
  } catch (error) {
    console.error("[EVENT_REGISTER]", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
} 