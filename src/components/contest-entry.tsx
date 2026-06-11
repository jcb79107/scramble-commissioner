import { getEligibleContestPlayers, formatSideGame } from "@/lib/event-summary";
import type { HoleConfig, ScrambleEvent, SideGameKind } from "@/lib/types";
import {
  BrandHeader,
  ScreenBody,
  SecondaryLink,
  Section,
  StatGrid,
  StatTile,
  SubmitButton,
} from "./scramble-shell";

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
        eyebrow="Private contest link"
        title={`Hole ${hole.number}`}
        meta={`${formatSideGame(sideGame)} - ${hole.label ?? event.venue}`}
        action={<SecondaryLink href="/">Board</SecondaryLink>}
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
                  className="min-h-12 rounded-2xl border border-[var(--mist)] bg-white px-4"
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
                  className="min-h-12 rounded-2xl border border-[var(--mist)] bg-white px-4 text-lg font-semibold"
                />
              </label>

              <label className="grid gap-1 text-sm font-bold">
                Result
                <select
                  name="isValid"
                  className="min-h-12 rounded-2xl border border-[var(--mist)] bg-white px-4"
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
              <div className="overflow-hidden rounded-[22px] border border-[var(--mist)] bg-white">
            {event.proxyEntries
              .filter((entry) => entry.hole === hole.number && entry.kind === sideGame)
              .map((entry) => {
                const player = players.find((item) => item.id === entry.playerId);

                return (
                  <div
                    key={entry.id}
                    className="flex min-h-14 items-center justify-between border-b border-[var(--mist)] px-4 py-3 text-sm last:border-b-0"
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
            ) && <p className="px-4 py-5 text-sm text-[var(--muted)]">No entries yet.</p>}
          </div>
        </Section>
      </ScreenBody>
    </>
  );
}
