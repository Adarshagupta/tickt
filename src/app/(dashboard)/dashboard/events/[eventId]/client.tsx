"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import type { MainEvent, SubEvent } from ".prisma/client"
import { Loading } from "@/components/loading"
import { EventImage } from "@/components/event-image"

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
    <>
      {isRegistering && <Loading />}
      <div className="space-y-8">
        <div className="relative rounded-xl overflow-hidden">
          <div className="aspect-[21/9] w-full">
            <EventImage
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-3xl font-bold tracking-tight">{event.title}</h1>
            <p className="mt-2 text-white/80">
              Organized by {event.organization.name}
            </p>
            {!isOrganizer && event.status === "PUBLISHED" && subEvents.length === 0 && (
              <button
                type="button"
                disabled={isRegistering || isRegistered}
                onClick={registerForEvent}
                className="mt-4 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
            <div className="absolute top-4 right-4 flex items-center space-x-4">
              <Link
                href={`/dashboard/events/${event.id}/edit`}
                className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-white/20 transition-colors hover:bg-white/20"
              >
                Edit Event
              </Link>
              <Link
                href={`/dashboard/events/${event.id}/sub-events/create`}
                className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500"
              >
                Add Sub-Event
              </Link>
            </div>
          )}
        </div>

        {isOrganizer && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <div className="absolute top-0 right-0 h-20 w-20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative">
              <h3 className="text-sm font-medium text-amber-800">Event Status: {event.status}</h3>
              {event.status === "DRAFT" && (
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    This event is currently in draft mode. Only organizers can see it.
                    Publish it to make it visible to users.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-indigo-950">Details</h2>
              <p className="mt-3 whitespace-pre-wrap text-indigo-900/60">
                {event.description}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-indigo-950">Date & Time</h3>
              <div className="mt-3 space-y-1.5 text-indigo-900/60">
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
              <h3 className="font-medium text-indigo-950">Venue</h3>
              <p className="mt-3 text-indigo-900/60">{event.venue}</p>
            </div>

            {isOrganizer && (
              <div>
                <h3 className="font-medium text-indigo-950">Status</h3>
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    event.status === "PUBLISHED"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {event.status.charAt(0) + event.status.slice(1).toLowerCase()}
                </span>
              </div>
            )}
          </div>

          <div>
            <h2 className="text-lg font-semibold text-indigo-950 mb-4">
              {isOrganizer ? "All Sub-Events" : "Available Sub-Events"}
            </h2>
            <div className="divide-y divide-gray-100 rounded-xl bg-white shadow-sm ring-1 ring-gray-200/50">
              {subEvents.length === 0 ? (
                <div className="p-6 text-center text-indigo-900/60">
                  {isOrganizer ? "No sub-events yet" : "No sub-events available"}
                </div>
              ) : (
                subEvents.map((subEvent) => (
                  <div key={subEvent.id} className="group relative overflow-hidden transition-colors hover:bg-gray-50">
                    <div className="flex p-6">
                      <div className="relative h-20 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                        <EventImage
                          src={subEvent.imageUrl}
                          alt={subEvent.title}
                          className="h-full w-full"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium text-indigo-950">{subEvent.title}</h3>
                            <div className="mt-1 space-y-1">
                              <p className="text-sm text-indigo-900/60">
                                {new Date(subEvent.startDate).toLocaleDateString()}
                              </p>
                              {isOrganizer ? (
                                <span
                                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                    subEvent.status === "PUBLISHED"
                                      ? "bg-green-50 text-green-700"
                                      : "bg-amber-50 text-amber-700"
                                  }`}
                                >
                                  {subEvent.status}
                                </span>
                              ) : (
                                subEvent.isRegistered && (
                                  <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                                    Registered
                                  </span>
                                )
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <Link
                              href={`/dashboard/events/${event.id}/sub-events/${subEvent.id}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                            >
                              {isOrganizer ? "Manage" : "View details"}
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 