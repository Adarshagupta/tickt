import { hash } from "bcryptjs"
import { db } from "../src/lib/db"

async function main() {
  const password = await hash("admin123", 10)

  const admin = await db.user.create({
    data: {
      name: "Admin User",
      email: "admin@example.com",
      password,
      role: "ADMIN",
    },
  })

  console.log("Admin user created:", admin)
}

main()
  .catch(console.error)
  .finally(() => process.exit()) 