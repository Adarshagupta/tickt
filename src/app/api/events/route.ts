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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    // Get user's organization
    const userOrg = await db.organizationMember.findFirst({
      where: {
        userId: session.user.id,
        role: {
          in: ["OWNER", "ADMIN"],
        },
      },
      include: {
        organization: true,
      },
    })

    if (!userOrg) {
      return new NextResponse(
        "You must be an organization admin to create events",
        { status: 403 }
      )
    }

    const body = await req.json()
    const { title, description, startDate, endDate, venue } = eventSchema.parse(body)

    // Validate end date is after start date
    if (endDate <= startDate) {
      return new NextResponse(
        "End date must be after start date",
        { status: 400 }
      )
    }

    const event = await db.mainEvent.create({
      data: {
        title,
        description,
        startDate,
        endDate,
        venue,
        organizationId: userOrg.organizationId,
        status: "DRAFT",
      },
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }

    console.error("[EVENTS_POST]", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 