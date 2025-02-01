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

const routeContextSchema = z.object({
  params: z.object({
    eventId: z.string().min(1),
  }),
})

export async function GET(
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

    // Get event with organization details
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

export async function PATCH(
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

    // Get event with organization details
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
      where: { id: params.eventId },
      data: validatedData,
    })

    return NextResponse.json({ data: updatedEvent })
  } catch (error) {
    console.error("[EVENT_PATCH]", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 422 }
      )
    }
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 