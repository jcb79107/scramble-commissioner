# Scramble Commissioner

An open-source, mobile-first web app for running golf scrambles.

The app is designed for small events with 4-6 teams where the public can follow results, teams can enter scores from private links, contest markers can enter closest-to-the-pin or long-drive attempts, and Jason can edit the event from a password-protected admin route. It tracks live standings, side games, payouts, and who owes what.

Live site: https://scramble-commissioner.vercel.app

## Current Status

This is a mobile-first event-day rebuild. The UI uses the final Scramble logo assets with a quieter classic golf color system and a centered phone-width shell.

Included now:

- Next.js app scaffold
- Chevy Chase Country Club Scramble seed event
- Public event board at `/`
- Private team score links at `/score/[token]`
- Per-contest entry links at `/contest/[token]`
- Password-protected admin HQ on a hidden operator route
- Live leaderboard calculation
- Player-level buy-in, payout, and net balance calculation
- Editable captains in the event model
- Supabase schema for the production data model
- Focused tests for scoring, proxy winners, payouts, access links, and event summaries

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
- Hidden admin HQ: `http://localhost:3000/jason`
- Team 9:30 scorecard: `http://localhost:3000/score/team-930-preview-token`
- Hole 6 contest entry: `http://localhost:3000/contest/contest-hole-6-preview-token`
- Invalid-token check: `http://localhost:3000?access=bad-token`

Local admin fallback password is `1436` when not running in production or Vercel.

## Event-Day Operator Notes

Use the production root URL as the public scoreboard:

```text
https://scramble-commissioner.vercel.app
```

Open `/jason` before the round. Admin HQ includes private links for:

- Admin controls
- Each team's locked scorecard link
- Each closest-to-pin and long-drive contest link

Send each team only its own scorecard link. Send contest-hole links to the person entering closest-to-pin or long-drive results. Unknown or mistyped legacy access tokens fall back to the public event board.

For preview deployments, a direct anonymous `curl` can return `401` when Vercel project SSO protection is enabled. Browser testing from an authenticated Vercel session should still work. Production public traffic should use the production alias above.

Before event day, run:

```bash
npm run lint
npm run test
npm run build
git diff --check
```

Then smoke-check public, admin, one team-scorecard link, one contest/proxy link, and an invalid-token link.

## Supabase

Copy `.env.example` to `.env.local` and fill in the project values:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SCRAMBLE_ADMIN_PASSWORD=
SCRAMBLE_ADMIN_SESSION_SECRET=
```

Apply the database schema from:

```bash
supabase/schema.sql
```

If the production database was created from an older version of this app, update it before event day so it has the new `contest_marker` access role, `captain_player_id` on teams, and contest metadata columns on `access_links`.

V1 uses opaque access tokens for team scorer and contest marker links. Server actions enforce token checks for writes. Public event data is readable so the live event board can refresh from Supabase realtime; access links remain server-only.

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
