import { buildLeaderboard, getPlayerBalances, getProxyWinners } from "./calculations";
import type { Player, ScrambleEvent, SideGameKind, Team } from "./types";

export type FunStat = {
  label: string;
  value: string;
};

export function getTeamCaptain(team: Team): Player {
  return (
    team.players.find((player) => player.id === team.captainPlayerId) ??
    team.players[0]
  );
}

export function getEventStatus(event: ScrambleEvent) {
  const completedScores = event.scores.filter((score) => score.strokes !== null).length;
  const totalScores = event.scores.length;

  if (completedScores === 0) {
    return "Pre-round";
  }

  if (completedScores === totalScores) {
    return "Final";
  }

  return "Live";
}

export function getFunStats(event: ScrambleEvent): FunStat[] {
  const leaderboard = buildLeaderboard(event);
  const balances = getPlayerBalances(event);
  const proxyWinners = getProxyWinners(event);
  const completedScores = event.scores.filter((score) => score.strokes !== null);
  const biggestWinner = [...balances].sort((a, b) => b.net - a.net)[0];
  const biggestSwing = [...balances].sort((a, b) => Math.abs(b.net) - Math.abs(a.net))[0];
  const leadTeam = leaderboard[0];

  return [
    {
      label: "Scorecards in",
      value: `${completedScores.length}/${event.scores.length}`,
    },
    {
      label: "Team to catch",
      value: leadTeam?.holesComplete ? leadTeam.teamName : "TBD",
    },
    {
      label: "Proxy winners",
      value: `${proxyWinners.length}/${getContestHoles(event).length}`,
    },
    {
      label: "Biggest winner",
      value: biggestWinner && biggestWinner.net > 0 ? biggestWinner.playerName : "TBD",
    },
    {
      label: "Biggest swing",
      value: biggestSwing ? `${biggestSwing.playerName} ${formatMoney(biggestSwing.net)}` : "TBD",
    },
  ];
}

export function getContestHoles(event: ScrambleEvent) {
  return event.holes.filter((hole) => hole.sideGame);
}

export function getEligibleContestPlayers(event: ScrambleEvent, kind: SideGameKind) {
  return event.teams
    .flatMap((team) => team.players)
    .filter((player) => player.sideGames.includes(kind));
}

export function formatMoney(value: number) {
  const sign = value > 0 ? "+" : value < 0 ? "-" : "";
  return `${sign}$${Math.abs(value)}`;
}

export function formatSideGame(kind: SideGameKind) {
  return kind === "closest_to_pin" ? "Closest to the Pin" : "Long Drive";
}
