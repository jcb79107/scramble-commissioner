import {
  buildPrivateAccessLinks,
  type PrivateAccessLink,
} from "@/lib/access-links";
import { buildLeaderboard, getPlayerBalances } from "@/lib/calculations";
import { getContestHoles, getTeamCaptain } from "@/lib/event-summary";
import type { ScrambleEvent } from "@/lib/types";
import {
  BrandHeader,
  ScreenBody,
  Section,
  StatGrid,
  StatTile,
  SubmitButton,
  TextInput,
} from "./scramble-shell";

export function AdminLogin({
  error,
  action,
}: {
  error?: boolean;
  action: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <>
      <BrandHeader eyebrow="Admin HQ" title="Password required" meta="Jason's event controls" />
      <ScreenBody>
        {error && (
          <div className="rounded-md border border-[var(--flag-red)]/40 bg-[var(--flag-red)]/8 p-3 text-sm font-black text-[var(--flag-red)]">
            That password did not work.
          </div>
        )}
        <form action={action} className="space-y-4">
          <Section title="Admin Login">
            <label className="grid gap-1 text-sm font-bold">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                className="min-h-12 rounded-md border border-[var(--line)] bg-white px-3"
              />
            </label>
          </Section>
          <SubmitButton>Unlock Admin HQ</SubmitButton>
        </form>
      </ScreenBody>
    </>
  );
}

export function AdminHQ({
  event,
  origin,
  logoutAction,
  updateEventAction,
  updateMoneyAction,
  updateTeamAction,
  updateScoreAction,
}: {
  event: ScrambleEvent;
  origin: string | null | undefined;
  logoutAction: () => void | Promise<void>;
  updateEventAction: (formData: FormData) => void | Promise<void>;
  updateMoneyAction: (formData: FormData) => void | Promise<void>;
  updateTeamAction: (formData: FormData) => void | Promise<void>;
  updateScoreAction: (formData: FormData) => void | Promise<void>;
}) {
  const leaderboard = buildLeaderboard(event);
  const balances = getPlayerBalances(event);
  const privateLinks = buildPrivateAccessLinks(event, origin);
  const completeScores = event.scores.filter((score) => score.strokes !== null).length;

  return (
    <>
      <BrandHeader eyebrow="Admin HQ" title="Edit Everything" meta={event.name} />
      <ScreenBody>
        <form action={logoutAction}>
          <button
            type="submit"
            className="min-h-10 w-full rounded-md border border-[var(--brand-green)] bg-white text-sm font-black uppercase tracking-[0.08em] text-[var(--brand-green)]"
          >
            Lock Admin
          </button>
        </form>

        <StatGrid>
          <StatTile label="Scores" value={`${completeScores}/${event.scores.length}`} />
          <StatTile label="Leader" value={leaderboard[0]?.teamName ?? "TBD"} />
          <StatTile label="Links" value={privateLinks.length} />
          <StatTile
            label="Money"
            value={`$${balances.reduce((sum, balance) => sum + balance.buyInTotal, 0)}`}
          />
        </StatGrid>

        <PrivateLinksList links={privateLinks} />

        <Section title="Edit Event">
          <form action={updateEventAction} className="space-y-3">
            <TextInput label="Name" name="name" defaultValue={event.name} />
            <TextInput label="Date" name="date" type="date" defaultValue={event.date} />
            <TextInput label="Venue" name="venue" defaultValue={event.venue} />
            <TextInput label="Address" name="address" defaultValue={event.address} />
            <SubmitButton>Save Event</SubmitButton>
          </form>
        </Section>

        <Section title="Teams & Captains">
          <div className="space-y-3">
            {event.teams.map((team) => {
              const captain = getTeamCaptain(team);

              return (
                <form
                  key={team.id}
                  action={updateTeamAction}
                  className="space-y-2 rounded-md border border-[var(--line)] bg-[var(--paper)] p-3"
                >
                  <input type="hidden" name="teamId" value={team.id} />
                  <TextInput label="Team" name="name" defaultValue={team.name} />
                  <TextInput label="Tee time" name="teeTime" defaultValue={team.teeTime} />
                  <label className="grid gap-1 text-sm font-bold">
                    Captain
                    <select
                      name="captainPlayerId"
                      defaultValue={captain.id}
                      className="min-h-11 rounded-md border border-[var(--line)] bg-white px-3"
                    >
                      {team.players.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <SubmitButton>Save Team</SubmitButton>
                </form>
              );
            })}
          </div>
        </Section>

        <Section title="Score Override">
          <form action={updateScoreAction} className="space-y-3">
            <label className="grid gap-1 text-sm font-bold">
              Team
              <select
                name="teamId"
                className="min-h-11 rounded-md border border-[var(--line)] bg-white px-3"
              >
                {event.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </label>
            <TextInput label="Hole" name="hole" type="number" defaultValue={1} />
            <TextInput label="Strokes" name="strokes" type="number" />
            <SubmitButton>Save Score</SubmitButton>
          </form>
        </Section>

        <Section title="Money Settings">
          <form action={updateMoneyAction} className="space-y-3">
            <TextInput
              label="Round estimate"
              name="roundCostEstimate"
              type="number"
              defaultValue={event.money.roundCostEstimate}
            />
            <TextInput
              label="Scramble buy-in"
              name="scrambleBuyIn"
              type="number"
              defaultValue={event.money.scrambleBuyIn}
            />
            <TextInput
              label="Closest buy-in per hole"
              name="closestToPinBuyInPerHole"
              type="number"
              defaultValue={event.money.closestToPinBuyInPerHole}
            />
            <TextInput
              label="Long drive buy-in per hole"
              name="longDriveBuyInPerHole"
              type="number"
              defaultValue={event.money.longDriveBuyInPerHole}
            />
            <SubmitButton>Save Money</SubmitButton>
          </form>
        </Section>

        <Section title="Data Checklist">
          <div className="space-y-2 text-sm">
            <ChecklistItem label="Team score links" done={event.teams.every((team) => team.accessToken)} />
            <ChecklistItem
              label="Contest links"
              done={getContestHoles(event).every((hole) => hole.contestAccessToken)}
            />
            <ChecklistItem
              label="Captains assigned"
              done={event.teams.every((team) => team.captainPlayerId)}
            />
            <ChecklistItem label="Money settings" done={event.money.scrambleBuyIn > 0} />
          </div>
        </Section>
      </ScreenBody>
    </>
  );
}

function PrivateLinksList({ links }: { links: PrivateAccessLink[] }) {
  return (
    <Section title="Private Links">
      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-md border border-[var(--line)] bg-[var(--paper)] p-2"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-black">{link.label}</div>
                <div className="text-xs text-[var(--muted)]">{link.description}</div>
              </div>
              <a
                href={link.href}
                className="shrink-0 rounded-sm bg-[var(--brand-green)] px-2 py-1 text-[10px] font-black uppercase text-white"
              >
                Open
              </a>
            </div>
            <p className="mt-2 truncate rounded-sm bg-white px-2 py-1 font-mono text-[10px] text-[var(--muted)]">
              {link.href}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function ChecklistItem({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-[var(--line)] py-2 last:border-b-0">
      <span className="font-bold">{label}</span>
      <span
        className={`text-[10px] font-black uppercase tracking-[0.08em] ${
          done ? "text-[var(--brand-green)]" : "text-[var(--flag-red)]"
        }`}
      >
        {done ? "Ready" : "Needs work"}
      </span>
    </div>
  );
}
