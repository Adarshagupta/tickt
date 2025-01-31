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
        { message: "You must be an organization admin to publish this event" },
        { status: 403 }
      )
    }

    if (event.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Event is already published" },
        { status: 400 }
      )
    }

    const publishedEvent = await db.mainEvent.update({
      where: { id: params.eventId },
      data: {
        status: "PUBLISHED",
      },
    })

    return NextResponse.json({ event: publishedEvent })
  } catch (error) {
    console.error("[EVENT_PUBLISH]", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
} 