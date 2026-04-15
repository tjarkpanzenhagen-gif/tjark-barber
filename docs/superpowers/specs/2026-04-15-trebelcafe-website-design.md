# Trebelcafé Tribsees — Website Redesign Spec
**Datum:** 2026-04-15  
**Stack:** Next.js (App Router) + Tailwind CSS  
**Sprache:** Deutsch  
**Vibe:** Cozy Editorial — warm, persönlich, clean aber nicht langweilig

---

## 1. Über das Projekt

Neugestaltung der Website für das **Trebelcafé Tribsees**, ein kleines familiengeführtes Café (Familie Wendel-Bigalke) im Herzen von Tribsees. Das Café backt alles selbst und bietet Frühstück, Mittagstisch und Kaffee & Kuchen an. Die neue Website soll den warmen, gemütlichen Charakter des Cafés digital erlebbar machen.

**Aktuelle Website:** https://dastrebelcafetribsees.de/Home  
**Kontakt:** trebelcafe@gmx.de · 038320 649921

---

## 2. Visual Identity

### Farbpalette
| Rolle | Farbe | Hex |
|-------|-------|-----|
| Background | Warmes Creme | `#FAF6F0` |
| Text (primär) | Espresso-Braun | `#2C1810` |
| Akzent | Terrakotta | `#C4724A` |
| Sekundär | Sand/Pfirsich | `#E8D5C0` |
| Subtil | Salbeigrün | `#6B7C5E` |
| Kontrast-Section | Espresso-Braun | `#2C1810` |

### Typografie
- **Headlines:** Playfair Display (serif, editorial)
- **Body:** DM Sans (clean, modern)
- **Dekorative Labels:** Cormorant Garamond Italic

### Texturen & Effekte
- Feines CSS Grain-Overlay auf dem Hero (subtiler Paper-Look)
- Terrakotta-Linien als Sektions-Divider
- Karten: abgerundete Ecken (`rounded-2xl`) + leichter Schatten

---

## 3. Seitenstruktur

| Seite | Pfad | Beschreibung |
|-------|------|--------------|
| Home | `/` | Überblick, Hero, Highlights |
| Speisekarte | `/speisekarte` | Wochenkarte, Kuchen, Getränke |
| Über uns | `/ueber-uns` | Familiengeschichte, USPs |
| Galerie | `/galerie` | Masonry-Fotogrid |
| Reservierung | `/reservierung` | Buchungsformular + Buffet-Termine |
| Impressum | `/impressum` | Legal |
| Datenschutz | `/datenschutz` | Legal |

---

## 4. Navigation

- **Sticky Nav:** transparent beim Start → solid Creme + `backdrop-blur` beim Scrollen
- **Logo links:** handlettered-style "Trebelcafé" in Playfair Display
- **Links rechts:** Speisekarte · Über uns · Galerie · Reservierung
- **CTA rechts:** Button "Tisch reservieren" in Terrakotta
- **Mobile:** Hamburger-Icon → Fullscreen-Overlay mit gestaffelten Link-Einblendungen

---

## 5. Homepage Layout (von oben nach unten)

### 5.1 Hero
- Vollbild-Bild (Café-Innenraum oder Kuchentheke)
- Warmes Terrakotta/Braun-Overlay (`opacity-40`)
- CSS Grain-Overlay für Paper-Effekt
- Sehr langsamer Ken-Burns-Zoom auf dem Bild
- Content mittig:
  - Kleines Label in Cormorant Garamond Italic: *"Herzlich willkommen"*
  - H1 in Playfair Display: **"Selbstgebackenes mit Herz — mitten in Tribsees."**
  - Subtext in DM Sans: *"Familie Wendel-Bigalke begrüßt euch Do–Mo von 9 bis 17 Uhr."*
  - Zwei CTAs: `Speisekarte entdecken` (Terrakotta, filled) · `Tisch reservieren` (outline, weiß)

### 5.2 "Unser Versprechen" — 3 Icon-Cards
- Sand-farbener Hintergrund (`#E8D5C0`)
- Drei Cards horizontal:
  - 🥐 **Alles selbst gebacken** — "Jeder Kuchen, jedes Brot entsteht in unserer eigenen Küche."
  - 👨‍👩‍👧 **Familienbetrieb** — "Das Trebelcafé wird mit Liebe von Familie Wendel-Bigalke geführt."
  - ☕ **Gemütliche Atmosphäre** — "Ein Ort zum Ankommen, Verweilen und Genießen."

### 5.3 Wochenkarte-Vorschau
- Heading: *"Was kocht diese Woche?"*
- 3 Gerichte als Cards (Name, Kurzbeschreibung, Preis)
- Beispiel-Inhalte aus der echten Wochenkarte:
  - Käse-Schinken-Salat — €9,90
  - Ofenkartoffel mit Quark — €10,50
  - Bauerfrühstück — €12,90
