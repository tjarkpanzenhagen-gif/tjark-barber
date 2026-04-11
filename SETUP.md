# Setup

## 1. Supabase – SQL ausführen

Gehe zu **Supabase Dashboard → SQL Editor** und führe den Inhalt von `supabase/schema.sql` aus.

## 2. .env.local anpassen

```
ADMIN_EMAIL=deine-echte@email.de
NEXT_PUBLIC_ADMIN_EMAIL=deine-echte@email.de
RESEND_API_KEY=re_...  ← von resend.com
FROM_EMAIL=noreply@deine-domain.de
CRON_SECRET=ein-langer-zufälliger-string
```

Wichtig: `ADMIN_EMAIL` und `NEXT_PUBLIC_ADMIN_EMAIL` müssen identisch sein.
Das ist die E-Mail mit der du dich in Supabase registrierst — sie bekommt Admin-Rechte.

## 3. Resend

- Domain auf resend.com verifizieren (oder eine `@resend.dev` Testadresse verwenden)
- API Key generieren und eintragen

## 4. Vercel Deployment

- Repo pushen, auf vercel.com importieren
- Alle Env-Variablen aus `.env.local` in Vercel eintragen
- Cron Job läuft automatisch täglich um 18 Uhr (konfiguriert in `vercel.json`)

## 5. Lokal starten

```bash
npm run dev
```
