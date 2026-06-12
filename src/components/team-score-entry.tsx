import Link from "next/link";
import { Fragment } from "react";
import { buildLeaderboard } from "@/lib/calculations";
import { getTeamCaptain } from "@/lib/event-summary";
import type { ScrambleEvent, Team } from "@/lib/types";
import {
  getSegmentHoles,
  ScorecardTableFrame,
  scorecardBodyCellClass,
  scorecardHeaderCellClass,
  scorecardLabelCellClass,
  scorecardScoreMarkClass,
  scorecardScoreStyle,
} from "./scorecard-table";
import { BrandHeader, Section, StatGrid, StatTile, SubmitButton } from "./scramble-shell";

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
        <Section title="Scorecard" eyebrow="Enter team gross score">
          <div className="grid min-w-0 gap-5">
            <SegmentScorecard event={event} team={team} segment="front" />
            <SegmentScorecard event={event} team={team} segment="back" />
          </div>
        </Section>

        <div className="rounded-[24px] border border-white/70 bg-[rgba(255,252,247,0.96)] p-3 shadow-[0_18px_40px_rgba(17,32,23,0.14)]">
          <SubmitButton>Save Team Score</SubmitButton>
        </div>
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

function SegmentScorecard({
  event,
  team,
  segment,
}: {
  event: ScrambleEvent;
  team: Team;
  segment: "front" | "back";
}) {
  const holeNumbers = getSegmentHoles(segment);
  const segmentLabel = segment === "front" ? "Front 9" : "Back 9";
  const segmentTotal = holeNumbers.reduce((total, holeNumber) => {
    const score = event.scores.find(
      (item) => item.teamId === team.id && item.hole === holeNumber,
    );

    return total + (score?.strokes ?? 0);
  }, 0);
  const hasSegmentScores = holeNumbers.some((holeNumber) =>
    event.scores.some(
      (item) => item.teamId === team.id && item.hole === holeNumber && item.strokes !== null,
    ),
  );
  const roundTotal = event.scores
    .filter((score) => score.teamId === team.id && score.strokes !== null)
    .reduce((sum, score) => sum + (score.strokes ?? 0), 0);

  return (
    <div className="min-w-0 overflow-hidden rounded-[26px] border border-[#d7c28d] bg-white/92 p-4 shadow-[0_14px_34px_rgba(17,32,23,0.08)]">
      <div className="border-b border-[#c8b77f] bg-[#fbf5e6] px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-[var(--ink)]">{segmentLabel}</h3>
          <span className="rounded-full bg-white/75 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]/52">
            Tap a score to edit
          </span>
        </div>
      </div>

      <ScorecardTableFrame segment={segment}>
        <div className={`sticky left-0 z-10 border-b border-r border-[#bfa66a] bg-[#f2ead9] text-[var(--ink)]/58 ${scorecardLabelCellClass}`}>
          Hole
        </div>
        {holeNumbers.map((holeNumber) => (
          <div
            key={`hole-${holeNumber}`}
            className={`border-b border-r border-[#c8b77f] bg-[#f2ead9] text-[var(--ink)] ${scorecardHeaderCellClass}`}
          >
            <span className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-[var(--pine)]/10 text-sm font-semibold">
              {holeNumber}
            </span>
          </div>
        ))}
        <div className={`border-b border-r border-[#c8b77f] bg-[#f2ead9] text-[var(--ink)] ${scorecardHeaderCellClass}`}>
          {segment === "front" ? "Out" : "In"}
        </div>
        {segment === "back" && (
          <div className={`border-b border-r border-[#c8b77f] bg-[#f2ead9] text-[var(--ink)] ${scorecardHeaderCellClass}`}>
            Total
          </div>
        )}

        {[
          {
            label: "Contest",
            values: holeNumbers.map((holeNumber) => {
              const hole = event.holes.find((item) => item.number === holeNumber);
              return hole?.sideGame === "closest_to_pin"
                ? "CTP"
                : hole?.sideGame === "long_drive"
                  ? "LD"
                  : "";
            }),
            segmentTotal: "",
            roundTotal: "",
            rowSurface: "bg-[#f5eddc]",
            totalSurface: "bg-[#eee1c6]",
          },
          {
            label: "Par",
            values: holeNumbers.map(
              (holeNumber) => event.holes.find((item) => item.number === holeNumber)?.par ?? "-",
            ),
            segmentTotal: holeNumbers.reduce(
              (total, holeNumber) =>
                total + (event.holes.find((item) => item.number === holeNumber)?.par ?? 0),
              0,
            ),
            roundTotal: event.holes.reduce((total, hole) => total + (hole.par ?? 0), 0),
            rowSurface: "bg-[#f7df8b]",
            totalSurface: "bg-[#efd16c]",
          },
        ].map(({ label, values, segmentTotal: total, roundTotal: fullTotal, rowSurface, totalSurface }) => (
          <Fragment key={label}>
            <div className={`sticky left-0 z-10 border-b border-r border-[#bfa66a] text-[var(--ink)] ${scorecardLabelCellClass} ${rowSurface}`}>
              {label}
            </div>
            {values.map((value, index) => (
              <div
                key={`${label}-${holeNumbers[index]}`}
                className={`border-b border-r border-[#c8b77f] text-center text-sm font-semibold text-[var(--ink)]/72 ${scorecardBodyCellClass} ${rowSurface}`}
              >
                {value}
              </div>
            ))}
            <div className={`border-b border-r border-[#c8b77f] text-center text-sm font-semibold text-[var(--ink)] ${scorecardBodyCellClass} ${totalSurface}`}>
              {total}
            </div>
            {segment === "back" && (
              <div className={`border-b border-r border-[#c8b77f] text-center text-sm font-semibold text-[var(--ink)] ${scorecardBodyCellClass} ${totalSurface}`}>
                {fullTotal}
              </div>
            )}
          </Fragment>
        ))}

        <div className={`sticky left-0 z-10 border-b border-r border-[#bfa66a] bg-[#fffaf0] ${scorecardLabelCellClass}`}>
          <span className="block text-[var(--ink)]">Team score</span>
          <span className="mt-1 block text-[10px] uppercase tracking-[0.14em] text-[var(--ink)]/54">
            Gross
          </span>
        </div>
        {holeNumbers.map((holeNumber) => {
          const hole = event.holes.find((item) => item.number === holeNumber);
          const score = event.scores.find(
            (item) => item.teamId === team.id && item.hole === holeNumber,
          );
          const defaultScore = score?.strokes ?? "";
          const par = hole?.par;

          return (
            <div
              key={`score-${holeNumber}`}
              className={`border-b border-r border-[#c8b77f] bg-white ${scorecardBodyCellClass}`}
            >
              <input
                name={`hole-${holeNumber}`}
                type="number"
                min="1"
                max="12"
                inputMode="numeric"
                defaultValue={defaultScore}
                aria-label={`${team.name} hole ${holeNumber} strokes`}
                className={`mx-auto flex items-center justify-center text-center font-semibold outline-none transition focus:ring-2 focus:ring-[var(--pine)]/35 ${scorecardScoreMarkClass} ${scorecardScoreStyle(defaultScore, par)}`}
                placeholder={par ? String(par) : ""}
              />
            </div>
          );
        })}
        <div className={`border-b border-r border-[#c8b77f] bg-[#f7f1e3] ${scorecardBodyCellClass}`}>
          <span className={`mx-auto flex items-center justify-center font-semibold text-[var(--ink)] ${scorecardScoreMarkClass}`}>
            {hasSegmentScores ? segmentTotal : ""}
          </span>
        </div>
        {segment === "back" && (
          <div className={`border-b border-r border-[#c8b77f] bg-[#efe7d6] ${scorecardBodyCellClass}`}>
            <span className={`mx-auto flex items-center justify-center font-semibold text-[var(--ink)] ${scorecardScoreMarkClass}`}>
              {roundTotal || ""}
            </span>
          </div>
        )}
      </ScorecardTableFrame>
    </div>
  );
}
