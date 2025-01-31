import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { db } from "@/lib/db"
import { authOptions } from "@/lib/auth"

export async function POST(
  req: Request,
  { params }: { params: { eventId: string; subEventId: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      )
    }

    const subEvent = await db.subEvent.findUnique({
      where: { id: params.subEventId },
      include: {
        mainEvent: {
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
        },
      },
    })

    if (!subEvent) {
      return NextResponse.json(
        { message: "Sub-event not found" },
        { status: 404 }
      )
    }

    if (subEvent.mainEvent.id !== params.eventId) {
      return NextResponse.json(
        { message: "Sub-event does not belong to this event" },
        { status: 400 }
      )
    }

    if (subEvent.mainEvent.organization.members.length === 0) {
      return NextResponse.json(
        { message: "You must be an organization admin to publish this sub-event" },
        { status: 403 }
      )
    }

    if (subEvent.status !== "DRAFT") {
      return NextResponse.json(
        { message: "Sub-event is already published" },
        { status: 400 }
      )
    }

    const publishedSubEvent = await db.subEvent.update({
      where: { id: params.subEventId },
      data: {
        status: "PUBLISHED",
      },
    })

    return NextResponse.json({ subEvent: publishedSubEvent })
  } catch (error) {
    console.error("[SUB_EVENT_PUBLISH]", error)
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    )
  }
} 