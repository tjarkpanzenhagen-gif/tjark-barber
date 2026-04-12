import { cookies } from 'next/headers'

const COOKIE = 'admin_session'

export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || ''
}

export async function isAdminAuthed(): Promise<boolean> {
  const cookieStore = await cookies()
  const value = cookieStore.get(COOKIE)?.value || ''
  const pw = getAdminPassword()
  return !!pw && value === pw
}
