# Azeena & Ali - Wedding Invitation (MVP)

Mobile-first animated invitation. Static site, no build step.

## Features
- Arch + Bismillah intro with golden shimmer and a tap-to-open seal
- Petal burst on open, gentle falling petals (respects reduced-motion)
- Scroll-reveal sections, live countdown to 17 Jan 2027, 11:30 AM IST
- View Location (Google Maps), Add to Calendar (.ics), Share on WhatsApp, tap-to-call

## Run locally
```
python3 -m http.server 8000
```
Open http://localhost:8000 on your phone (same Wi-Fi) or desktop.

## Deploy
Vercel / Netlify / GitHub Pages: point to repo root, no build command.

## Edit details
- Text: `index.html`
- Date/venue/calendar: `EVENT` in `script.js`
- Colors: CSS variables at top of `style.css`
- Exact map pin: replace the `href` of `#mapBtn` with your QR's Google Maps link.
