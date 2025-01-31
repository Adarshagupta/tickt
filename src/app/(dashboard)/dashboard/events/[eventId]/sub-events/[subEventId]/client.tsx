"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { SubEvent, Ticket } from ".prisma/client"

interface SubEventClientProps {
  subEvent: SubEvent & {
    mainEvent: {
      id: string
      title: string
      organization: {
        name: string
      }
    }
    registrations: Ticket[]
  }
  isOrganizer: boolean
}

export function SubEventClient({ subEvent, isOrganizer }: SubEventClientProps) {
  const [isPublishing, setIsPublishing] = useState(false)
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()

  const isRegistered = subEvent.registrations.length > 0

  const publishSubEvent = async () => {
    try {
      setIsPublishing(true)
      const response = await fetch(
        `/api/events/${subEvent.mainEvent.id}/sub-events/${subEvent.id}/publish`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to publish sub-event")
      }

      router.refresh()
    } catch (error) {
      console.error("Error publishing sub-event:", error)
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setIsPublishing(false)
    }
  }

  const registerForSubEvent = async () => {
    try {
      setIsRegistering(true)
      const response = await fetch(
        `/api/events/${subEvent.mainEvent.id}/sub-events/${subEvent.id}/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to register for sub-event")
      }

      router.refresh()
    } catch (error) {
      console.error("Error registering for sub-event:", error)
      if (error instanceof Error) {
        alert(error.message)
      }
    } finally {
      setIsRegistering(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href={`/dashboard/events/${subEvent.mainEvent.id}`}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to {subEvent.mainEvent.title}
          </Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">{subEvent.title}</h1>
          <p className="text-muted-foreground">
            Organized by {subEvent.mainEvent.organization.name}
          </p>
        </div>
        {isOrganizer ? (
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/events/${subEvent.mainEvent.id}/sub-events/${subEvent.id}/edit`}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Edit Sub-Event
            </Link>
            {subEvent.status === "DRAFT" && (
              <button
                type="button"
                disabled={isPublishing}
                onClick={publishSubEvent}
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing ? "Publishing..." : "Publish Sub-Event"}
              </button>
            )}
          </div>
        ) : (
          subEvent.status === "PUBLISHED" && (
            <button
              type="button"
              disabled={isRegistering || isRegistered}
              onClick={registerForSubEvent}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistered 
                ? "Already Registered" 
                : isRegistering 
                  ? "Registering..." 
                  : "Register for Sub-Event"}
            </button>
          )
        )}
      </div>

      {isOrganizer && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Sub-Event Status: {subEvent.status}</h3>
              {subEvent.status === "DRAFT" && (
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This sub-event is currently in draft mode. Only organizers can see it.
                    Publish it to make it visible to users.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Details</h2>
            <p className="mt-2 whitespace-pre-wrap text-gray-600">
              {subEvent.description}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Date & Time</h3>
            <div className="mt-2 text-gray-600">
              <p>
                Start: {new Date(subEvent.startDate).toLocaleDateString()}{" "}
                {new Date(subEvent.startDate).toLocaleTimeString()}
              </p>
              <p>
                End: {new Date(subEvent.endDate).toLocaleDateString()}{" "}
                {new Date(subEvent.endDate).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Venue</h3>
            <p className="mt-2 text-gray-600">{subEvent.venue}</p>
          </div>

          {isOrganizer && (
            <div>
              <h3 className="font-medium">Status</h3>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  subEvent.status === "PUBLISHED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {subEvent.status.charAt(0) + subEvent.status.slice(1).toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-medium">Ticket Information</h2>
            <div className="mt-4 rounded-lg border bg-white p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Price</h3>
                  <p className="mt-1 text-2xl font-semibold">
                    ${subEvent.price.toFixed(2)}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Capacity</h3>
                  <p className="mt-1">{subEvent.capacity} attendees</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500">Event Type</h3>
                  <p className="mt-1">{subEvent.eventType}</p>
                </div>

                {!isOrganizer && subEvent.status === "PUBLISHED" && (
                  <button
                    type="button"
                    disabled={isRegistering || isRegistered}
                    onClick={registerForSubEvent}
                    className="mt-4 w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRegistered 
                      ? "Already Registered" 
                      : isRegistering 
                        ? "Registering..." 
                        : "Purchase Ticket"}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 