const ADMIN_EMAIL = process.env.ADMIN_EMAIL || ''

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email || !ADMIN_EMAIL) return false
  return email.toLowerCase() === ADMIN_EMAIL.toLowerCase()
}
