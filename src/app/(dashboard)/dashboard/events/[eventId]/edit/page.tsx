import { Suspense } from "react"
import { EditEventForm } from "./edit-form"
import { Loading } from "@/components/loading"

export default function EditEventPage({
  params,
}: {
  params: { eventId: string }
}) {
  return (
    <div className="container max-w-2xl py-8">
      <Suspense fallback={<Loading />}>
        <EditEventForm eventId={params.eventId} />
      </Suspense>
    </div>
  )
} 
