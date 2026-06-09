"use client";

import { Trophy, Flag, Users, DollarSign, Link as LinkIcon } from "lucide-react";
import { useMemo, useState } from "react";
import { buildLeaderboard, getPlayerBalances, getProxyWinners } from "@/lib/calculations";
import { chevyChaseSeed } from "@/lib/chevy-chase-seed";
import type { ProxyEntry, ScrambleEvent } from "@/lib/types";

type View = "commissioner" | "scorecard" | "proxy" | "leaderboard" | "money";

export function EventWorkspace() {
  const [event, setEvent] = useState<ScrambleEvent>(chevyChaseSeed);
  const [activeView, setActiveView] = useState<View>("commissioner");
  const [selectedTeamId, setSelectedTeamId] = useState(event.teams[0]?.id ?? "");
  const [selectedProxyHole, setSelectedProxyHole] = useState(6);
  const leaderboard = useMemo(() => buildLeaderboard(event), [event]);
  const proxyWinners = useMemo(() => getProxyWinners(event), [event]);
  const balances = useMemo(() => getPlayerBalances(event), [event]);
  const selectedTeam = event.teams.find((team) => team.id === selectedTeamId);
  const proxyHole = event.holes.find((hole) => hole.number === selectedProxyHole);
  const proxyPlayers = event.teams
    .flatMap((team) => team.players)
    .filter((player) => proxyHole?.sideGame && player.sideGames.includes(proxyHole.sideGame));

  function updateScore(teamId: string, hole: number, value: string) {
    const strokes = value === "" ? null : Number(value);

    setEvent((current) => ({
      ...current,
      scores: current.scores.map((score) =>
        score.teamId === teamId && score.hole === hole ? { ...score, strokes } : score,
      ),
    }));
  }

  function addProxyEntry(formData: FormData) {
    const playerId = String(formData.get("playerId"));
    const measuredDistance = Number(formData.get("measuredDistance"));
    const proxyHoleConfig = event.holes.find((hole) => hole.number === selectedProxyHole);

    if (!proxyHoleConfig?.sideGame || !playerId || Number.isNaN(measuredDistance)) {
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
    <main className="min-h-screen bg-[#f7f7f2] text-[#1f241f]">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5 px-4 py-5 sm:px-6 lg:px-8">
        <header className="flex flex-col gap-4 border-b border-[#d8d8cc] pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-normal text-[#576351]">
              Logo pending
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-normal text-[#1f241f]">
              {event.name}
            </h1>
            <p className="mt-2 text-sm text-[#5e655d]">
              {event.date} · {event.venue} · {event.address}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Metric icon={<Users size={16} />} label="Teams" value={event.teams.length} />
            <Metric
              icon={<Flag size={16} />}
              label="Proxy holes"
              value={event.holes.filter((hole) => hole.sideGame).length}
            />
            <Metric icon={<DollarSign size={16} />} label="Scramble" value="$25" />
            <Metric icon={<Trophy size={16} />} label="Round" value="18 holes" />
          </div>
        </header>

        <nav className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {[
            ["commissioner", "Commissioner"],
            ["scorecard", "Team Score"],
            ["proxy", "Proxy Entry"],
            ["leaderboard", "Leaderboard"],
            ["money", "Money"],
          ].map(([view, label]) => (
            <button
              key={view}
              type="button"
              onClick={() => setActiveView(view as View)}
              className={`min-h-11 rounded-md border px-3 text-sm font-semibold ${
                activeView === view
                  ? "border-[#1f241f] bg-[#1f241f] text-white"
                  : "border-[#d8d8cc] bg-white text-[#1f241f]"
              }`}
            >
              {label}
            </button>
          ))}
        </nav>

        {activeView === "commissioner" && (
          <section className="grid gap-5 lg:grid-cols-[1fr_360px]">
            <Panel title="Event Setup">
              <div className="grid gap-3 md:grid-cols-2">
                {event.teams.map((team) => (
                  <div key={team.id} className="rounded-md border border-[#d8d8cc] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h2 className="font-semibold">{team.name}</h2>
                        <p className="text-sm text-[#62675f]">{team.teeTime}</p>
                      </div>
                      <LinkIcon size={17} className="text-[#66715f]" />
                    </div>
                    <ul className="mt-3 space-y-1 text-sm">
                      {team.players.map((player) => (
                        <li key={player.id} className="flex justify-between gap-3">
                          <span>{player.name}</span>
                          <span className="text-[#66715f]">
                            {player.sideGames.length ? player.sideGames.length : "-"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Panel>
            <Panel title="Rules">
              <ul className="space-y-2 text-sm text-[#454b43]">
                {event.rules.map((rule) => (
                  <li key={rule}>{rule}</li>
                ))}
              </ul>
            </Panel>
          </section>
        )}

        {activeView === "scorecard" && selectedTeam && (
          <Panel title="Team Score Entry">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="text-sm font-semibold" htmlFor="team-select">
                Team
              </label>
              <select
                id="team-select"
                value={selectedTeamId}
                onChange={(event) => setSelectedTeamId(event.target.value)}
                className="min-h-11 rounded-md border border-[#c9c9bd] bg-white px-3 text-sm"
              >
                {event.teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} · {team.teeTime}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-6 lg:grid-cols-9">
              {event.holes.map((hole) => {
                const score = event.scores.find(
                  (item) => item.teamId === selectedTeam.id && item.hole === hole.number,
                );

                return (
                  <label
                    key={hole.number}
                    className="rounded-md border border-[#d8d8cc] bg-white p-3 text-sm"
                  >
                    <span className="mb-2 block font-semibold">Hole {hole.number}</span>
                    <input
                      type="number"
                      min="1"
                      value={score?.strokes ?? ""}
                      onChange={(event) =>
                        updateScore(selectedTeam.id, hole.number, event.target.value)
                      }
                      className="h-10 w-full rounded-md border border-[#c9c9bd] px-2"
                    />
                  </label>
                );
              })}
            </div>
          </Panel>
        )}

        {activeView === "proxy" && (
          <Panel title="Proxy Entry">
            <form action={addProxyEntry} className="grid gap-3 md:grid-cols-4">
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Hole
                <select
                  value={selectedProxyHole}
                  onChange={(event) => setSelectedProxyHole(Number(event.target.value))}
                  className="min-h-11 rounded-md border border-[#c9c9bd] bg-white px-3"
                >
                  {event.holes
                    .filter((hole) => hole.sideGame)
                    .map((hole) => (
                      <option key={hole.number} value={hole.number}>
                        #{hole.number} · {hole.label}
                      </option>
                    ))}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-sm font-semibold">
                Player
                <select
                  name="playerId"
                  className="min-h-11 rounded-md border border-[#c9c9bd] bg-white px-3"
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
                  min="0"
                  step="0.1"
                  className="min-h-11 rounded-md border border-[#c9c9bd] bg-white px-3"
                />
              </label>
              <button
                type="submit"
                className="mt-auto min-h-11 rounded-md bg-[#1f241f] px-4 text-sm font-semibold text-white"
              >
                Add Entry
              </button>
            </form>
            <ProxyTable event={event} />
          </Panel>
        )}

        {activeView === "leaderboard" && (
          <Panel title="Live Leaderboard">
            <SimpleTable
              headers={["Team", "Tee", "Thru", "Total"]}
              rows={leaderboard.map((row) => [
                row.teamName,
                row.teeTime,
                row.thru,
                row.holesComplete ? String(row.total) : "-",
              ])}
            />
          </Panel>
        )}

        {activeView === "money" && (
          <Panel title="Payouts And Balances">
            <div className="mb-4 grid gap-3 md:grid-cols-3">
              <Metric label="Proxy winners entered" value={proxyWinners.length} />
              <Metric
                label="Total player buy-ins"
                value={`$${balances.reduce((sum, balance) => sum + balance.buyInTotal, 0)}`}
              />
              <Metric
                label="Net outstanding"
                value={`$${balances.reduce((sum, balance) => sum + Math.max(0, -balance.net), 0)}`}
              />
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

function Metric({
  icon,
  label,
  value,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-md border border-[#d8d8cc] bg-white p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-[#66715f]">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-md border border-[#d8d8cc] bg-[#fbfbf7] p-4">
      <h2 className="mb-4 text-lg font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function SimpleTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-[#d8d8cc] bg-white">
      <table className="w-full min-w-[620px] border-collapse text-left text-sm">
        <thead className="bg-[#efefe7] text-xs uppercase tracking-normal text-[#555e52]">
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
            <tr key={`${row.join("-")}-${rowIndex}`} className="border-t border-[#ededdf]">
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
