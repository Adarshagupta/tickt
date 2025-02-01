import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute right-0 top-0 w-96 h-96 -translate-y-1/2 translate-x-1/2">
          <div className="absolute inset-0 rotate-45 transform opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 blur-3xl" />
          </div>
        </div>
        <div className="absolute left-0 bottom-0 w-96 h-96 translate-y-1/2 -translate-x-1/2">
          <div className="absolute inset-0 -rotate-45 transform opacity-20">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 blur-3xl" />
          </div>
        </div>
      </div>
      
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Ticketing
              </Link>
              <div className="hidden md:flex md:items-center md:space-x-6 ml-8">
                <Link
                  href="/dashboard"
                  className="px-3 py-2 text-sm font-medium text-indigo-950 hover:text-indigo-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/events"
                  className="px-3 py-2 text-sm font-medium text-indigo-950 hover:text-indigo-600 transition-colors"
                >
                  Events
                </Link>
                <Link
                  href="/dashboard/tickets"
                  className="px-3 py-2 text-sm font-medium text-indigo-950 hover:text-indigo-600 transition-colors"
                >
                  My Tickets
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-indigo-950">
                {session.user.email}
              </span>
              <div className="h-4 w-px bg-gray-200" />
              <Link
                href="/api/auth/signout"
                className="text-sm font-medium text-indigo-950 hover:text-indigo-600 transition-colors"
              >
                Sign out
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="relative pt-16">
        <div className="mx-auto max-w-7xl p-6 sm:p-8">
          {children}
        </div>
      </main>
    </div>
  )
} 
