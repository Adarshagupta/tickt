"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { MainEvent, SubEvent } from ".prisma/client"

interface EventClientProps {
  event: MainEvent & {
    organization: {
      name: string
    }
  }
  isOrganizer: boolean
  isRegistered: boolean
  subEvents: (SubEvent & { isRegistered: boolean })[]
}

export function EventClient({ event, isOrganizer, isRegistered, subEvents }: EventClientProps) {
  const [isRegistering, setIsRegistering] = useState(false)
  const router = useRouter()

  const registerForEvent = async () => {
    try {
      setIsRegistering(true)
      const response = await fetch(`/api/events/${event.id}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || "Failed to register for event")
      }

      router.refresh()
    } catch (error) {
      console.error("Error registering for event:", error)
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
          <h1 className="text-2xl font-bold tracking-tight">{event.title}</h1>
          <p className="text-muted-foreground">
            Organized by {event.organization.name}
          </p>
          {!isOrganizer && event.status === "PUBLISHED" && subEvents.length === 0 && (
            <button
              type="button"
              disabled={isRegistering || isRegistered}
              onClick={registerForEvent}
              className="mt-4 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRegistered 
                ? "Already Registered" 
                : isRegistering 
                  ? "Registering..." 
                  : "Register for Event"}
            </button>
          )}
        </div>
        {isOrganizer && (
          <div className="flex items-center space-x-4">
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              Edit Event
            </Link>
            <Link
              href={`/dashboard/events/${event.id}/sub-events/create`}
              className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              Add Sub-Event
            </Link>
          </div>
        )}
      </div>

      {isOrganizer && (
        <div className="rounded-md bg-yellow-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">Event Status: {event.status}</h3>
              {event.status === "DRAFT" && (
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    This event is currently in draft mode. Only organizers can see it.
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
              {event.description}
            </p>
          </div>

          <div>
            <h3 className="font-medium">Date & Time</h3>
            <div className="mt-2 text-gray-600">
              <p>
                Start: {new Date(event.startDate).toLocaleDateString()}{" "}
                {new Date(event.startDate).toLocaleTimeString()}
              </p>
              <p>
                End: {new Date(event.endDate).toLocaleDateString()}{" "}
                {new Date(event.endDate).toLocaleTimeString()}
              </p>
            </div>
          </div>

          <div>
            <h3 className="font-medium">Venue</h3>
            <p className="mt-2 text-gray-600">{event.venue}</p>
          </div>

          {isOrganizer && (
            <div>
              <h3 className="font-medium">Status</h3>
              <span
                className={`mt-2 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  event.status === "PUBLISHED"
                    ? "bg-green-100 text-green-800"
                    : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
              </span>
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">
            {isOrganizer ? "All Sub-Events" : "Available Sub-Events"}
          </h2>
          <div className="divide-y divide-gray-200 rounded-lg border bg-white">
            {subEvents.length === 0 ? (
              <div className="p-4 text-center text-sm text-gray-500">
                {isOrganizer ? "No sub-events yet" : "No sub-events available"}
              </div>
            ) : (
              subEvents.map((subEvent) => (
                <div key={subEvent.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">{subEvent.title}</h3>
                      <div className="mt-1 space-y-1">
                        <p className="text-sm text-gray-500">
                          {new Date(subEvent.startDate).toLocaleDateString()}
                        </p>
                        {isOrganizer ? (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              subEvent.status === "PUBLISHED"
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {subEvent.status}
                          </span>
                        ) : (
                          subEvent.isRegistered && (
                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                              Registered
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <div className="ml-4">
                      <Link
                        href={`/dashboard/events/${event.id}/sub-events/${subEvent.id}`}
                        className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        {isOrganizer ? "Manage" : "View details"}
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 