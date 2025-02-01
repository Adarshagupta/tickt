"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Loading } from "@/components/loading"

interface Event {
  id: string
  title: string
  description: string
  startDate: string
  endDate: string
  venue: string
  status: "DRAFT" | "PUBLISHED"
}

interface EditEventFormProps {
  eventId: string
}

export function EditEventForm({ eventId }: EditEventFormProps) {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [event, setEvent] = useState<Event | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    venue: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch event")
        }
        const data = await response.json()
        
        if (!data.data) {
          throw new Error("Event not found")
        }

        setEvent(data.data)
        setFormData({
          title: data.data.title,
          description: data.data.description,
          startDate: new Date(data.data.startDate).toISOString().slice(0, 16),
          endDate: new Date(data.data.endDate).toISOString().slice(0, 16),
          venue: data.data.venue,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load event")
        router.push("/dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    if (status === "authenticated") {
      fetchEvent()
    }
  }, [eventId, router, status])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update event")
      }

      router.push(`/dashboard/events/${eventId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update event")
    } finally {
      setIsSaving(false)
    }
  }

  const handlePublish = async () => {
    setIsSaving(true)
    setError(null)

    try {
      const response = await fetch(`/api/events/${eventId}/publish`, {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to publish event")
      }

      router.push(`/dashboard/events/${eventId}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to publish event")
    } finally {
      setIsSaving(false)
    }
  }

  if (status === "loading" || isLoading) {
    return <Loading />
  }

  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  if (!event) {
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm ring-1 ring-gray-200/50">
      <div className="relative overflow-hidden rounded-t-xl bg-gradient-to-br from-indigo-500 to-violet-500 px-6 py-8">
        <div className="absolute inset-0 bg-grid-white/10" />
        <div className="relative flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold tracking-tight">Edit Event</h1>
            <p className="mt-1 text-indigo-100">
              Make changes to your event details or publish it
            </p>
          </div>
          {event.status === "DRAFT" && (
            <button
              onClick={handlePublish}
              disabled={isSaving}
              className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-white shadow-sm backdrop-blur-sm ring-1 ring-white/25 hover:bg-white/20 disabled:opacity-50 transition-colors"
            >
              {isSaving ? "Publishing..." : "Publish Event"}
            </button>
          )}
        </div>
      </div>

      <div className="p-6">
        {error && (
          <div className="mb-6 rounded-lg bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-900">
                Event Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="mt-2 block w-full rounded-lg border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                placeholder="Enter event title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-900">
                Description
              </label>
              <div className="mt-2">
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  required
                  className="block w-full rounded-lg border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  placeholder="Describe your event"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-900">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full rounded-lg border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>

              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-900">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="mt-2 block w-full rounded-lg border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-900">
                Venue
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                required
                className="mt-2 block w-full rounded-lg border-0 px-3 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                placeholder="Enter venue location"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-4 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:from-indigo-500 hover:to-violet-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 