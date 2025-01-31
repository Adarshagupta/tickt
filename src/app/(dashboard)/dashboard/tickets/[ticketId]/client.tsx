"use client"

import { useEffect } from "react"
import QRCodeStyling from "qr-code-styling"

interface QRCodeProps {
  ticketNumber: string
  userId: string
  eventId: string
  subEventId: string
  ticketId: string
  eventTitle: string
  subEventTitle: string
  startDate: string
  venue: string
  organizationName: string
}

export function QRCodeGenerator({ 
  ticketNumber, 
  userId, 
  eventId, 
  subEventId, 
  ticketId,
  eventTitle,
  subEventTitle,
  startDate,
  venue,
  organizationName
}: QRCodeProps) {
  useEffect(() => {
    // Create verification URL with encrypted data
    const verificationData = {
      t: ticketId, // ticket ID
      u: userId, // user ID
      e: eventId, // event ID
      s: subEventId // sub-event ID
    }
    
    // Create the verification URL
    const verificationUrl = `${window.location.origin}/verify/${Buffer.from(JSON.stringify(verificationData)).toString('base64')}`

    const qrCode = new QRCodeStyling({
      width: 256,
      height: 256,
      data: verificationUrl,
      dotsOptions: {
        color: "#4F46E5",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#FFFFFF",
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 0
      }
    })

    const qrCodeElement = document.getElementById("qrcode")
    if (qrCodeElement) {
      qrCodeElement.innerHTML = ""
      qrCode.append(qrCodeElement)
    }
  }, [ticketNumber, userId, eventId, subEventId, ticketId, eventTitle, subEventTitle, startDate, venue, organizationName])

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div id="qrcode" className="w-64 h-64" />
    </div>
  )
} 