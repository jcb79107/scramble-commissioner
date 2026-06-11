import { getEligibleContestPlayers, formatSideGame } from "@/lib/event-summary";
import type { HoleConfig, ScrambleEvent, SideGameKind } from "@/lib/types";
import { BrandHeader, ScreenBody, Section, StatGrid, StatTile, SubmitButton } from "./scramble-shell";

export function ContestEntry({
  event,
  hole,
  sideGame,
  action,
}: {
  event: ScrambleEvent;
  hole: HoleConfig;
  sideGame: SideGameKind;
  action: (formData: FormData) => void | Promise<void>;
}) {
  const players = getEligibleContestPlayers(event, sideGame);
  const unit = sideGame === "closest_to_pin" ? "feet" : "yards";

  return (
    <>
      <BrandHeader
        eyebrow="Contest Link"
        title={`Hole ${hole.number}`}
        meta={`${formatSideGame(sideGame)} - ${hole.label ?? event.venue}`}
      />
      <ScreenBody>
        <StatGrid>
          <StatTile label="Contest" value={formatSideGame(sideGame)} />
          <StatTile label="Unit" value={unit} />
        </StatGrid>

        <form action={action} className="space-y-4">
          <Section title="Contest Entry">
            <div className="space-y-3">
              <label className="grid gap-1 text-sm font-bold">
                Player
                <select
                  name="playerId"
                  required
                  className="min-h-12 rounded-md border border-[var(--line)] bg-white px-3"
                >
                  {players.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-1 text-sm font-bold">
                Distance ({unit})
                <input
                  name="measuredDistance"
                  type="number"
                  min="0.1"
                  step="0.1"
                  inputMode="decimal"
                  required
                  className="min-h-12 rounded-md border border-[var(--line)] bg-white px-3 text-lg font-black"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold">
                Result
                <select
                  name="isValid"
                  className="min-h-12 rounded-md border border-[var(--line)] bg-white px-3"
                  defaultValue="true"
                >
                  <option value="true">
                    {sideGame === "closest_to_pin" ? "On green" : "In fairway"}
                  </option>
                  <option value="false">Not valid</option>
                </select>
              </label>
            </div>
          </Section>

          <SubmitButton>Submit Contest Entry</SubmitButton>
        </form>

        <Section title="Current Entries">
          <div className="space-y-1">
            {event.proxyEntries
              .filter((entry) => entry.hole === hole.number && entry.kind === sideGame)
              .map((entry) => {
                const player = players.find((item) => item.id === entry.playerId);

                return (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between border-b border-[var(--line)] py-2 text-sm last:border-b-0"
                  >
                    <span className="font-black">{player?.name ?? "Unknown"}</span>
                    <span className="text-[var(--muted)]">
                      {entry.measuredDistance} {entry.unit}
                    </span>
                  </div>
                );
              })}
            {!event.proxyEntries.some(
              (entry) => entry.hole === hole.number && entry.kind === sideGame,
            ) && <p className="text-sm text-[var(--muted)]">No entries yet.</p>}
          </div>
        </Section>
      </ScreenBody>
    </>
  );
}
