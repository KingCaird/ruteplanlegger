# Trøndelag Ruteplanlegger

Lettvekts feltstyringssystem og ruteplanlegger for serviceteknikere.

## Teknologi

- React + TypeScript + Vite
- Supabase Auth, database og API
- React Query
- Leaflet, OpenStreetMap/Nominatim og OSRM
- PWA via Vite PWA
- Vercel-klar SPA-routing

## Kom i gang

```bash
npm install
npm run dev
```

Appen kjører lokalt på `http://127.0.0.1:5173` når Vite startes med standardoppsett.

## Miljøvariabler

Kopier `.env.example` til `.env` og fyll inn Supabase-verdiene:

```bash
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Appen kan startes uten `.env`, men innlogging og datahenting holdes igjen til Supabase-konfigurasjonen er satt.

## Supabase

Kjør SQL-en i `supabase/schema.sql` i Supabase SQL Editor. Skjemaet oppretter:

- `users`
- `cases`
- `history`
- trigger for brukerprofil ved signup
- RPC for å sikre brukerprofil for eksisterende auth-brukere
- RLS-policyer for admin og tekniker

SQL-en kan kjøres flere ganger under utvikling. RPC-funksjonene gis kun til `authenticated`, og `ensure_user_profile()` avviser kall uten innlogget bruker.

Nye brukere får rollen `tekniker`. Endre rolle til `admin` i `public.users` ved behov.

## PWA og offline

Builden genererer `manifest.json` og service worker automatisk. Manifestet bruker egne `favicon.svg`, `pwa-icon-192.svg`, `pwa-icon-512.svg` og `maskable-icon.svg`. App-shell og bygde assets precaches automatisk. Service workeren cacher også:

- OpenStreetMap-kartfliser
- Nominatim-geokoding
- OSRM-ruteoptimalisering

Nettlesere som støtter installasjon viser et installasjonsbanner i appen. Nye databaseendringer krever nettverk, men appen kan åpnes som installert PWA og viser offline-varsel når nettverket er borte. Siste vellykkede saker og historikk caches lokalt per innlogget bruker og ryddes ved utlogging.

## Historikk

Historikk opprettes ved:

- ny sak
- statusendring
- arkivering
- gjenåpning

Meldingstekstene styres samlet i `src/lib/historyMessages.ts`.

## Kart og rute

Kartet viser aktive saker med koordinater som cluster-markører. Normal rute bruker OSRM Trip for optimalisert stopp-rekkefølge. Når `Prioriter etter hastegrad` er aktivert, beholdes appens hasteprioriterte rekkefølge og OSRM Route brukes til å beregne kjørelinje, tid og distanse.

Ny sak bruker Nominatim med norsk språk og Norge-prioritering for geokoding.

## Kvalitetssjekk

```bash
npm run lint
npm run build
```

Appen har global feilgrense rundt React-treet, slik at uventede runtime-feil gir en ryddig feilmelding og mulighet til å laste siden på nytt.

## Deploy

Prosjektet er klart for Vercel. `vercel.json` sender alle klientruter tilbake til `index.html`, slik at `/saker`, `/kart`, `/arkiv` og `/historikk` fungerer etter reload.

Se `QA_CHECKLIST.md` for full manuell sluttkontroll med ekte Supabase- og Vercel-oppsett.
