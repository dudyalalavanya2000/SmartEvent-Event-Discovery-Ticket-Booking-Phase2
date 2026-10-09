import { useState } from "react"

function TicketCard({ ticket }) {
  const [downloading, setDownloading] = useState(false)

  const getQrUrl = () => {
    if (!ticket.qr_code_url) {
      return null
    }

    const fileName = ticket.qr_code_url.split(/[\\/]/).pop()

    return `http://127.0.0.1:8000/qr-codes/${fileName}`
  }

  const qrUrl = getQrUrl()

  const handleDownload = async () => {
    try {
      setDownloading(true)

      if (!qrUrl) {
        throw new Error("QR code is not available")
      }

      const response = await fetch(qrUrl)

      if (!response.ok) {
        throw new Error("Failed to load QR code")
      }

      const qrBlob = await response.blob()

      const reader = new FileReader()

      reader.onloadend = () => {
        const qrDataUrl = reader.result

        const eventDate = ticket.event_date
          ? new Date(ticket.event_date).toLocaleString()
          : "N/A"

        const createdDate = ticket.created_at
          ? new Date(ticket.created_at).toLocaleString()
          : "N/A"

        const ticketHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>SmartEvent Ticket - ${ticket.ticket_code}</title>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 40px 20px;
      background: #f1f5f9;
      font-family: Arial, Helvetica, sans-serif;
      color: #0f172a;
    }

    .ticket {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 10px 35px rgba(15, 23, 42, 0.15);
    }

    .header {
      background: #4f46e5;
      color: white;
      padding: 30px;
    }

    .header h1 {
      margin: 0;
      font-size: 30px;
    }

    .header p {
      margin: 8px 0 0;
      color: #e0e7ff;
    }

    .content {
      padding: 35px;
    }

    .event-title {
      font-size: 28px;
      font-weight: bold;
      margin-bottom: 25px;
    }

    .details {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .detail {
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 12px;
    }

    .label {
      color: #64748b;
      font-size: 12px;
      text-transform: uppercase;
      font-weight: bold;
      margin-bottom: 6px;
    }

    .value {
      font-size: 16px;
      font-weight: 600;
    }

    .total {
      margin-top: 25px;
      padding: 18px;
      background: #eef2ff;
      border-radius: 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .total strong {
      font-size: 22px;
      color: #4f46e5;
    }

    .qr-section {
      margin-top: 30px;
      padding-top: 30px;
      border-top: 2px dashed #cbd5e1;
      text-align: center;
    }

    .qr-section img {
      width: 230px;
      height: 230px;
      object-fit: contain;
      border: 1px solid #e2e8f0;
      padding: 10px;
      border-radius: 12px;
    }

    .ticket-code {
      margin-top: 15px;
      font-size: 18px;
      font-weight: bold;
      letter-spacing: 1px;
    }

    .footer {
      padding: 20px 35px;
      background: #f8fafc;
      text-align: center;
      color: #64748b;
      font-size: 13px;
    }

    @media print {
      body {
        background: white;
        padding: 0;
      }

      .ticket {
        box-shadow: none;
        max-width: 100%;
      }
    }

    @media (max-width: 600px) {
      .details {
        grid-template-columns: 1fr;
      }

      .content {
        padding: 25px;
      }

      .header {
        padding: 25px;
      }
    }
  </style>
</head>

<body>

  <div class="ticket">

    <div class="header">
      <h1>🎫 SmartEvent</h1>
      <p>Event Ticket</p>
    </div>

    <div class="content">

      <div class="event-title">
        ${ticket.event_title || "Event"}
      </div>

      <div class="details">

        <div class="detail">
          <div class="label">Category</div>
          <div class="value">
            ${ticket.event_category || "N/A"}
          </div>
        </div>

        <div class="detail">
          <div class="label">Event Date & Time</div>
          <div class="value">
            ${eventDate}
          </div>
        </div>

        <div class="detail">
          <div class="label">Location</div>
          <div class="value">
            📍 ${ticket.event_location || "N/A"}
          </div>
        </div>

        <div class="detail">
          <div class="label">Ticket Price</div>
          <div class="value">
            ₹${Number(ticket.ticket_price || 0).toFixed(2)}
          </div>
        </div>

        <div class="detail">
          <div class="label">Ticket Quantity</div>
          <div class="value">
            ${ticket.ticket_quantity || 0}
          </div>
        </div>

        <div class="detail">
          <div class="label">Booking ID</div>
          <div class="value">
            #${ticket.booking_id}
          </div>
        </div>

      </div>

      <div class="total">
        <span>Total Amount</span>
        <strong>
          ₹${Number(ticket.total_price || 0).toFixed(2)}
        </strong>
      </div>

      <div class="qr-section">

        <h3>Scan QR Code</h3>

        <img
          src="${qrDataUrl}"
          alt="SmartEvent Ticket QR Code"
        />

        <div class="ticket-code">
          ${ticket.ticket_code}
        </div>

        <p>
          Present this QR code at the event entrance.
        </p>

      </div>

    </div>

    <div class="footer">
      SmartEvent — Event Discovery & Ticket Booking System
      <br />
      Ticket generated on ${createdDate}
    </div>

  </div>

</body>
</html>
`

        const blob = new Blob(
          [ticketHtml],
          { type: "text/html" }
        )

        const downloadUrl =
          window.URL.createObjectURL(blob)

        const link =
          document.createElement("a")

        link.href = downloadUrl

        link.download =
          `SmartEvent-Ticket-${ticket.ticket_code}.html`

        document.body.appendChild(link)

        link.click()

        link.remove()

        window.URL.revokeObjectURL(downloadUrl)

        setDownloading(false)
      }

      reader.readAsDataURL(qrBlob)

    } catch (error) {
      console.error(
        "Ticket download failed:",
        error
      )

      alert(
        "Unable to download the complete ticket."
      )

      setDownloading(false)
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-lg ring-1 ring-slate-200">

      {/* Header */}
      <div className="bg-indigo-600 px-6 py-5 text-white">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="text-sm font-medium text-indigo-100">
              SmartEvent Ticket
            </p>

            <h2 className="mt-1 text-xl font-bold">
              Ticket #{ticket.id}
            </h2>

          </div>

          <span className="text-4xl">
            🎫
          </span>

        </div>

      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">

        {/* Ticket Details */}
        <div className="space-y-5">

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Event
            </p>

            <p className="mt-1 text-xl font-bold text-slate-900">
              {ticket.event_title}
            </p>

            <p className="mt-1 text-sm text-slate-500">
              {ticket.event_category}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Date & Time
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {ticket.event_date
                ? new Date(
                    ticket.event_date
                  ).toLocaleString()
                : "N/A"}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Location
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              📍 {ticket.event_location}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ticket Price
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              ₹{Number(ticket.ticket_price).toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Tickets
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              {ticket.ticket_quantity}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Total Amount
            </p>

            <p className="mt-1 text-lg font-bold text-indigo-600">
              ₹{Number(ticket.total_price).toFixed(2)}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Ticket Code
            </p>

            <p className="mt-1 break-all text-sm font-bold text-slate-900">
              {ticket.ticket_code}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Booking ID
            </p>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              #{ticket.booking_id}
            </p>
          </div>

          {/* Download Complete Ticket */}
          {qrUrl && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              className="mt-3 w-full rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {downloading
                ? "Preparing Ticket..."
                : "⬇️ Download Complete Ticket"}
            </button>
          )}

        </div>

        {/* QR */}
        <div className="flex flex-col items-center justify-center rounded-2xl bg-slate-50 p-5">

          <p className="mb-4 text-sm font-semibold text-slate-700">
            Scan QR Code
          </p>

          {qrUrl ? (
            <img
              src={qrUrl}
              alt={`QR Code for ticket ${ticket.ticket_code}`}
              className="h-56 w-56 rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
            />
          ) : (
            <div className="flex h-56 w-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center text-sm text-slate-500">
              QR code not available
            </div>
          )}

          <p className="mt-4 text-center text-xs text-slate-500">
            Keep this QR code available for event verification.
          </p>

        </div>

      </div>

    </div>
  )
}

export default TicketCard