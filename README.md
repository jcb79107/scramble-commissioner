# Scramble Commissioner

An open-source, commissioner-first web app for running golf scrambles.

The app is designed for small events with 4-6 teams where one commissioner manages the event, one scorer per team enters scores, and proxy markers can enter closest-to-the-pin or long-drive attempts. It tracks live standings, side games, payouts, and who owes what.

## Current Status

This is the first functional build. The UI is intentionally plain until the event logo/brand direction is provided.

Included now:

- Next.js app scaffold
- Chevy Chase Country Club Scramble seed event
- Team score entry
- Proxy entry for closest-to-the-pin and long drive
- Live leaderboard calculation
- Player-level buy-in, payout, and net balance calculation
- Supabase schema for the production data model
- Focused tests for scoring, proxy winners, and payouts

## Stack

- Next.js
- TypeScript
- Tailwind CSS
- Supabase
- Vitest

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Supabase

Copy `.env.example` to `.env.local` and fill in the project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

Apply the database schema from:

```bash
supabase/schema.sql
```

V1 uses opaque access tokens for commissioner, team scorer, proxy marker, and public viewer links. Direct client table access is closed by RLS until the server routes/actions enforce token checks.

## Source Event

The initial seed data is based on the Chevy Chase Country Club Scramble:

- Date: June 13, 2026
- Venue: Chevy Chase Country Club, Wheeling, IL
- Teams: 6
- Players: 24
- Closest-to-the-pin holes: 6, 9, 13, 16
- Long-drive holes: 2, 4, 15, 18
- Money tracked per player

## License

MIT
