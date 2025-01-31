import { NextResponse } from "next/server"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const data = await req.formData()
    const ticketId = data.get("ticketId") as string

    if (!ticketId) {
      return new NextResponse("Ticket ID is required", { status: 400 })
    }

    // Find the ticket and check if it's already used
    const ticket = await db.ticket.findUnique({
      where: {
        id: ticketId,
      },
    })

    if (!ticket) {
      return new NextResponse("Ticket not found", { status: 404 })
    }

    if (ticket.status !== "CONFIRMED") {
      return new NextResponse("Ticket is not valid or already used", { status: 400 })
    }

    // Mark the ticket as used
    await db.ticket.update({
      where: {
        id: ticketId,
      },
      data: {
        status: "USED",
        usedAt: new Date(),
      },
    })

    return new NextResponse(null, { 
      status: 303,
      headers: {
        Location: `/verify/success?ticket=${ticketId}`,
      },
    })
  } catch (error) {
    console.error("[VERIFY_TICKET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
} 