# Design Spec: Naturwerk Landschaftspflege Website ("mathias")

**Datum:** 2026-04-11  
**Client:** Naturwerk Landschaftspflege Bäcker & Martens GbR  
**Projekt-Codename:** mathias  
**Ziel:** Moderne Marketing-Landingpage als Demo für den ersten echten Client. Die Demo entspricht dem finalen Produkt — keine Platzhalter-Versprechen.

---

## Kontext

Naturwerk Landschaftspflege ist ein deutsches Unternehmen für Baum- und Gartenpflege, gegründet durch die Fusion zweier Betriebe (Mathias Bäcker & John Martens). Die bestehende Website (naturwerk-landschaftspflege.de) ist sehr simpel und soll durch eine moderne, attraktive Landingpage ersetzt werden.

**Sprache:** Deutsch  
**Zielgruppe:** Potenzielle Privat- und Gewerbekunden in der Region

---

## Architektur

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS v4
- **Icons:** Hugeicons
- **Fonts:** Stardom (Fontshare) als Display-Font für Headlines; System-Serif als Fallback für Fließtext
- **Typ:** Single-Page Landingpage mit Smooth-Scroll-Navigation
- **Backend:** Kein Backend nötig — reine statische Präsentationsseite

---

## Seitenstruktur

### 1. Navigation (sticky)
- Logo links
- Smooth-Scroll-Links: Über uns, Leistungen, Team, Galerie, Kontakt
- WhatsApp-CTA-Button rechts (Hugeicon + Text)

### 2. Hero
- Fullscreen-Hintergrundbild (Natur/Bäume) mit warmem dunklen Overlay
- Logo zentriert oder oben links
- Firmenname in Stardom-Font, groß
- Tagline: "Natur mit Erfahrung pflegen"
- Zwei CTA-Buttons: WhatsApp (Hugeicon) & Instagram (Hugeicon)
- Sanfte Scroll-Indikator-Animation nach unten

### 3. Über uns
- Kurzer, persönlicher Text zur Firmengeschichte (Fusion der zwei Unternehmen)
- Foto der Gründer oder Team-Bild
- Warm & nahbar formuliert

### 4. Leistungen
- 8 Cards in einem Grid (2–4 Spalten je nach Viewport):
  1. Baumpflege
  2. Baumfällung
  3. Baumkontrolle (zertifiziert)
  4. Forstarbeiten
  5. Sturmschadensbeseitigung
  6. Garten- & Grünflächenpflege
  7. Heckenschnitt
  8. Obstbaumschnitt
- Jede Card: Hugeicon + Titel + kurze Beschreibung (1–2 Sätze)

### 5. Team
- 4 Personen: Mathias Bäcker, John Martens, Denise (Administration), Lydia (Finanzen)
- Foto + Name + Rolle
- Warme, persönliche Darstellung

### 6. Galerie
- Bildgitter (Masonry oder gleichmäßiges Grid) aus echten Arbeitsfotos
- Hover-Effekt: leichtes Abdunkeln mit Hugeicon-Lupe
- Platzhalter-Bilder (Natur-Thema) bis echte Fotos geliefert werden
- Bilder sind direkt tauschbar (statische Imports oder public/-Ordner)

### 7. Footer / Kontakt
- Großer WhatsApp-Button (Hauptkonversion)
- Instagram-Link mit Icon
- Firmenname & kurze Adresse
- Impressum-Link (leere Seite als Platzhalter)
- Copyright

---

## Ästhetik & Design

### Farbpalette
```
--color-forest:   #2C3E2D   /* tiefes Waldgrün — Hauptfarbe */
--color-moss:     #5C7A3E   /* Moosgrün — Akzent */
--color-bark:     #7A5C3A   /* Rindbraun — warmer Akzent */
--color-cream:    #F5EDD8   /* Creme/Beige — Hintergrund */
--color-parchment:#EDE0C4   /* Pergament — Card-Hintergrund */
--color-soil:     #3D2B1F   /* Dunkelbraun — Text */
```

### Typografie
- **Display / Headlines:** Stardom (Fontshare) — für H1, H2, Sektionsnamen
- **Body:** Georgia oder ähnlicher System-Serif — für Fließtext, Card-Beschreibungen
- Fontsource-Import via `@font-face` von Fontshare CDN

### Texturen & Atmosphäre
- Leichte Papier-/Grain-Textur als Overlay auf Sektionen (CSS noise oder SVG-Filter)
- Dezente Holz- oder Erde-Textur als Hintergrund für Leistungs-Sektion
- Warme dunkle Overlays auf Bilder

### Animationen
- Scroll-triggered fade-in + slide-up für Sektionen (Intersection Observer, CSS)
- Staggered reveal für Leistungs-Cards
- Hover-States auf Buttons und Cards: sanfte Übergänge

---

## Dateistruktur

```
mathias/
├── app/
│   ├── layout.tsx          # Font-Import, Metadaten
│   ├── page.tsx            # Haupt-Landingpage (importiert alle Sektionen)
│   └── impressum/
│       └── page.tsx        # Leere Impressum-Platzhalter-Seite
├── components/
│   ├── Nav.tsx
│   ├── Hero.tsx
│   ├── About.tsx
│   ├── Services.tsx
│   ├── Team.tsx
│   ├── Gallery.tsx
│   └── Footer.tsx
├── public/
│   ├── images/             # Platzhalter-Bilder (tauschbar)
│   └── logo.png            # Firmenlogo
└── ...
```

---

## Platzhalter-Strategie

Alle Bilder (Hero, Team-Fotos, Galerie) werden als Platzhalter aus dem `public/images/`-Ordner geladen. Die Dateinamen sind semantisch (`hero-bg.jpg`, `team-mathias.jpg`, etc.), sodass der Client die echten Fotos einfach mit demselben Dateinamen ersetzen kann.

---

## Was explizit NICHT enthalten ist

- Kein Kontaktformular (WhatsApp ist die Hauptkonversion)
- Kein CMS / keine Admin-Oberfläche
- Keine Mehrsprachigkeit
- Kein Buchungssystem
- Keine Analytics-Integration (kann später ergänzt werden)
