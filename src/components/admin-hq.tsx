import {
  ADMIN_PATH,
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

type AdminSection = "overview" | "links" | "teams" | "scores" | "money";

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
  activeSection,
  logoutAction,
  updateEventAction,
  updateMoneyAction,
  updateTeamAction,
  updateScoreAction,
}: {
  event: ScrambleEvent;
  origin: string | null | undefined;
  activeSection: AdminSection;
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
      <BrandHeader
        eyebrow="Commissioner desk"
        title="Scramble Admin"
        meta={event.name}
        action={
          <form action={logoutAction}>
            <button
              type="submit"
              className="min-h-10 rounded-full border border-[var(--fairway)]/15 bg-white px-3 text-xs font-semibold text-[var(--ink)]"
            >
              Lock
            </button>
          </form>
        }
      />
      <ScreenBody>

        <StatGrid>
          <StatTile label="Scores" value={`${completeScores}/${event.scores.length}`} />
          <StatTile label="Leader" value={leaderboard[0]?.teamName ?? "TBD"} />
          <StatTile label="Links" value={privateLinks.length} />
          <StatTile
            label="Money"
            value={`$${balances.reduce((sum, balance) => sum + balance.buyInTotal, 0)}`}
          />
        </StatGrid>

        <AdminSectionNav activeSection={activeSection} />

        {activeSection === "overview" && (
          <>
            <Section title="Event Snapshot" eyebrow="Today">
              <div className="overflow-hidden rounded-[22px] border border-[var(--mist)] bg-white">
                <AdminRow label="Name" value={event.name} />
                <AdminRow label="Date" value={event.date} />
                <AdminRow label="Venue" value={event.venue} />
                <AdminRow label="Address" value={event.address} />
              </div>
            </Section>

            <Section title="Data Checklist" eyebrow="Ready check">
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
          </>
        )}

        {activeSection === "links" && <PrivateLinksList links={privateLinks} />}

        {activeSection === "teams" && (
          <Section title="Teams & Captains" eyebrow="Edit pairings">
            <div className="space-y-3">
              {event.teams.map((team) => {
                const captain = getTeamCaptain(team);

                return (
                  <form
                    key={team.id}
                    action={updateTeamAction}
                    className="space-y-3 rounded-[22px] border border-[var(--mist)] bg-white p-4"
                  >
                    <input type="hidden" name="teamId" value={team.id} />
                    <TextInput label="Team" name="name" defaultValue={team.name} />
                    <TextInput label="Tee time" name="teeTime" defaultValue={team.teeTime} />
                    <label className="grid gap-1.5 text-sm font-semibold">
                      Captain
                      <select
                        name="captainPlayerId"
                        defaultValue={captain.id}
                        className="min-h-12 rounded-2xl border border-[var(--mist)] bg-white px-4"
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
        )}

        {activeSection === "scores" && (
          <Section title="Score Override" eyebrow="Fix a card">
            <form action={updateScoreAction} className="space-y-3">
              <label className="grid gap-1.5 text-sm font-semibold">
                Team
                <select
                  name="teamId"
                  className="min-h-12 rounded-2xl border border-[var(--mist)] bg-white px-4"
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
        )}

        {activeSection === "money" && (
          <>
            <Section title="Edit Event" eyebrow="Public context">
              <form action={updateEventAction} className="space-y-3">
                <TextInput label="Name" name="name" defaultValue={event.name} />
                <TextInput label="Date" name="date" type="date" defaultValue={event.date} />
                <TextInput label="Venue" name="venue" defaultValue={event.venue} />
                <TextInput label="Address" name="address" defaultValue={event.address} />
                <SubmitButton>Save Event</SubmitButton>
              </form>
            </Section>

            <Section title="Money Settings" eyebrow="Buy-ins and payouts">
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
          </>
        )}
      </ScreenBody>
    </>
  );
}

function AdminSectionNav({ activeSection }: { activeSection: AdminSection }) {
  const links = [
    { section: "overview", label: "Activity" },
    { section: "links", label: "Private links", mobileLabel: "Links" },
    { section: "teams", label: "Teams" },
    { section: "scores", label: "Scores" },
    { section: "money", label: "Money" },
  ] satisfies Array<{ section: AdminSection; label: string; mobileLabel?: string }>;

  return (
    <nav className="sticky top-3 z-20 rounded-[22px] border border-[#d8c07d]/45 bg-white/90 p-1 shadow-[0_12px_28px_rgba(17,32,23,0.1)] backdrop-blur">
      <div className="grid grid-cols-5 gap-1.5">
        {links.map((link) => {
          const active = link.section === activeSection;

          return (
            <a
              key={link.section}
              href={`${ADMIN_PATH}?section=${link.section}`}
              aria-current={active ? "page" : undefined}
              className={
                active
                  ? "flex min-h-10 items-center justify-center rounded-[18px] bg-[var(--pine)] px-2 text-center text-[12px] font-semibold leading-tight text-white shadow-[0_8px_18px_rgba(17,32,23,0.16)] sm:min-h-11 sm:text-sm"
                  : "flex min-h-10 items-center justify-center rounded-[18px] border border-transparent px-2 text-center text-[12px] font-semibold leading-tight text-[var(--ink)]/68 transition hover:border-[var(--mist)] hover:bg-[var(--sand)]/70 hover:text-[var(--ink)] sm:min-h-11 sm:text-sm"
              }
            >
              <span className="sm:hidden">{"mobileLabel" in link ? link.mobileLabel : link.label}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function PrivateLinksList({ links }: { links: PrivateAccessLink[] }) {
  return (
    <Section title="Private Links" eyebrow="Send these">
      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-[22px] border border-[var(--mist)] bg-white p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="truncate text-sm font-black">{link.label}</div>
                <div className="text-xs text-[var(--muted)]">{link.description}</div>
              </div>
              <a
                href={link.href}
                className="shrink-0 rounded-full bg-[var(--pine)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-white"
              >
                Open
              </a>
            </div>
            <p className="mt-2 truncate rounded-2xl bg-[var(--sand)]/70 px-3 py-2 font-mono text-[10px] text-[var(--muted)]">
              {link.href}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function AdminRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid min-h-14 grid-cols-[120px_minmax(0,1fr)] items-center gap-3 border-b border-[var(--mist)] px-4 py-3 text-sm last:border-b-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fairway)]/62">
        {label}
      </span>
      <span className="truncate font-semibold text-[var(--ink)]">{value}</span>
    </div>
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
