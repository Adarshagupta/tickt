import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { z } from "zod"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  startDate: z.string().transform((str) => new Date(str)),
  endDate: z.string().transform((str) => new Date(str)),
  venue: z.string().min(1, "Venue is required"),
})

export async function GET(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const event = await db.mainEvent.findUnique({
      where: { id: params.eventId },
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

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    if (event.organization.members.length === 0) {
      return NextResponse.json(
        { message: "You must be an organization admin to view this event" },
        { status: 403 }
      )
    }

    return NextResponse.json({ event })
  } catch (error) {
    console.error("[EVENT_GET]", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { eventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const event = await db.mainEvent.findUnique({
      where: { id: params.eventId },
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

    if (!event) {
      return NextResponse.json(
        { message: "Event not found" },
        { status: 404 }
      )
    }

    if (event.organization.members.length === 0) {
      return NextResponse.json(
        { message: "You must be an organization admin to edit this event" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, startDate, endDate, venue } = eventSchema.parse(body)

    // Validate end date is after start date
    if (endDate <= startDate) {
      return NextResponse.json(
        { message: "End date must be after start date" },
        { status: 400 }
      )
    }

    const updatedEvent = await db.mainEvent.update({
      where: { id: params.eventId },
      data: {
        title,
        description,
        startDate,
        endDate,
        venue,
      },
    })

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }

    console.error("[EVENT_PATCH]", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
} 