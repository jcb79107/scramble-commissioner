import Image from "next/image";
import { buildLeaderboard, getPlayerBalances, getProxyWinners } from "@/lib/calculations";
import {
  formatMoney,
  formatSideGame,
  getEventStatus,
  getFunStats,
  getTeamCaptain,
} from "@/lib/event-summary";
import type { ScrambleEvent } from "@/lib/types";
import { RealtimeRefresh } from "./realtime-refresh";
import { Section, StatGrid, StatTile } from "./scramble-shell";

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
  const totalPot = balances.reduce((sum, balance) => sum + balance.buyInTotal, 0);

  return (
    <>
      <RealtimeRefresh eventId={event.id} />

      {invalidAccess && (
        <div className="rounded-2xl border border-[#f4b8b8] bg-[#fff1f1] px-4 py-3 text-sm font-medium text-[#a33b3b]">
          That private link is not active. You are viewing the public event board.
        </div>
      )}

      <section className="relative overflow-hidden rounded-[28px] border border-white/75 bg-white/88 p-4 shadow-[0_14px_34px_rgba(17,32,23,0.09)] backdrop-blur md:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <Image
              src="/brand/scramble-horizontal-left.png"
              alt="Scramble"
              width={3234}
              height={791}
              priority
              className="h-auto w-full max-w-[330px] object-contain"
            />
            <h1 className="mt-5 text-3xl font-semibold leading-tight text-[var(--pine)] md:text-4xl">
              Chevy Chase Scramble
            </h1>
            <p className="mt-2 text-sm font-medium leading-6 text-[var(--ink)]/66">
              {event.date} / {event.venue}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[var(--fairway)]/15 bg-[var(--sand)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--ink)]/64">
            {status}
          </span>
        </div>

        <div className="mt-5">
          <StatGrid>
            <StatTile
              label="Leader"
              value={leaderboard[0]?.holesComplete ? leaderboard[0].teamName : "TBD"}
            />
            <StatTile label="Pot" value={`$${totalPot}`} />
            <StatTile label="Teams" value={event.teams.length} />
            <StatTile label="Players" value={balances.length} />
          </StatGrid>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <AnchorButton href="#leaderboard">Leaderboard</AnchorButton>
          <AnchorButton href="#money">Money</AnchorButton>
          <AnchorButton href="#teams">Teams</AnchorButton>
          <AnchorButton href="#contests">Contests</AnchorButton>
        </div>
      </section>

      <Section
        id="leaderboard"
        title="Leaderboard"
        eyebrow="Live board"
        action={
          <span className="rounded-full bg-[#fff4d8] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#8a6b08]">
            {status}
          </span>
        }
      >
        <div className="overflow-hidden rounded-[22px] border border-[var(--mist)] bg-white">
          <div className="grid grid-cols-[54px_minmax(0,1fr)_64px_64px] bg-[var(--sand)] px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fairway)]/68">
            <span>Pos</span>
            <span>Team</span>
            <span className="text-right">Thru</span>
            <span className="text-right">Total</span>
          </div>
          <div className="divide-y divide-[var(--mist)]">
            {leaderboard.map((row, index) => (
              <article
                key={row.teamId}
                className="grid min-h-16 grid-cols-[54px_minmax(0,1fr)_64px_64px] items-center gap-0 px-3 py-3"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--pine)] text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-[var(--ink)]">{row.teamName}</p>
                  <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fairway)]/58">
                    {row.teeTime}
                  </p>
                </div>
                <p className="text-right text-lg font-semibold text-[var(--ink)]">{row.thru}</p>
                <p className="text-right text-lg font-semibold text-[var(--ink)]">
                  {row.holesComplete ? row.total : "-"}
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="money"
        title="Winners & Wagers"
        eyebrow="Full ledger"
        action={
          <span className="rounded-full bg-[#e3f1ea] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#174f38]">
            {positiveBalances.length ? `${positiveBalances.length} up` : "Pre-round"}
          </span>
        }
      >
        <p className="mb-4 text-sm leading-6 text-[var(--ink)]/70">
          Every player buy-in, payout, and net position is public here.
        </p>
        <div className="overflow-hidden rounded-[22px] border border-[var(--mist)] bg-white">
          <div className="grid grid-cols-[minmax(0,1fr)_54px_64px_64px] bg-[var(--sand)] px-3 py-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fairway)]/68">
            <span>Player</span>
            <span className="text-right">In</span>
            <span className="text-right">Paid</span>
            <span className="text-right">Net</span>
          </div>
          <div className="divide-y divide-[var(--mist)]">
            {balances
              .slice()
              .sort((a, b) => b.net - a.net)
              .map((balance) => (
                <article
                  key={balance.playerId}
                  className="grid min-h-16 grid-cols-[minmax(0,1fr)_54px_64px_64px] items-center gap-0 px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ink)]">
                      {balance.playerName}
                    </p>
                    <p className="mt-1 truncate text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fairway)]/58">
                      {balance.teamName}
                    </p>
                  </div>
                  <MoneyValue value={`$${balance.buyInTotal}`} />
                  <MoneyValue value={`$${balance.payoutTotal}`} />
                  <MoneyValue value={formatMoney(balance.net)} strong />
                </article>
              ))}
          </div>
        </div>
      </Section>

      <Section id="teams" title="Teams & Captains" eyebrow="Pairings">
        <div className="grid gap-3">
          {event.teams.map((team) => {
            const captain = getTeamCaptain(team);

            return (
              <article
                key={team.id}
                className="rounded-[22px] border border-[var(--mist)] bg-white px-4 py-4 shadow-[0_10px_24px_rgba(17,32,23,0.06)]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-semibold text-[var(--ink)]">{team.name}</h3>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--fairway)]/58">
                      {team.teeTime}
                    </p>
                  </div>
                  <span className="max-w-36 truncate rounded-full bg-[var(--sand)] px-3 py-1.5 text-xs font-semibold text-[var(--ink)]/78">
                    Captain: {captain.name}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6 text-[var(--ink)]/70">
                  {team.players.map((player) => player.name).join(" / ")}
                </p>
              </article>
            );
          })}
        </div>
      </Section>

      <Section id="contests" title="Contest Winners" eyebrow="Proxies and long drive">
        <div className="grid gap-3">
          {event.holes
            .filter((hole) => hole.sideGame)
            .map((hole) => {
              const winner = proxyWinners.find((item) => item.hole === hole.number);

              return (
                <article
                  key={hole.number}
                  className="grid grid-cols-[56px_minmax(0,1fr)_auto] items-center gap-3 rounded-[22px] border border-[var(--mist)] bg-white px-3 py-3"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--pine)] text-lg font-semibold text-white">
                    {hole.number}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ink)]">
                      {hole.sideGame ? formatSideGame(hole.sideGame) : hole.label}
                    </p>
                    <p className="mt-1 truncate text-xs text-[var(--ink)]/58">
                      {winner ? `${winner.playerName} / ${winner.measuredDistance} ${winner.unit}` : "No entry yet"}
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--sand)] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--fairway)]/68">
                    {winner ? "Leader" : "Open"}
                  </span>
                </article>
              );
            })}
        </div>
      </Section>

      <Section id="stats" title="Fun Stats" eyebrow="Tournament pulse">
        <div className="grid grid-cols-2 gap-2">
          {funStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[18px] border border-[var(--mist)] bg-white px-3 py-3"
            >
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--fairway)]/62">
                {stat.label}
              </p>
              <p className="mt-1 truncate text-2xl font-semibold leading-none text-[var(--ink)]">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

function AnchorButton({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={href}
      className="flex min-h-12 items-center justify-center rounded-[18px] bg-[var(--pine)] px-3 text-center text-sm font-semibold text-white shadow-[0_10px_18px_rgba(17,32,23,0.16)]"
    >
      {children}
    </a>
  );
}

function MoneyValue({ value, strong = false }: { value: string; strong?: boolean }) {
  const isPositive = value.startsWith("+");
  const isNegative = value.startsWith("-");

  return (
    <p
      className={`text-right text-sm ${strong ? "font-semibold" : "font-medium"} ${
        isPositive
          ? "text-[var(--fairway)]"
          : isNegative
            ? "text-[#a33b3b]"
            : "text-[var(--ink)]/76"
      }`}
    >
      {value}
    </p>
  );
}
