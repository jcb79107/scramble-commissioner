# Scramble Commissioner

An open-source, commissioner-first web app for running golf scrambles.

The app is designed for small events with 4-6 teams where one commissioner manages the event, one scorer per team enters scores, and proxy markers can enter closest-to-the-pin or long-drive attempts. It tracks live standings, side games, payouts, and who owes what.

Live site: https://scramble-commissioner.vercel.app

## Current Status

This is the first hosted functional build. The UI uses the Scramble logo assets with a Masters-inspired color system.

Included now:

- Next.js app scaffold
- Chevy Chase Country Club Scramble seed event
- Branded commissioner workspace
- Public leaderboard at the root URL
- Private access links for commissioner, proxy marker, public viewer, and each team scorer
- Team score entry
- Proxy entry for closest-to-the-pin and long drive
- Live leaderboard calculation
- Player-level buy-in, payout, and net balance calculation
- Supabase schema for the production data model
- Focused tests for scoring, proxy winners, payouts, and access-link routing

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

Useful local links:

- Public leaderboard: `http://localhost:3000`
- Commissioner desk: `http://localhost:3000?access=commissioner-preview-token`
- Proxy marker: `http://localhost:3000?access=proxy-preview-token`
- Team 9:30 scorecard: `http://localhost:3000?access=team-930-preview-token`
- Invalid-token check: `http://localhost:3000?access=bad-token`

## Event-Day Operator Notes

Use the production root URL as the public scoreboard:

```text
https://scramble-commissioner.vercel.app
```

Open the commissioner private link before the round. The Commissioner view includes a Private Links panel with copy, share, and open controls for:

- Commissioner controls
- Proxy marker entry
- Public leaderboard viewer
- Each team's locked scorecard link

Send each team only its own team scorecard link. Team links open directly to that team's scorecard, hide commissioner-only controls, and keep score entry locked to that team. The proxy marker link opens only proxy entry and the leaderboard. Unknown or mistyped access tokens fall back to the public leaderboard.

For preview deployments, a direct anonymous `curl` can return `401` when Vercel project SSO protection is enabled. Browser testing from an authenticated Vercel session should still work. Production public traffic should use the production alias above.

Before event day, run:

```bash
npm run lint
npm run test
npm run build
git diff --check
```

Then smoke-check public, commissioner, proxy, one team-scorecard link, and an invalid-token link.

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
