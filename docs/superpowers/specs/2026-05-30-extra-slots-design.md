# Extra Slots Feature — Design Spec
_2026-05-30_

## Ziel

Im Admin-Panel können für bereits freigegebene Tage einzelne zusätzliche Zeitslots außerhalb des normalen Start/End-Fensters manuell hinzugefügt und entfernt werden.

---

## Datenbank

Neue Tabelle in Supabase:

```sql
extra_slots (
  id    uuid primary key default gen_random_uuid(),
  date  date not null,
  time  time not null,
  unique(date, time)
)
```

- Kein RLS erforderlich — Zugriff nur über Admin-Client
- `unique(date, time)` verhindert Duplikate

---

## API

### Bestehende Route erweitert

**`GET /api/slots?date=YYYY-MM-DD`**
- Lädt zusätzlich `extra_slots` für das Datum
- Mergt Extra-Zeiten als `available: true` in die Slot-Liste (dedupliziert nach Zeit)
- Extra-Slots sind von der "nur benachbarte Slots"-Einschränkung ausgenommen
- Bereits gebuchte Extra-Slots werden wie normale gebuchte Slots behandelt (gefiltert)

### Neue Routen (alle schreib-Endpunkte mit `isAdminAuthed()` geschützt)

| Method | Route | Beschreibung |
|--------|-------|--------------|
| `GET` | `/api/extra-slots?date=YYYY-MM-DD` | Alle Extra-Slots eines Tages |
| `POST` | `/api/extra-slots` | Extra-Slot hinzufügen `{ date, time }` |
| `DELETE` | `/api/extra-slots/[id]` | Extra-Slot löschen |

---

## Admin Panel UI

Neuer Abschnitt unterhalb des Start/End-Formulars im Tag-Detail-Panel.

- Erscheint nur wenn `is_available: true`
- Zeigt bestehende Extra-Slots als Chips mit Löschen-Button (×)
- `<input type="time">` + "Hinzufügen"-Button
- Jede Aktion (Add/Delete) wirkt sofort via API-Call — kein separates Speichern nötig
- Wird nach jeder Aktion neu geladen

---

## Betroffene Dateien

| Datei | Änderung |
|-------|----------|
| Supabase Migration | Neue `extra_slots` Tabelle |
| `app/api/extra-slots/route.ts` | Neu: GET + POST |
| `app/api/extra-slots/[id]/route.ts` | Neu: DELETE |
| `app/api/slots/route.ts` | Extra-Slots mergen |
| `app/admin/page.tsx` | UI-Sektion im Tag-Panel |
