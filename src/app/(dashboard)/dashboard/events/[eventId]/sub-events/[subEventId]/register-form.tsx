"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface RegisterFormProps {
  eventId: string
  subEventId: string
}

export function RegisterForm({ eventId, subEventId }: RegisterFormProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const attendeeName = formData.get("attendeeName") as string
    const attendeeDob = formData.get("attendeeDob") as string
    const attendeeGovId = formData.get("attendeeGovId") as string
    const attendeeGovIdType = formData.get("attendeeGovIdType") as string

    try {
      const response = await fetch(`/api/events/${eventId}/sub-events/${subEventId}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          attendeeName,
          attendeeDob,
          attendeeGovId,
          attendeeGovIdType,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to register")
      }

      router.push("/dashboard/tickets")
      router.refresh()
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Something went wrong")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label htmlFor="attendeeName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <input
            type="text"
            id="attendeeName"
            name="attendeeName"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="attendeeDob" className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <input
            type="date"
            id="attendeeDob"
            name="attendeeDob"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="attendeeGovId" className="block text-sm font-medium text-gray-700">
            Government ID Number
          </label>
          <input
            type="text"
            id="attendeeGovId"
            name="attendeeGovId"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="attendeeGovIdType" className="block text-sm font-medium text-gray-700">
            ID Type
          </label>
          <select
            id="attendeeGovIdType"
            name="attendeeGovIdType"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm"
          >
            <option value="">Select ID Type</option>
            <option value="PASSPORT">Passport</option>
            <option value="DRIVERS_LICENSE">Driver's License</option>
            <option value="NATIONAL_ID">National ID</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? "Registering..." : "Register"}
        </button>
      </div>
    </form>
  )
} 