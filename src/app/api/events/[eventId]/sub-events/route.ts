import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const subEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  venue: z.string().min(1, "Venue is required"),
  capacity: z.number().min(1, "Capacity must be at least 1"),
  price: z.number().min(0, "Price cannot be negative"),
  eventType: z.enum(["GENERAL", "COMPETITION", "WORKSHOP", "PERFORMANCE"]),
})

export async function POST(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const [session, eventId] = await Promise.all([
      getServerSession(authOptions),
      Promise.resolve(params.eventId)
    ])

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const mainEvent = await db.mainEvent.findUnique({
      where: { id: eventId },
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
    })

    if (!mainEvent) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    if (mainEvent.organization.members.length === 0) {
      return NextResponse.json(
        { message: "You must be an organization admin to create sub-events" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const {
      title,
      description,
      startDate,
      endDate,
      venue,
      capacity,
      price,
      eventType,
    } = subEventSchema.parse(body)

    // Validate dates are within main event dates
    if (startDate < mainEvent.startDate || endDate > mainEvent.endDate) {
      return NextResponse.json(
        { message: "Sub-event dates must be within main event dates" },
        { status: 400 }
      )
    }

    const subEvent = await db.subEvent.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        venue,
        capacity,
        price,
        eventType,
        mainEventId: eventId,
        status: "DRAFT",
      },
    })

    return NextResponse.json({ subEvent }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }

    console.error("[SUB_EVENTS_POST]", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
} 