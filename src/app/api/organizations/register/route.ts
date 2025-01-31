import { hash } from "bcryptjs"
import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { z } from "zod"
import { PrismaClient } from "@prisma/client"

const organizationSchema = z.object({
  organization: z.object({
    name: z.string().min(1, "Organization name is required"),
    description: z.string().optional(),
    website: z.string().url().optional(),
  }),
  admin: z.object({
    name: z.string().min(1, "Admin name is required"),
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
  }),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { organization, admin } = organizationSchema.parse(body)

    // Check if email exists
    const existingUser = await db.user.findUnique({
      where: { email: admin.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "User with this email already exists" },
        { status: 409 }
      )
    }

    // Check if organization name exists
    const existingOrg = await db.organization.findFirst({
      where: { name: organization.name },
    })

    if (existingOrg) {
      return NextResponse.json(
        { message: "Organization with this name already exists" },
        { status: 409 }
      )
    }

    const hashedPassword = await hash(admin.password, 10)

    // Create organization and admin user in a transaction
    const result = await db.$transaction(async (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use">) => {
      const org = await tx.organization.create({
        data: {
          name: organization.name,
          description: organization.description,
          website: organization.website,
        },
      })

      const user = await tx.user.create({
        data: {
          name: admin.name,
          email: admin.email,
          password: hashedPassword,
          role: "ADMIN",
        },
      })

      await tx.organizationMember.create({
        data: {
          organizationId: org.id,
          userId: user.id,
          role: "OWNER",
        },
      })

      return { org, user }
    })

    return NextResponse.json(
      {
        organization: {
          name: result.org.name,
        },
        user: {
          name: result.user.name,
          email: result.user.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json(
      { message: "Something went wrong" },
      { status: 500 }
    )
  }
} 
