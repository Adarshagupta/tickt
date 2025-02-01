"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loading } from "@/components/loading"

interface CreateSubEventPageProps {
  params: {
    eventId: string
  }
}

export default function CreateSubEventPage({ params }: CreateSubEventPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const startDate = formData.get("startDate") as string
    const endDate = formData.get("endDate") as string
    const venue = formData.get("venue") as string
    const capacity = formData.get("capacity") as string
    const price = formData.get("price") as string
    const eventType = formData.get("eventType") as string

    try {
      const response = await fetch(`/api/events/${params.eventId}/sub-events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          startDate,
          endDate,
          venue,
          capacity: parseInt(capacity),
          price: parseFloat(price),
          eventType,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      const { subEvent } = await response.json()
      router.push(`/dashboard/events/${params.eventId}/sub-events/${subEvent.id}`)
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

  if (!session?.user) {
    return null
  }

  return (
    <>
      {isLoading && <Loading />}
      <div className="max-w-2xl mx-auto">
        <div className="space-y-8">
          <div>
            <div className="relative">
              <div className="absolute -left-4 top-0 h-12 w-1 bg-gradient-to-b from-indigo-600 to-violet-600 rounded-r-full" />
              <h1 className="text-2xl font-bold text-indigo-950">Create Sub-Event</h1>
              <p className="mt-2 text-indigo-900/60">
                Add a new sub-event to your main event
              </p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-indigo-950">
                  Title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-indigo-950">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-indigo-950">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    name="startDate"
                    type="datetime-local"
                    required
                    className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                  />
                </div>

                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-indigo-950">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    name="endDate"
                    type="datetime-local"
                    required
                    className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="venue" className="block text-sm font-medium text-indigo-950">
                  Venue
                </label>
                <input
                  id="venue"
                  name="venue"
                  type="text"
                  required
                  className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label htmlFor="capacity" className="block text-sm font-medium text-indigo-950">
                    Capacity
                  </label>
                  <input
                    id="capacity"
                    name="capacity"
                    type="number"
                    min="1"
                    required
                    className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                  />
                </div>

                <div>
                  <label htmlFor="price" className="block text-sm font-medium text-indigo-950">
                    Price
                  </label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-indigo-950">
                  Event Type
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  required
                  className="mt-2 block w-full rounded-xl border-0 px-4 py-2.5 text-indigo-950 ring-1 ring-gray-200/50 transition-shadow focus:ring-2 focus:ring-indigo-600 focus:ring-offset-0"
                >
                  <option value="GENERAL">General</option>
                  <option value="COMPETITION">Competition</option>
                  <option value="WORKSHOP">Workshop</option>
                  <option value="PERFORMANCE">Performance</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-indigo-950 shadow-sm ring-1 ring-gray-200/50 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Creating..." : "Create Sub-Event"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
} 