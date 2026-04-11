# Email OTP Auth — Design Spec
**Date:** 2026-04-11  
**Project:** Barbershop Booking App

## Overview

Replace the existing email/password auth system with a passwordless Email OTP flow. Login and registration are combined into a single page. Supabase's built-in `signInWithOtp` handles code generation and delivery.

## User Flow

1. User visits `/login`
2. Enters email address → clicks "Code senden"
3. Receives 6-digit OTP via email (sent by Supabase)
4. Enters the 6-digit code on the same page (6 individual input fields, auto-focus)
5. **New user** (no `full_name` in Supabase user metadata): prompted to enter their name, saved via `supabase.auth.updateUser`, then redirected to `/book`
6. **Returning user**: redirected directly to `/book`

## Architecture

### Pages (after change)

| Route | Status | Notes |
|-------|--------|-------|
| `/login` | Modified | New OTP flow, replaces email/password |
| `/register` | Deleted | Merged into `/login` |
| `/forgot-password` | Deleted | Not needed — no passwords |
| `/reset-password` | Deleted | Not needed — no passwords |

### API Routes (after change)

| Route | Status | Notes |
|-------|--------|-------|
| `api/auth/login` | Deleted | Supabase client SDK used directly |
| `api/auth/register` | Deleted | No separate registration |
| `api/auth/reset-password` | Deleted | Not needed |
| `api/auth/callback` | Kept | Still needed for Supabase session handling |

### Key Supabase Calls

```ts
// Step 1: Send OTP
supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } })

// Step 2: Verify OTP
supabase.auth.verifyOtp({ email, token, type: 'email' })

// Step 3 (new users only): Save name
supabase.auth.updateUser({ data: { full_name: name } })
```

All calls are client-side — no custom API routes needed for auth.

## `/login` Page — Component States

```
'email'   → email input + "Code senden" button
'otp'     → 6-digit code input + "Bestätigen" button + "Andere Email" back link
'name'    → name input + "Weiter" button (new users only)
```

OTP input: 6 individual `<input maxLength={1}>` fields. Paste handling: distribute pasted digits across fields. Auto-advance focus on digit entry.

## What Changes in Other Pages

- `app/page.tsx`: Remove `/register` link, keep `/login`
- `app/layout.tsx`: Remove any register/forgot-password nav links if present
- `app/book/page.tsx`: No changes needed (already handles missing name gracefully via the name input field on the booking page)

## Email Delivery

Supabase's default mailer is used — no code changes required. For better deliverability, Resend can be configured as custom SMTP in the Supabase Dashboard (Auth → SMTP Settings) using the existing `RESEND_API_KEY`. This is a dashboard config step, not a code change.

## Out of Scope

- Phone/SMS verification
- Social OAuth (Google, Apple, etc.)
- Two-factor authentication
- Admin auth changes (admin access via `NEXT_PUBLIC_ADMIN_EMAIL` env var, unchanged)
