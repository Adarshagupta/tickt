import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"
import type { Prisma } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: { eventId: string; subEventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const resolvedParams = await Promise.resolve(params)
    const { eventId, subEventId } = resolvedParams

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check if sub-event exists and is published
    const subEvent = await db.subEvent.findUnique({
      where: { 
        id: subEventId,
        status: "PUBLISHED",
        mainEventId: eventId
      },
      include: {
        mainEvent: {
          select: {
            status: true
          }
        }
      }
    })

    if (!subEvent) {
      return NextResponse.json(
        { message: "Sub-event not found or not published" },
        { status: 404 }
      )
    }

    if (subEvent.mainEvent.status !== "PUBLISHED") {
      return NextResponse.json(
        { message: "Main event is not published" },
        { status: 400 }
      )
    }

    // Check if user is already registered
    const existingRegistration = await db.ticket.findFirst({
      where: {
        userId: session.user.id,
        subEventId: subEventId,
        status: "CONFIRMED"
      },
    })

    if (existingRegistration) {
      return NextResponse.json(
        { message: "You are already registered for this sub-event" },
        { status: 400 }
      )
    }

    // Check capacity
    const registrationCount = await db.ticket.count({
      where: {
        subEventId: subEventId,
        status: "CONFIRMED"
      },
    })

    if (subEvent.capacity && registrationCount >= subEvent.capacity) {
      return NextResponse.json(
        { message: "This sub-event has reached its capacity" },
        { status: 400 }
      )
    }

    // Generate a unique ticket number
    const ticketNumber = `${subEventId}-${session.user.id}-${Date.now()}`

    // Get attendee details from request body
    const body = await req.json()
    const { attendeeName, attendeeDob, attendeeGovId, attendeeGovIdType } = body

    // Create registration
    const registration = await db.ticket.create({
      data: {
        userId: session.user.id,
        subEventId: subEventId,
        status: "CONFIRMED",
        ticketNumber,
        price: subEvent.price,
        attendeeName,
        attendeeDob: attendeeDob ? new Date(attendeeDob) : null,
        attendeeGovId,
        attendeeGovIdType: attendeeGovIdType,
      },
    })

    return NextResponse.json({ registration })
  } catch (error) {
    console.error("[SUB_EVENT_REGISTER]", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
} 