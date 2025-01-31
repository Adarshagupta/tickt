"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { notFound } from "next/navigation"

interface EditEventPageProps {
  params: {
    eventId: string
  }
}

export default function EditEventPage({ params }: EditEventPageProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [event, setEvent] = useState<any>(null)

  // Fetch event data
  async function fetchEvent() {
    try {
      const response = await fetch(`/api/events/${params.eventId}`)
      if (!response.ok) {
        throw new Error("Failed to fetch event")
      }
      const data = await response.json()
      setEvent(data.event)
    } catch (error) {
      console.error(error)
      notFound()
    }
  }

  // Load event data on mount
  useState(() => {
    fetchEvent()
  })

  if (!session?.user || !event) {
    return null
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string,
      venue: formData.get("venue") as string,
    }

    try {
      const response = await fetch(`/api/events/${params.eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      router.push(`/dashboard/events/${params.eventId}`)
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

  async function publishEvent() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${params.eventId}/publish`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message)
      }

      router.push(`/dashboard/events/${params.eventId}`)
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
    <div className="max-w-2xl mx-auto">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
            <p className="text-muted-foreground">
              Make changes to your event or publish it
            </p>
          </div>
          {event.status === "DRAFT" && (
            <button
              onClick={publishEvent}
              disabled={isLoading}
              className="rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-50"
            >
              {isLoading ? "Publishing..." : "Publish Event"}
            </button>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4 text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium">
                Event Title
              </label>
              <input
                id="title"
                name="title"
                type="text"
                required
                defaultValue={event.title}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                rows={4}
                required
                defaultValue={event.description}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium">
                  Start Date
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="datetime-local"
                  required
                  defaultValue={new Date(event.startDate).toISOString().slice(0, 16)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium">
                  End Date
                </label>
                <input
                  id="endDate"
                  name="endDate"
                  type="datetime-local"
                  required
                  defaultValue={new Date(event.endDate).toISOString().slice(0, 16)}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium">
                Venue
              </label>
              <input
                id="venue"
                name="venue"
                type="text"
                required
                defaultValue={event.venue}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 