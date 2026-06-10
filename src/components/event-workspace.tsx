"use client";

import Image from "next/image";
import {
  Banknote,
  ClipboardList,
  Copy,
  DollarSign,
  ExternalLink,
  Flag,
  Link as LinkIcon,
  ListChecks,
  LockKeyhole,
  Medal,
  NotebookTabs,
  Share2,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import {
  buildPrivateAccessLinks,
  canAccessView,
  getDefaultViewForAccess,
  getRoleLabel,
  resolveAccessToken,
  type AccessResolution,
  type PrivateAccessLink,
  type WorkspaceView,
} from "@/lib/access-links";
import { buildLeaderboard, getPlayerBalances, getProxyWinners } from "@/lib/calculations";
import { chevyChaseSeed } from "@/lib/chevy-chase-seed";
import type { LeaderboardRow, ProxyEntry, ScrambleEvent, Team } from "@/lib/types";

type EventWorkspaceProps = {
  initialAccessToken?: string | string[] | null;
  baseOrigin?: string | null;
};

type ViewConfig = {
  id: WorkspaceView;
  label: string;
  icon: ReactNode;
};

const views: ViewConfig[] = [
  { id: "commissioner", label: "Commissioner", icon: <NotebookTabs size={17} /> },
  { id: "scorecard", label: "Team Score", icon: <ClipboardList size={17} /> },
  { id: "proxy", label: "Proxy Entry", icon: <Flag size={17} /> },
  { id: "leaderboard", label: "Leaderboard", icon: <Trophy size={17} /> },
  { id: "money", label: "Money", icon: <Banknote size={17} /> },
];

export function EventWorkspace({ initialAccessToken = null, baseOrigin }: EventWorkspaceProps) {
  const seededAccess = resolveAccessToken(chevyChaseSeed, initialAccessToken);
  const [event, setEvent] = useState<ScrambleEvent>(chevyChaseSeed);
  const [activeView, setActiveView] = useState<WorkspaceView>(() =>
    getDefaultViewForAccess(seededAccess),
  );
  const [selectedTeamId, setSelectedTeamId] = useState(
    seededAccess.teamId ?? chevyChaseSeed.teams[0]?.id ?? "",
  );
  const [selectedProxyHole, setSelectedProxyHole] = useState(6);

  const access = useMemo(
    () => resolveAccessToken(event, initialAccessToken),
    [event, initialAccessToken],
  );
  const leaderboard = useMemo(() => buildLeaderboard(event), [event]);
  const proxyWinners = useMemo(() => getProxyWinners(event), [event]);
  const balances = useMemo(() => getPlayerBalances(event), [event]);
  const privateLinks = useMemo(
    () => buildPrivateAccessLinks(event, baseOrigin),
    [event, baseOrigin],
  );
  const visibleViews = views.filter((view) => canAccessView(access, view.id));
  const currentView = canAccessView(access, activeView)
    ? activeView
    : getDefaultViewForAccess(access);
  const activeTeamId =
    access.role === "team_scorer" && access.teamId ? access.teamId : selectedTeamId;
  const selectedTeam = event.teams.find((team) => team.id === activeTeamId);
  const proxyHole = event.holes.find((hole) => hole.number === selectedProxyHole);
  const proxyPlayers = event.teams
    .flatMap((team) => team.players)
    .filter((player) => proxyHole?.sideGame && player.sideGames.includes(proxyHole.sideGame));
  const holesWithScores = event.scores.filter((score) => score.strokes !== null).length;
  const totalScoreSlots = event.teams.length * event.holes.length;
  const totalBuyIns = balances.reduce((sum, balance) => sum + balance.buyInTotal, 0);
  const outstanding = balances.reduce((sum, balance) => sum + Math.max(0, -balance.net), 0);

  function updateScore(teamId: string, hole: number, value: string) {
    if (!canAccessView(access, "scorecard")) {
      return;
    }

    if (access.role === "team_scorer" && access.teamId !== teamId) {
      return;
    }

    const strokes = value === "" ? null : Number(value);

    if (strokes !== null && (!Number.isInteger(strokes) || strokes < 1 || strokes > 12)) {
      return;
    }

    setEvent((current) => ({
      ...current,
      scores: current.scores.map((score) =>
        score.teamId === teamId && score.hole === hole ? { ...score, strokes } : score,
      ),
    }));
  }

  function addProxyEntry(formData: FormData) {
    if (!canAccessView(access, "proxy")) {
      return;
    }

    const playerId = String(formData.get("playerId"));
    const measuredDistance = Number(formData.get("measuredDistance"));
    const proxyHoleConfig = event.holes.find((hole) => hole.number === selectedProxyHole);

    if (
      !proxyHoleConfig?.sideGame ||
      !playerId ||
      Number.isNaN(measuredDistance) ||
      measuredDistance <= 0
    ) {
      return;
    }

    const entry: ProxyEntry = {
      id: `${selectedProxyHole}-${playerId}-${Date.now()}`,
      kind: proxyHoleConfig.sideGame,
      hole: selectedProxyHole,
      playerId,
      measuredDistance,
      unit: proxyHoleConfig.sideGame === "closest_to_pin" ? "feet" : "yards",
      isValid: true,
    };

    setEvent((current) => ({
      ...current,
      proxyEntries: [...current.proxyEntries, entry],
    }));
  }

  return (
    <main className="min-h-screen bg-[var(--fairway)] text-[var(--ink)]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-4 sm:px-6 lg:px-8">
        <header className="grid overflow-hidden rounded-md border border-[var(--masters-green-dark)] bg-[var(--masters-green)] shadow-sm lg:grid-cols-[minmax(0,1fr)_440px]">
          <div className="min-w-0">
            <div className="flex h-20 items-center border-b border-white/15 bg-[#070908] px-3 sm:h-24 sm:px-5 lg:max-w-4xl">
              <Image
                src="/brand/scramble-illinois-logo.webp"
                alt="Scramble logo"
                width={1280}
                height={313}
                priority
                className="h-full w-full object-contain"
              />
            </div>
            <div className="p-4 sm:p-5">
              <p className="text-xs font-black uppercase text-[var(--masters-yellow)]">
                Scramble HQ
              </p>
              <h1 className="mt-1 font-display text-3xl font-semibold text-white sm:text-5xl">
                {event.name}
              </h1>
              <p className="mt-2 max-w-3xl text-sm font-medium leading-6 text-[#dce9df]">
                {event.date} - {event.venue} - {event.address}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-px bg-[var(--masters-green-dark)] text-sm sm:grid-cols-4 lg:grid-cols-2">
            <Metric icon={<Users size={16} />} label="Teams" value={event.teams.length} />
            <Metric
              icon={<Users size={16} />}
              label="Players"
              value={event.teams.reduce((sum, team) => sum + team.players.length, 0)}
            />
            <Metric
              icon={<Flag size={16} />}
              label="Proxy holes"
              value={event.holes.filter((hole) => hole.sideGame).length}
            />
            <Metric icon={<Trophy size={16} />} label="Round" value="18 holes" />
          </div>
        </header>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric
            icon={<ListChecks size={16} />}
            label="Score entry"
            value={`${holesWithScores}/${totalScoreSlots}`}
          />
          <Metric
            icon={<Trophy size={16} />}
            label="Leader"
            value={leaderboard[0]?.holesComplete ? leaderboard[0].teamName : "Pending"}
          />
          <Metric icon={<Medal size={16} />} label="Proxy winners" value={proxyWinners.length} />
          {access.role === "commissioner" ? (
            <Metric icon={<DollarSign size={16} />} label="Outstanding" value={`$${outstanding}`} />
          ) : (
            <Metric icon={<ShieldCheck size={16} />} label="Access" value={getRoleLabel(access)} />
          )}
        </section>

        {!access.isValid && (
          <Notice
            title="Invalid private link"
            body="This link is not active for the event. You are viewing the public leaderboard only."
          />
        )}

        {visibleViews.length > 1 && (
          <nav
            className="grid grid-cols-2 gap-2 border-y border-[var(--line)] py-3 sm:grid-cols-3 lg:grid-cols-5"
            aria-label="Event workspace views"
          >
            {visibleViews.map((view) => (
              <button
                key={view.id}
                type="button"
                onClick={() => setActiveView(view.id)}
                className={`flex min-h-11 items-center justify-center gap-2 rounded-md border px-3 text-sm font-black transition ${
                  currentView === view.id
                    ? "border-[var(--masters-green)] bg-[var(--masters-green)] text-white shadow-sm"
                    : "border-[var(--line)] bg-[var(--surface)] text-[var(--ink)] hover:border-[var(--masters-green)]"
                }`}
              >
                {view.icon}
                <span>{view.label}</span>
              </button>
            ))}
          </nav>
        )}

        {currentView === "commissioner" && (
          <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_390px]">
            <Panel title="Event Setup">
              <div className="grid gap-3 md:grid-cols-2">
                {event.teams.map((team) => {
                  const progress = getTeamProgress(event, team);

                  return (
                    <div
                      key={team.id}
                      className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h2 className="font-semibold">{team.name}</h2>
                          <p className="text-sm text-[#62675f]">{team.teeTime}</p>
                        </div>
                        <LinkIcon size={17} className="text-[var(--masters-green)]" />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                        <MiniStat label="Thru" value={progress.thru} />
                        <MiniStat label="Total" value={progress.total} />
                      </div>
                      <ul className="mt-3 space-y-1 text-sm">
                        {team.players.map((player) => (
                          <li key={player.id} className="flex justify-between gap-3">
                            <span>{player.name}</span>
                            <span className="text-[var(--muted)]">
                              {player.sideGames.length ? player.sideGames.length : "-"}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </Panel>
            <div className="grid gap-5">
              <PrivateLinksPanel links={privateLinks} />
              <Panel title="Rules">
                <ul className="space-y-2 text-sm text-[var(--muted)]">
                  {event.rules.map((rule) => (
                    <li key={rule}>{rule}</li>
                  ))}
                </ul>
              </Panel>
            </div>
          </section>
        )}

        {currentView === "scorecard" && selectedTeam && (
          <Panel title="Team Scorecard">
            <ScorecardHeader
              access={access}
              event={event}
              selectedTeam={selectedTeam}
              selectedTeamId={selectedTeamId}
              onSelectedTeamChange={setSelectedTeamId}
            />
            <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-6 lg:grid-cols-9">
              {event.holes.map((hole) => {
                const score = event.scores.find(
                  (item) => item.teamId === selectedTeam.id && item.hole === hole.number,
                );
                const completed = score?.strokes !== null && score?.strokes !== undefined;

                return (
                  <label
                    key={hole.number}
                    className={`rounded-md border p-3 text-sm ${
                      completed
                        ? "border-[var(--masters-green)] bg-white"
                        : "border-[var(--line)] bg-[var(--surface)]"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2 font-semibold">
                      <span>Hole {hole.number}</span>
                      <span className="text-xs text-[var(--muted)]">
                        {hole.par ? `Par ${hole.par}` : ""}
                      </span>
                    </span>
                    {hole.sideGame && (
                      <span className="mt-1 block rounded-sm bg-[var(--masters-green-soft)] px-2 py-1 text-xs font-black uppercase text-[var(--masters-green-dark)]">
                        {formatSideGame(hole.sideGame)}
                      </span>
                    )}
                    <input
                      type="number"
                      min="1"
                      max="12"
                      inputMode="numeric"
                      aria-label={`${selectedTeam.name} hole ${hole.number} strokes`}
                      value={score?.strokes ?? ""}
                      onChange={(inputEvent) =>
                        updateScore(selectedTeam.id, hole.number, inputEvent.target.value)
                      }
                      className="mt-3 h-12 w-full rounded-md border border-[var(--line)] bg-white px-2 text-center text-lg font-black"
                    />
                  </label>
                );
              })}
            </div>
          </Panel>
        )}

        {currentView === "proxy" && (
          <Panel title="Proxy Entry">
            <form action={addProxyEntry} className="grid gap-3 md:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Hole
                <select
                  value={selectedProxyHole}
                  onChange={(selectEvent) => setSelectedProxyHole(Number(selectEvent.target.value))}
                  className="min-h-11 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3"
                >
                  {event.holes
                    .filter((hole) => hole.sideGame)
                    .map((hole) => (
                      <option key={hole.number} value={hole.number}>
                        #{hole.number} - {hole.label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Player
                <select
                  name="playerId"
                  className="min-h-11 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3"
                >
                  {proxyPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Distance
                <input
                  required
                  name="measuredDistance"
                  type="number"
                  min="0.1"
                  step="0.1"
                  inputMode="decimal"
                  className="min-h-11 rounded-md border border-[var(--line)] bg-[var(--surface)] px-3"
                />
              </label>
              <button
                type="submit"
                className="mt-auto min-h-11 rounded-md bg-[var(--masters-green)] px-4 text-sm font-black text-white shadow-sm hover:bg-[var(--masters-green-dark)]"
              >
                Add Entry
              </button>
            </form>
            <ProxyTable event={event} />
          </Panel>
        )}

        {currentView === "leaderboard" && (
          <Panel title="Live Leaderboard">
            <LeaderboardList rows={leaderboard} />
          </Panel>
        )}

        {currentView === "money" && (
          <Panel title="Payouts And Balances">
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <Metric label="Proxy winners entered" value={proxyWinners.length} />
              <Metric label="Total player buy-ins" value={`$${totalBuyIns}`} />
              <Metric label="Net outstanding" value={`$${outstanding}`} />
            </div>
            <SimpleTable
              headers={["Player", "Team", "Buy-in", "Payout", "Net"]}
              rows={balances.map((balance) => [
                balance.playerName,
                balance.teamName,
                `$${balance.buyInTotal}`,
                `$${balance.payoutTotal}`,
                `${balance.net >= 0 ? "+" : "-"}$${Math.abs(balance.net)}`,
              ])}
            />
          </Panel>
        )}
      </div>
    </main>
  );
}

function ScorecardHeader({
  access,
  event,
  selectedTeam,
  selectedTeamId,
  onSelectedTeamChange,
}: {
  access: AccessResolution;
  event: ScrambleEvent;
  selectedTeam: Team;
  selectedTeamId: string;
  onSelectedTeamChange: (teamId: string) => void;
}) {
  const progress = getTeamProgress(event, selectedTeam);
  const lockedToTeam = access.role === "team_scorer";

  return (
    <div className="mb-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
      <div
        className={`rounded-md border p-4 ${
          lockedToTeam
            ? "border-[var(--masters-green)] bg-[var(--masters-green-soft)]"
            : "border-[var(--line)] bg-[var(--surface)]"
        }`}
      >
        <div className="flex items-center gap-2 text-xs font-black uppercase text-[var(--masters-green-dark)]">
          {lockedToTeam ? <LockKeyhole size={15} /> : <ClipboardList size={15} />}
          {lockedToTeam ? "Scoring locked to" : "Active scorecard"}
        </div>
        <h2 className="mt-1 font-display text-3xl font-semibold text-[var(--masters-green-dark)]">
          {selectedTeam.name}
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          {selectedTeam.teeTime} - {selectedTeam.players.map((player) => player.name).join(", ")}
        </p>
        {!lockedToTeam && (
          <label className="mt-3 flex flex-col gap-1 text-sm font-semibold sm:max-w-sm">
            Team
            <select
              value={selectedTeamId}
              onChange={(selectEvent) => onSelectedTeamChange(selectEvent.target.value)}
              className="min-h-11 rounded-md border border-[var(--line)] bg-white px-3 text-sm"
            >
              {event.teams.map((team) => (
                <option key={team.id} value={team.id}>
                  {team.name} - {team.teeTime}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        <MiniStat label="Thru" value={progress.thru} />
        <MiniStat label="Total" value={progress.total} />
      </div>
    </div>
  );
}

function PrivateLinksPanel({ links }: { links: PrivateAccessLink[] }) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  async function copyLink(link: PrivateAccessLink) {
    try {
      await navigator.clipboard.writeText(link.href);
      setCopiedId(link.id);
      window.setTimeout(() => {
        setCopiedId((current) => (current === link.id ? null : current));
      }, 1600);
    } catch {
      setCopiedId(null);
    }
  }

  async function shareLink(link: PrivateAccessLink) {
    if (navigator.share) {
      try {
        await navigator.share({
          title: link.label,
          text: link.description,
          url: link.href,
        });
        return;
      } catch {
        // Fall back to copying below.
      }
    }

    await copyLink(link);
  }

  return (
    <Panel title="Private Links">
      <div className="space-y-2">
        {links.map((link) => (
          <div
            key={link.id}
            className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h3 className="font-semibold">{link.label}</h3>
                <p className="text-xs text-[var(--muted)]">{link.description}</p>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => copyLink(link)}
                  title={`Copy ${link.label} link`}
                  aria-label={`Copy ${link.label} link`}
                  className="flex size-9 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--masters-green-dark)] hover:border-[var(--masters-green)]"
                >
                  <Copy size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => shareLink(link)}
                  title={`Share ${link.label} link`}
                  aria-label={`Share ${link.label} link`}
                  className="flex size-9 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--masters-green-dark)] hover:border-[var(--masters-green)]"
                >
                  <Share2 size={16} />
                </button>
                <a
                  href={link.href}
                  target="_blank"
                  rel="noreferrer"
                  title={`Open ${link.label} link`}
                  aria-label={`Open ${link.label} link`}
                  className="flex size-9 items-center justify-center rounded-md border border-[var(--line)] bg-white text-[var(--masters-green-dark)] hover:border-[var(--masters-green)]"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
            </div>
            <p className="mt-2 truncate rounded-sm bg-white px-2 py-1 font-mono text-[11px] text-[var(--muted)]">
              {link.href}
            </p>
            {copiedId === link.id && (
              <p className="mt-2 text-xs font-black uppercase text-[var(--masters-green)]">
                Copied
              </p>
            )}
          </div>
        ))}
      </div>
    </Panel>
  );
}

function LeaderboardList({ rows }: { rows: LeaderboardRow[] }) {
  return (
    <div className="grid gap-2">
      {rows.map((row, index) => (
        <article
          key={row.teamId}
          className="grid grid-cols-[44px_minmax(0,1fr)_auto] items-center gap-3 rounded-md border border-[var(--line)] bg-[var(--surface)] p-3"
        >
          <div className="flex size-11 items-center justify-center rounded-md bg-[var(--masters-green)] font-display text-xl font-semibold text-white">
            {index + 1}
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold">{row.teamName}</h3>
            <p className="text-sm text-[var(--muted)]">{row.teeTime}</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right">
            <MiniStat label="Thru" value={row.thru} />
            <MiniStat label="Total" value={formatLeaderboardTotal(row)} />
          </div>
        </article>
      ))}
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon?: ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-[var(--surface)] p-3 shadow-sm">
      <div className="flex items-center gap-2 text-xs font-black uppercase text-[var(--masters-green)]">
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate font-display text-2xl font-semibold text-[var(--ink)]">
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-[var(--line)] bg-white px-3 py-2">
      <div className="text-[11px] font-black uppercase text-[var(--masters-green)]">{label}</div>
      <div className="truncate font-display text-xl font-semibold text-[var(--ink)]">{value}</div>
    </div>
  );
}

function Notice({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-md border border-[var(--masters-green)] bg-[var(--masters-green-soft)] p-4">
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-0.5 text-[var(--masters-green-dark)]" size={18} />
        <div>
          <h2 className="font-semibold text-[var(--masters-green-dark)]">{title}</h2>
          <p className="mt-1 text-sm text-[var(--muted)]">{body}</p>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="py-1">
      <h2 className="mb-4 border-b border-[var(--line)] pb-2 font-display text-2xl font-semibold text-[var(--masters-green-dark)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[var(--line)] bg-[var(--surface)]">
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead className="bg-[var(--masters-green)] text-xs uppercase text-white">
          <tr>
            {headers.map((header) => (
              <th key={header} className="px-3 py-3 font-semibold">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIndex) => (
            <tr key={`${row.join("-")}-${rowIndex}`} className="border-t border-[var(--line)]">
              {row.map((cell, cellIndex) => (
                <td key={`${cell}-${cellIndex}`} className="px-3 py-3">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ProxyTable({ event }: { event: ScrambleEvent }) {
  const players = event.teams.flatMap((team) => team.players);

  if (!event.proxyEntries.length) {
    return (
      <div className="mt-5 rounded-md border border-[var(--line)] bg-[var(--surface)] p-4 text-sm text-[var(--muted)]">
        No proxy entries yet.
      </div>
    );
  }

  return (
    <div className="mt-5">
      <SimpleTable
        headers={["Hole", "Game", "Player", "Distance", "Valid"]}
        rows={event.proxyEntries.map((entry) => {
          const player = players.find((item) => item.id === entry.playerId);

          return [
            String(entry.hole),
            entry.kind === "closest_to_pin" ? "Closest" : "Long Drive",
            player?.name ?? "Unknown",
            `${entry.measuredDistance ?? "-"} ${entry.unit}`,
            entry.isValid ? "Yes" : "No",
          ];
        })}
      />
    </div>
  );
}

function getTeamProgress(event: ScrambleEvent, team: Team) {
  const scores = event.scores.filter((score) => score.teamId === team.id);
  const completedScores = scores.filter((score) => typeof score.strokes === "number");
  const total = completedScores.reduce((sum, score) => sum + (score.strokes ?? 0), 0);

  return {
    thru: completedScores.length === 18 ? "F" : `${completedScores.length}/18`,
    total: completedScores.length ? String(total) : "-",
  };
}

function formatLeaderboardTotal(row: LeaderboardRow) {
  return row.holesComplete ? String(row.total) : "-";
}

function formatSideGame(kind: "closest_to_pin" | "long_drive") {
  return kind === "closest_to_pin" ? "Closest" : "Long";
}
