# QA-sjekkliste

Bruk denne listen etter at ekte Supabase-verdier er lagt inn i `.env`.

## Supabase

- Kjør `supabase/schema.sql` i Supabase SQL Editor.
- Opprett minst én teknikerbruker i Supabase Auth.
- Sett en testbruker til `admin` i `public.users`.
- Bekreft at tekniker kun ser egne saker.
- Bekreft at admin ser alle saker.

## Appflyt

- Logg inn med e-post og passord.
- Opprett ny sak med adresse, status, kontakt, telefon, serienummer og notat.
- Bekreft at saken dukker opp i `Saker`.
- Endre status og bekreft historikk.
- Arkiver saken og bekreft at den flyttes til `Arkiv`.
- Gjenåpne saken og bekreft at den blir synlig igjen.
- Åpne `Kart`, beregn optimal rute og vis stopp-rekkefølge.
- Slå på `Prioriter etter hastegrad` og beregn rute igjen.

## PWA

- Kjør produksjonsbuild med `npm run build`.
- Bekreft at `dist/manifest.json` finnes.
- Bekreft at `dist/sw.js` finnes.
- Installer appen fra en støttet nettleser.
- Slå av nettverk og bekreft at app-shell åpner.
- Logg inn, hent saker/historikk, slå av nettverk og bekreft at sist hentede data vises.

## Vercel

- Legg inn `VITE_SUPABASE_URL` og `VITE_SUPABASE_ANON_KEY` som environment variables.
- Deploy prosjektet.
- Åpne `/saker`, `/kart`, `/arkiv` og `/historikk` direkte etter deploy og bekreft at Vercel rewrite fungerer.
