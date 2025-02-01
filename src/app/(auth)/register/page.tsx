"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loading } from "@/components/loading"

export default function RegisterPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOrganization, setIsOrganization] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const organizationName = isOrganization ? formData.get("organizationName") as string : null
    const organizationDescription = isOrganization ? formData.get("organizationDescription") as string : null

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          isOrganization,
          organizationName,
          organizationDescription,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Something went wrong")
      }

      router.push("/login?registered=true")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {isLoading && <Loading />}
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
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

        <div className="relative sm:mx-auto sm:w-full sm:max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              Ticketing
            </Link>
            <h2 className="mt-6 text-2xl font-bold text-indigo-950">
              Create your account
            </h2>
            <p className="mt-2 text-sm text-indigo-900/60">
              Sign up to get started with Ticketing
            </p>
          </div>

          <div className="relative bg-white py-8 px-4 shadow-sm ring-1 ring-gray-200/50 sm:rounded-xl sm:px-10">
            <div className="absolute top-0 right-0 h-32 w-32">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
            </div>

            <div className="mb-6">
              <div className="flex items-center justify-center space-x-4">
                <button
                  type="button"
                  onClick={() => setIsOrganization(false)}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors ${
                    !isOrganization
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                      : "text-indigo-950 hover:bg-gray-50 ring-1 ring-gray-200/50"
                  }`}
                >
                  Attendee
                </button>
                <button
                  type="button"
                  onClick={() => setIsOrganization(true)}
                  className={`flex-1 py-2.5 px-4 text-sm font-medium rounded-lg transition-colors ${
                    isOrganization
                      ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-sm"
                      : "text-indigo-950 hover:bg-gray-50 ring-1 ring-gray-200/50"
                  }`}
                >
                  Host Events
                </button>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-6 relative">
              {error && (
                <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-indigo-950">
                  Full name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className="mt-2 block w-full rounded-lg border border-gray-200/50 px-3 py-2 bg-white/50 text-indigo-950 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-indigo-950">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="mt-2 block w-full rounded-lg border border-gray-200/50 px-3 py-2 bg-white/50 text-indigo-950 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-indigo-950">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  className="mt-2 block w-full rounded-lg border border-gray-200/50 px-3 py-2 bg-white/50 text-indigo-950 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                />
              </div>

              {isOrganization && (
                <>
                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-indigo-950">
                      Organization name
                    </label>
                    <input
                      id="organizationName"
                      name="organizationName"
                      type="text"
                      required
                      className="mt-2 block w-full rounded-lg border border-gray-200/50 px-3 py-2 bg-white/50 text-indigo-950 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="organizationDescription" className="block text-sm font-medium text-indigo-950">
                      Organization description
                    </label>
                    <textarea
                      id="organizationDescription"
                      name="organizationDescription"
                      rows={3}
                      required
                      className="mt-2 block w-full rounded-lg border border-gray-200/50 px-3 py-2 bg-white/50 text-indigo-950 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                    />
                  </div>
                </>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex w-full justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-60"
                >
                  {isLoading ? "Creating account..." : "Create account"}
                </button>
              </div>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-indigo-900/60">Already have an account?</span>{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 