- Link: "Zur vollen Speisekarte →" in Terrakotta

### 5.4 Über-uns-Teaser
- Split-Layout (50/50): links Café-Foto, rechts Text
- Text: kurze, persönliche Geschichte der Familie + "Wir backen alles selbst" als Highlight
- CTA: "Mehr über uns →"
- Auf Mobile: Foto oben, Text unten

### 5.5 Nächste Frühstücksbuffets
- Heading: *"Besondere Erlebnisse"*
- Datum-Cards für geplante Buffets (April, November, Dezember 2026)
- Hinweis: "Reservierung erforderlich — ruf uns an oder schreib uns."
- CTA: "Jetzt reservieren →"

### 5.6 Öffnungszeiten + Kontakt
- Dunkle Section (`#2C1810` Hintergrund, heller Text)
- Linke Spalte: Öffnungszeiten (Do–Mo 9–17 Uhr, Di+Mi geschlossen)
- Rechte Spalte: Adresse, Telefon, E-Mail, Google Maps Link
- Schließzeiten 2026 als kleiner Hinweis

---

## 6. Weitere Seiten

### Speisekarte `/speisekarte`
- Tabs oder Sections: Wochenkarte | Kuchen & Gebäck | Getränke | Frühstück
- Karten-Layout für Gerichte mit Preis
- Hinweis: "Wochenkarte wechselt regelmäßig"

### Über uns `/ueber-uns`
- Großes Familienfoto oder Café-Atmosphärefoto oben
- Geschichte in warmem, persönlichem Ton
- USPs visuell hervorgehoben
- Zitat der Familie als Pull-Quote in Playfair Display Italic

### Galerie `/galerie`
- Masonry-Grid Layout
- Hover: sanfter Zoom + leichte Abdunklung
- Kategorien optional: Innen | Kuchen | Essen | Atmosphäre

### Reservierung `/reservierung`
- Einfaches Kontaktformular: Name, Datum, Uhrzeit, Personenzahl, Nachricht
- Hinweis auf Frühstücksbuffet-Termine mit Daten
- Alternative: Direkter Anruf/E-Mail als Fallback prominent zeigen

---

## 7. Animationen & Interaktionen

### Scroll
- Alle Sections: `fade-in-up` beim Eintreten (Framer Motion oder CSS)
- Cards: Stagger-Effekt (leicht versetzt)

### Hover
- Nav-Links: Terrakotta-Unterstreichung wächst von links nach rechts
- Cards: `translateY(-4px)` + stärkerer Schatten
- Buttons: Füllfarbe fließt von links rein
- Galerie-Fotos: sanfter Zoom + Abdunklung mit Label
- "Tisch reservieren" Nav-Button: subtiler Puls-Ring

### Hero
- Ken-Burns: sehr langsamer Zoom (20s loop, `scale(1.05)`)
- Optional: subtiles Grain-Pulsieren

### Mobile Navigation
- Hamburger → Fullscreen-Overlay
- Links erscheinen gestaffelt (Stagger 100ms)

---

## 8. Technische Anforderungen

- **Framework:** Next.js 14+ mit App Router
- **Styling:** Tailwind CSS
- **Animationen:** Framer Motion
- **Fonts:** Google Fonts (Playfair Display, DM Sans, Cormorant Garamond)
- **Bilder:** `next/image` mit optimierten Formaten
- **SEO:** Meta-Tags auf jeder Seite, Open Graph, structured data für LocalBusiness
- **Responsive:** Mobile-first, Breakpoints sm/md/lg/xl
- **Performance:** Lighthouse Score > 90 angestrebt
- **Placeholder-Bilder:** Unsplash URLs für gemütliche Café-Atmosphäre (bis echte Fotos vorliegen)

---

## 9. Echter Content (aus aktueller Website)

**Öffnungszeiten:**
- Do–Mo: 9:00–17:00 Uhr
- Di+Mi: geschlossen

**Schließzeiten 2026:**
- 14.–23. Juli
- 13.–28. Oktober
- 21. Dez – 6. Jan 2027

**Frühstücksbuffet-Termine 2026:**
- April (genaue Daten auf Anfrage)
- November
- Dezember (Reservierung erforderlich)

**Wochenkarte (Beispiel):**
- Käse-Schinken-Salat — €9,90
- Ofenkartoffel mit Quark — €10,50
- Kartoffelpuffer mit Fisch — €13,90
- Ziegenkäse-Salat — €12,50
- Bauerfrühstück — €16,50

**Kontakt:**
- Telefon: 038320 649921
- E-Mail: trebelcafe@gmx.de
- Ort: Tribsees, Mecklenburg-Vorpommern
