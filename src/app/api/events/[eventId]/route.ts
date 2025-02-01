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
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    // Await the params
    const { eventId } = await context.params;

    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get event with organization details
    const event = await db.mainEvent.findUnique({
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

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (event.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You must be an organization admin to view this event" },
        { status: 403 }
      )
    }

    return NextResponse.json({ data: event })
  } catch (error) {
    console.error("[EVENT_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ eventId: string }> }
) {
  try {
    // Await the params
    const { eventId } = await context.params;

    // Get session
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get event with organization details
    const event = await db.mainEvent.findUnique({
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

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (event.organization.members.length === 0) {
      return NextResponse.json(
        { error: "You must be an organization admin to edit this event" },
        { status: 403 }
      )
    }

    // Parse and validate request body
    const body = await request.json().catch(() => ({}))
    
    try {
      const validatedData = eventSchema.parse(body)

      // Validate end date is after start date
      if (validatedData.endDate <= validatedData.startDate) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        )
      }

      // Update event
      const updatedEvent = await db.mainEvent.update({
        where: { id: eventId },
        data: validatedData,
      })

      return NextResponse.json({ data: updatedEvent })
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors[0].message },
          { status: 422 }
        )
      }
      throw validationError
    }
  } catch (error) {
    console.error("[EVENT_PATCH]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 