import { buildLeaderboard, getPlayerBalances, getProxyWinners } from "@/lib/calculations";
import {
  formatMoney,
  formatSideGame,
  getEventStatus,
  getFunStats,
  getTeamCaptain,
} from "@/lib/event-summary";
import type { ScrambleEvent } from "@/lib/types";
import { BrandHeader, ScreenBody, Section, StatGrid, StatTile } from "./scramble-shell";
import { RealtimeRefresh } from "./realtime-refresh";

export function PublicEventBoard({
  event,
  invalidAccess = false,
}: {
  event: ScrambleEvent;
  invalidAccess?: boolean;
}) {
  const leaderboard = buildLeaderboard(event);
  const balances = getPlayerBalances(event);
  const proxyWinners = getProxyWinners(event);
  const funStats = getFunStats(event);
  const status = getEventStatus(event);
  const positiveBalances = balances.filter((balance) => balance.net > 0);

  return (
    <>
      <RealtimeRefresh eventId={event.id} />
      <BrandHeader
        eyebrow="Public Event Board"
        title="Chevy Chase Scramble"
        meta={`${event.date} - ${event.venue}`}
        hero
      />
      <ScreenBody>
        {invalidAccess && (
          <div className="rounded-md border border-[var(--flag-red)]/40 bg-[var(--flag-red)]/8 p-3 text-sm font-semibold text-[var(--brand-green-dark)]">
            That private link is not active. You are viewing the public event board.
          </div>
        )}

        <StatGrid>
          <StatTile label="Status" value={status} />
          <StatTile
            label="Leader"
            value={leaderboard[0]?.holesComplete ? leaderboard[0].teamName : "TBD"}
          />
          <StatTile label="Teams" value={event.teams.length} />
          <StatTile label="Players" value={balances.length} />
        </StatGrid>

        <Section title="Leaderboard">
          <div className="space-y-2">
            {leaderboard.map((row, index) => (
              <div
                key={row.teamId}
                className="grid grid-cols-[32px_minmax(0,1fr)_44px_44px] items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--paper)] px-2 py-2"
              >
                <div className="flex size-8 items-center justify-center rounded-sm bg-[var(--brand-green)] font-display text-lg font-semibold text-white">
                  {index + 1}
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-black">{row.teamName}</div>
                  <div className="text-xs text-[var(--muted)]">{row.teeTime}</div>
                </div>
                <ScoreDatum label="Thru" value={row.thru} />
                <ScoreDatum label="Total" value={row.holesComplete ? row.total : "-"} />
              </div>
            ))}
          </div>
        </Section>

        <Section title="Winners & Wagers">
          <div className="mb-3 rounded-md bg-[var(--brand-yellow)] px-3 py-2 text-sm font-black text-[var(--brand-green-dark)]">
            {positiveBalances.length
              ? `${positiveBalances.length} players currently in the money`
              : "Payouts settle when results are final"}
          </div>
          <div className="space-y-1">
            {balances
              .slice()
              .sort((a, b) => b.net - a.net)
              .map((balance) => (
                <div
                  key={balance.playerId}
                  className="grid grid-cols-[minmax(0,1fr)_50px_54px_58px] items-center gap-1 border-b border-[var(--line)] py-2 text-xs last:border-b-0"
                >
                  <div className="min-w-0">
                    <div className="truncate font-black">{balance.playerName}</div>
                    <div className="truncate text-[var(--muted)]">{balance.teamName}</div>
                  </div>
                  <MoneyCell label="In" value={`$${balance.buyInTotal}`} />
                  <MoneyCell label="Paid" value={`$${balance.payoutTotal}`} />
                  <MoneyCell label="Net" value={formatMoney(balance.net)} />
                </div>
              ))}
          </div>
        </Section>

        <Section title="Teams & Captains">
          <div className="space-y-2">
            {event.teams.map((team) => {
              const captain = getTeamCaptain(team);

              return (
                <div
                  key={team.id}
                  className="rounded-md border border-[var(--line)] bg-[var(--paper)] p-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-display text-xl font-semibold text-[var(--brand-green-dark)]">
                        {team.name}
                      </h3>
                      <p className="text-xs font-bold text-[var(--muted)]">{team.teeTime}</p>
                    </div>
                    <div className="max-w-28 rounded-sm border border-[var(--brand-green)]/20 px-2 py-1 text-right">
                      <div className="text-[9px] font-black uppercase text-[var(--brand-green)]">
                        Captain
                      </div>
                      <div className="truncate text-xs font-black">{captain.name}</div>
                    </div>
                  </div>
                  <p className="mt-2 text-sm text-[var(--muted)]">
                    {team.players.map((player) => player.name).join(", ")}
                  </p>
                </div>
              );
            })}
          </div>
        </Section>

        <Section title="Contest Winners">
          <div className="space-y-2">
            {event.holes
              .filter((hole) => hole.sideGame)
              .map((hole) => {
                const winner = proxyWinners.find((item) => item.hole === hole.number);

                return (
                  <div
                    key={hole.number}
                    className="grid grid-cols-[48px_minmax(0,1fr)] gap-3 rounded-md border border-[var(--line)] bg-[var(--paper)] p-3"
                  >
                    <div className="flex size-12 items-center justify-center rounded-md bg-[var(--flag-red)] font-display text-xl font-semibold text-white">
                      {hole.number}
                    </div>
                    <div className="min-w-0">
                      <div className="font-black">
                        {hole.sideGame ? formatSideGame(hole.sideGame) : hole.label}
                      </div>
                      <div className="text-sm text-[var(--muted)]">
                        {winner
                          ? `${winner.playerName} - ${winner.measuredDistance} ${winner.unit}`
                          : "No winner entered yet"}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </Section>

        <Section title="Fun Stats">
          <StatGrid>
            {funStats.map((stat) => (
              <StatTile key={stat.label} label={stat.label} value={stat.value} />
            ))}
          </StatGrid>
        </Section>
      </ScreenBody>
    </>
  );
}

function ScoreDatum({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-right">
      <div className="text-[9px] font-black uppercase text-[var(--brand-green)]">{label}</div>
      <div className="font-display text-xl font-semibold leading-none">{value}</div>
    </div>
  );
}

function MoneyCell({ label, value }: { label: string; value: string }) {
  const isPositive = value.startsWith("+");
  const isNegative = value.startsWith("-");

  return (
    <div className="text-right">
      <div className="text-[9px] font-black uppercase text-[var(--brand-green)]">{label}</div>
      <div
        className={`font-black ${
          isPositive
            ? "text-[var(--brand-green)]"
            : isNegative
              ? "text-[var(--flag-red)]"
              : "text-[var(--ink)]"
        }`}
      >
        {value}
      </div>
    </div>
  );
}
