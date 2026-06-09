import type {
  LeaderboardRow,
  PlayerBalance,
  ProxyEntry,
  ProxyWinner,
  ScrambleEvent,
  SideGameKind,
} from "./types";

export function buildLeaderboard(event: ScrambleEvent): LeaderboardRow[] {
  return event.teams
    .map((team) => {
      const teamScores = event.scores.filter((score) => score.teamId === team.id);
      const completedScores = teamScores.filter(
        (score) => typeof score.strokes === "number",
      );
      const total = completedScores.reduce(
        (sum, score) => sum + (score.strokes ?? 0),
        0,
      );

      return {
        teamId: team.id,
        teamName: team.name,
        teeTime: team.teeTime,
        total,
        holesComplete: completedScores.length,
        thru: completedScores.length === 18 ? "F" : String(completedScores.length),
      };
    })
    .sort((a, b) => {
      if (a.holesComplete !== b.holesComplete) {
        return b.holesComplete - a.holesComplete;
      }

      if (a.total !== b.total) {
        return a.total - b.total;
      }

      return a.teeTime.localeCompare(b.teeTime);
    });
}

export function getProxyWinners(event: ScrambleEvent): ProxyWinner[] {
  const eligibleHoles = event.holes.filter((hole) => hole.sideGame);

  return eligibleHoles.flatMap((hole) => {
    const entries = event.proxyEntries.filter(
      (entry) =>
        entry.hole === hole.number &&
        entry.kind === hole.sideGame &&
        entry.isValid &&
        typeof entry.measuredDistance === "number",
    );

    const winner =
      hole.sideGame === "closest_to_pin"
        ? getClosestEntry(entries)
        : getLongestEntry(entries);

    if (!winner) {
      return [];
    }

    const player = findPlayer(event, winner.playerId);

    if (!player) {
      return [];
    }

    return [
      {
        kind: winner.kind,
        hole: winner.hole,
        playerId: winner.playerId,
        playerName: player.name,
        measuredDistance: winner.measuredDistance ?? 0,
        unit: winner.unit,
      },
    ];
  });
}

export function getPlayerBalances(event: ScrambleEvent): PlayerBalance[] {
  const leaderboard = buildLeaderboard(event);
  const winningTeamId =
    leaderboard[0]?.holesComplete === 18 ? leaderboard[0].teamId : null;
  const proxyWinners = getProxyWinners(event);
  const scramblePot = event.teams.reduce(
    (sum, team) => sum + team.players.length * event.money.scrambleBuyIn,
    0,
  );

  return event.teams.flatMap((team) =>
    team.players.map((player) => {
      const ctpBuyIn = player.sideGames.includes("closest_to_pin")
        ? event.money.closestToPinBuyInPerHole * getHoleCount(event, "closest_to_pin")
        : 0;
      const longDriveBuyIn = player.sideGames.includes("long_drive")
        ? event.money.longDriveBuyInPerHole * getHoleCount(event, "long_drive")
        : 0;
      const buyInTotal = event.money.scrambleBuyIn + ctpBuyIn + longDriveBuyIn;
      const teamPayout =
        team.id === winningTeamId ? scramblePot / team.players.length : 0;
      const proxyPayout = proxyWinners.reduce((sum, winner) => {
        if (winner.playerId !== player.id) {
          return sum;
        }

        return sum + getProxyPot(event, winner.kind) / getHoleCount(event, winner.kind);
      }, 0);
      const payoutTotal = teamPayout + proxyPayout;

      return {
        playerId: player.id,
        playerName: player.name,
        teamName: team.name,
        buyInTotal,
        payoutTotal,
        net: payoutTotal - buyInTotal,
        status: player.moneyStatus,
      };
    }),
  );
}

export function getProxyPot(event: ScrambleEvent, kind: SideGameKind) {
  const buyIn =
    kind === "closest_to_pin"
      ? event.money.closestToPinBuyInPerHole
      : event.money.longDriveBuyInPerHole;

  return event.teams.reduce(
    (sum, team) =>
      sum + team.players.filter((player) => player.sideGames.includes(kind)).length * buyIn,
    0,
  );
}

export function getHoleCount(event: ScrambleEvent, kind: SideGameKind) {
  return event.holes.filter((hole) => hole.sideGame === kind).length;
}

function findPlayer(event: ScrambleEvent, playerId: string) {
  return event.teams.flatMap((team) => team.players).find((player) => player.id === playerId);
}

function getClosestEntry(entries: ProxyEntry[]) {
  return entries
    .filter((entry) => typeof entry.measuredDistance === "number")
    .sort((a, b) => (a.measuredDistance ?? 0) - (b.measuredDistance ?? 0))[0];
}

function getLongestEntry(entries: ProxyEntry[]) {
  return entries
    .filter((entry) => typeof entry.measuredDistance === "number")
    .sort((a, b) => (b.measuredDistance ?? 0) - (a.measuredDistance ?? 0))[0];
}
