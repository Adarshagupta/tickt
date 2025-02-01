"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Loading } from "@/components/loading"
import { EventImage } from "@/components/event-image"

interface SubEventClientProps {
  subEvent: {
    id: string
    title: string
    description: string
    startDate: Date
    endDate: Date
    venue: string
    status: string
    mainEvent: {
      id: string
      title: string
      organization: {
        name: string
      }
    }
    registrations: Array<{
      id: string
      status: string
    }>
    imageUrl: string
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
    <>
      {(isPublishing || isRegistering) && <Loading />}
      <div className="space-y-8">
        <div className="relative rounded-xl overflow-hidden">
          <div className="aspect-[21/9] w-full">
            <EventImage
              src={subEvent.imageUrl}
              alt={subEvent.title}
              className="h-full w-full"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <Link
              href={`/dashboard/events/${subEvent.mainEvent.id}`}
              className="inline-flex items-center text-sm text-white/80 hover:text-white transition-colors"
            >
              <svg className="mr-1.5 h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M17 10a.75.75 0 01-.75.75H5.612l4.158 4.158a.75.75 0 11-1.04 1.04l-5.5-5.5a.75.75 0 010-1.08l5.5-5.5a.75.75 0 111.04 1.04L5.612 9.25H16.25A.75.75 0 0117 10z" clipRule="evenodd" />
              </svg>
              Back to {subEvent.mainEvent.title}
            </Link>
            <h1 className="mt-2 text-3xl font-bold tracking-tight">{subEvent.title}</h1>
            <p className="mt-2 text-white/80">
              Organized by {subEvent.mainEvent.organization.name}
            </p>
          </div>
          {isOrganizer ? (
            <div className="absolute top-4 right-4 flex items-center space-x-4">
              <Link
                href={`/dashboard/events/${subEvent.mainEvent.id}/sub-events/${subEvent.id}/edit`}
                className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-2.5 text-sm font-medium text-white shadow-sm ring-1 ring-white/20 transition-colors hover:bg-white/20"
              >
                Edit Sub-Event
              </Link>
              {subEvent.status === "DRAFT" && (
                <button
                  type="button"
                  disabled={isPublishing}
                  onClick={publishSubEvent}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPublishing ? "Publishing..." : "Publish Sub-Event"}
                </button>
              )}
            </div>
          ) : (
            subEvent.status === "PUBLISHED" && (
              <div className="absolute top-4 right-4">
                <button
                  type="button"
                  disabled={isRegistering || isRegistered}
                  onClick={registerForSubEvent}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:from-indigo-500 hover:to-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isRegistered 
                    ? "Already Registered" 
                    : isRegistering 
                      ? "Registering..." 
                      : "Register for Sub-Event"}
                </button>
              </div>
            )
          )}
        </div>

        {isOrganizer && (
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 p-6">
            <div className="absolute top-0 right-0 h-20 w-20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-yellow-500/20 transform rotate-45 translate-x-1/2 -translate-y-1/2" />
            </div>
            <div className="relative">
              <h3 className="text-sm font-medium text-amber-800">Sub-Event Status: {subEvent.status}</h3>
              {subEvent.status === "DRAFT" && (
                <div className="mt-2 text-sm text-amber-700">
                  <p>
                    This sub-event is currently in draft mode. Only organizers can see it.
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
                {subEvent.description}
              </p>
            </div>

            <div>
              <h3 className="font-medium text-indigo-950">Date & Time</h3>
              <div className="mt-3 space-y-1.5 text-indigo-900/60">
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
              <h3 className="font-medium text-indigo-950">Venue</h3>
              <p className="mt-3 text-indigo-900/60">{subEvent.venue}</p>
            </div>

            {isOrganizer && (
              <div>
                <h3 className="font-medium text-indigo-950">Status</h3>
                <span
                  className={`mt-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    subEvent.status === "PUBLISHED"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}
                >
                  {subEvent.status.charAt(0) + subEvent.status.slice(1).toLowerCase()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
} 