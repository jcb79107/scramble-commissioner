import { buildLeaderboard } from "@/lib/calculations";
import { getTeamCaptain } from "@/lib/event-summary";
import type { ScrambleEvent, Team } from "@/lib/types";
import { BrandHeader, ScreenBody, Section, StatGrid, StatTile, SubmitButton } from "./scramble-shell";

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
        eyebrow="Team Score Link"
        title={`You're scoring ${team.name}`}
        meta={`${team.teeTime} - Captain: ${captain.name}`}
      />
      <ScreenBody>
        <StatGrid>
          <StatTile label="Thru" value={teamRow?.thru ?? "0"} />
          <StatTile label="Total" value={teamRow?.holesComplete ? teamRow.total : "-"} />
        </StatGrid>

        <Section title="Team Roster">
          <div className="space-y-2">
            {team.players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between rounded-md border border-[var(--line)] bg-[var(--paper)] px-3 py-2 text-sm"
              >
                <span className="font-black">{player.name}</span>
                {player.id === captain.id && (
                  <span className="text-[10px] font-black uppercase tracking-[0.08em] text-[var(--brand-green)]">
                    Captain
                  </span>
                )}
              </div>
            ))}
          </div>
        </Section>

        <form action={action} className="space-y-4">
          <Section title="Scorecard">
            <div className="grid grid-cols-3 gap-2">
              {event.holes.map((hole) => {
                const score = event.scores.find(
                  (item) => item.teamId === team.id && item.hole === hole.number,
                );

                return (
                  <label
                    key={hole.number}
                    className="rounded-md border border-[var(--line)] bg-[var(--paper)] p-2 text-center"
                  >
                    <span className="block text-[10px] font-black uppercase text-[var(--brand-green)]">
                      Hole {hole.number}
                    </span>
                    <span className="block min-h-4 text-[10px] font-bold text-[var(--muted)]">
                      {hole.par ? `Par ${hole.par}` : ""}
                    </span>
                    <input
                      name={`hole-${hole.number}`}
                      type="number"
                      min="1"
                      max="12"
                      inputMode="numeric"
                      defaultValue={score?.strokes ?? ""}
                      aria-label={`${team.name} hole ${hole.number} strokes`}
                      className="mt-1 h-12 w-full rounded-md border border-[var(--line)] bg-white text-center font-display text-2xl font-semibold"
                    />
                  </label>
                );
              })}
            </div>
          </Section>

          <SubmitButton>Save Team Score</SubmitButton>
        </form>

        <Section title="Leaderboard Peek">
          <div className="space-y-1">
            {leaderboard.slice(0, 3).map((row, index) => (
              <div
                key={row.teamId}
                className="grid grid-cols-[28px_minmax(0,1fr)_56px] items-center gap-2 border-b border-[var(--line)] py-2 text-sm last:border-b-0"
              >
                <span className="font-display text-xl font-semibold text-[var(--brand-green)]">
                  {index + 1}
                </span>
                <span className="truncate font-black">{row.teamName}</span>
                <span className="text-right font-black">
                  {row.holesComplete ? row.total : "-"}
                </span>
              </div>
            ))}
          </div>
        </Section>
      </ScreenBody>
    </>
  );
}
