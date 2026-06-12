import Link from "next/link";
import { buildLeaderboard } from "@/lib/calculations";
import { getTeamCaptain } from "@/lib/event-summary";
import type { ScrambleEvent, Team } from "@/lib/types";
import { BrandHeader, Section, StatGrid, StatTile } from "./scramble-shell";
import { TeamScorecardEditor } from "./team-scorecard-editor";

export function TeamScoreEntry({
  event,
  team,
  action,
}: {
  event: ScrambleEvent;
  team: Team;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const captain = getTeamCaptain(team);
  const leaderboard = buildLeaderboard(event);
  const teamRow = leaderboard.find((row) => row.teamId === team.id);

  return (
    <>
      <BrandHeader
        eyebrow="Private scorecard"
        title={team.name}
        meta={`${team.teeTime} / Captain: ${captain.name}`}
        action={
          <Link
            href="/"
            className="hidden rounded-full border border-[var(--fairway)]/15 bg-white px-3 py-2 text-xs font-semibold text-[var(--ink)] sm:inline-flex"
          >
            Board
          </Link>
        }
      />

      <StatGrid>
        <StatTile label="Thru" value={teamRow?.thru ?? "0"} />
        <StatTile label="Total" value={teamRow?.holesComplete ? teamRow.total : "-"} />
        <StatTile label="Players" value={team.players.length} />
        <StatTile label="Tee" value={team.teeTime} />
      </StatGrid>

      <Section title="Team Roster" eyebrow="Scoring for">
        <div className="overflow-hidden rounded-[22px] border border-[var(--mist)] bg-white">
          {team.players.map((player) => (
            <div
              key={player.id}
              className="grid min-h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--mist)] px-4 py-3 last:border-b-0"
            >
              <span className="truncate text-sm font-semibold text-[var(--ink)]">{player.name}</span>
              {player.id === captain.id && (
                <span className="rounded-full bg-[var(--sand)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fairway)]/68">
                  Captain
                </span>
              )}
            </div>
          ))}
        </div>
      </Section>

      <form action={action} className="grid gap-4">
        <TeamScorecardEditor event={event} team={team} />
      </form>

      <Section title="Leaderboard Peek" eyebrow="Top three">
        <div className="overflow-hidden rounded-[22px] border border-[var(--mist)] bg-white">
          {leaderboard.slice(0, 3).map((row, index) => (
            <div
              key={row.teamId}
              className="grid min-h-14 grid-cols-[44px_minmax(0,1fr)_64px] items-center gap-3 border-b border-[var(--mist)] px-4 py-3 last:border-b-0"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pine)] text-sm font-semibold text-white">
                {index + 1}
              </span>
              <span className="truncate text-sm font-semibold text-[var(--ink)]">{row.teamName}</span>
              <span className="text-right text-sm font-semibold text-[var(--ink)]">
                {row.holesComplete ? row.total : "-"}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
