import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-indigo-600">
            Ticketing
          </Link>
          <nav className="flex items-center space-x-4">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-500 hover:text-gray-900"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative isolate">
          <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
                Your Ultimate Event Ticketing Platform
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Create, manage, and attend events seamlessly. Perfect for universities,
                organizations, and event planners.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                  Get started
                </Link>
                <Link
                  href="/about"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-600">
                Everything you need
              </h2>
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Features that make event management easy
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <div className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold leading-8">
                    Event Creation & Management
                  </h3>
                  <p className="mt-4 text-sm text-gray-600">
                    Create and manage events with multiple ticket types, pricing
                    options, and capacity controls.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold leading-8">
                    Secure Payments
                  </h3>
                  <p className="mt-4 text-sm text-gray-600">
                    Process payments securely with integrated payment gateways and
                    automated refund handling.
                  </p>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-lg font-semibold leading-8">
                    Analytics & Insights
                  </h3>
                  <p className="mt-4 text-sm text-gray-600">
                    Get detailed analytics on ticket sales, attendance, and event
                    performance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-500">
              &copy; 2024 Ticketing Platform. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
