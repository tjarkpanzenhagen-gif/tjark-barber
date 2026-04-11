import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@barbershop.de'
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@barbershop.de'
const SHOP_NAME = process.env.NEXT_PUBLIC_SHOP_NAME || 'Barber'

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-')
  return `${d}.${m}.${y}`
}

function formatTime(time: string) {
  return time.slice(0, 5)
}

export async function sendBookingConfirmation(to: string, { date, time, name }: { date: string; time: string; name: string }) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Terminbestätigung – ${formatDate(date)} um ${formatTime(time)}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#d4a853;margin:0 0 8px">${SHOP_NAME}</h1>
        <h2 style="font-weight:400;margin:0 0 24px;color:#ccc">Terminbestätigung</h2>
        <p>Hallo ${name},</p>
        <p>dein Termin wurde erfolgreich gebucht.</p>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:4px 0">📅 <strong>${formatDate(date)}</strong></p>
          <p style="margin:4px 0">🕐 <strong>${formatTime(time)} Uhr</strong></p>
        </div>
        <p style="color:#999;font-size:14px">Stornierung ist bis 2 Stunden vor dem Termin möglich.</p>
      </div>
    `,
  })
}

export async function sendCancellationConfirmation(to: string, { date, time, name }: { date: string; time: string; name: string }) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject: `Terminstornierung – ${formatDate(date)} um ${formatTime(time)}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#d4a853;margin:0 0 8px">${SHOP_NAME}</h1>
        <h2 style="font-weight:400;margin:0 0 24px;color:#ccc">Terminstornierung</h2>
        <p>Hallo ${name},</p>
        <p>dein Termin wurde storniert.</p>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:4px 0">📅 <strong>${formatDate(date)}</strong></p>
          <p style="margin:4px 0">🕐 <strong>${formatTime(time)} Uhr</strong></p>
        </div>
        <p style="color:#999;font-size:14px">Du kannst jederzeit einen neuen Termin buchen.</p>
      </div>
    `,
  })
}

export async function sendAdminNewBooking({ customerEmail, customerName, date, time }: { customerEmail: string; customerName: string; date: string; time: string }) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Neue Buchung – ${formatDate(date)} um ${formatTime(time)}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#d4a853;margin:0 0 8px">${SHOP_NAME}</h1>
        <h2 style="font-weight:400;margin:0 0 24px;color:#ccc">Neue Buchung</h2>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:4px 0">👤 <strong>${customerName}</strong></p>
          <p style="margin:4px 0">📧 ${customerEmail}</p>
          <p style="margin:4px 0">📅 <strong>${formatDate(date)}</strong></p>
          <p style="margin:4px 0">🕐 <strong>${formatTime(time)} Uhr</strong></p>
        </div>
      </div>
    `,
  })
}

export async function sendAdminCancellation({ customerEmail, customerName, date, time }: { customerEmail: string; customerName: string; date: string; time: string }) {
  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Stornierung – ${formatDate(date)} um ${formatTime(time)}`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#d4a853;margin:0 0 8px">${SHOP_NAME}</h1>
        <h2 style="font-weight:400;margin:0 0 24px;color:#ccc">Termin storniert</h2>
        <div style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:16px;margin:24px 0">
          <p style="margin:4px 0">👤 <strong>${customerName}</strong></p>
          <p style="margin:4px 0">📧 ${customerEmail}</p>
          <p style="margin:4px 0">📅 <strong>${formatDate(date)}</strong></p>
          <p style="margin:4px 0">🕐 <strong>${formatTime(time)} Uhr</strong></p>
        </div>
      </div>
    `,
  })
}

export async function sendDailySummary(bookings: Array<{ name: string; time: string; email: string }>, date: string) {
  if (bookings.length === 0) return

  const rows = bookings
    .map(b => `<tr><td style="padding:8px 12px;border-bottom:1px solid #333">${formatTime(b.time)} Uhr</td><td style="padding:8px 12px;border-bottom:1px solid #333">${b.name}</td><td style="padding:8px 12px;border-bottom:1px solid #333;color:#999">${b.email}</td></tr>`)
    .join('')

  await resend.emails.send({
    from: FROM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `Tagesübersicht für ${formatDate(date)} – ${bookings.length} Termin${bookings.length !== 1 ? 'e' : ''}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#111;color:#fff;padding:32px;border-radius:12px">
        <h1 style="color:#d4a853;margin:0 0 8px">${SHOP_NAME}</h1>
        <h2 style="font-weight:400;margin:0 0 4px;color:#ccc">Tagesübersicht</h2>
        <p style="color:#999;margin:0 0 24px">${formatDate(date)} – ${bookings.length} Termin${bookings.length !== 1 ? 'e' : ''}</p>
        <table style="width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:8px;overflow:hidden">
          <thead>
            <tr style="background:#222">
              <th style="padding:10px 12px;text-align:left;color:#d4a853">Zeit</th>
              <th style="padding:10px 12px;text-align:left;color:#d4a853">Name</th>
              <th style="padding:10px 12px;text-align:left;color:#d4a853">E-Mail</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `,
  })
}
