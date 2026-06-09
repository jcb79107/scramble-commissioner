import { describe, expect, it } from "vitest";
import {
  buildLeaderboard,
  getPlayerBalances,
  getProxyPot,
  getProxyWinners,
} from "./calculations";
import { chevyChaseSeed } from "./chevy-chase-seed";
import type { ScrambleEvent } from "./types";

function withCompleteScores(event: ScrambleEvent): ScrambleEvent {
  return {
    ...event,
    scores: event.scores.map((score) => ({
      ...score,
      strokes: score.teamId === "team-950" ? 3 : 4,
    })),
  };
}

describe("scramble calculations", () => {
  it("sorts complete leaderboards by lowest score", () => {
    const event = withCompleteScores(chevyChaseSeed);

    const leaderboard = buildLeaderboard(event);

    expect(leaderboard[0]).toMatchObject({
      teamId: "team-950",
      total: 54,
      holesComplete: 18,
      thru: "F",
    });
  });

  it("selects closest-to-pin winners by smallest measured distance", () => {
    const event: ScrambleEvent = {
      ...chevyChaseSeed,
      proxyEntries: [
        {
          id: "entry-1",
          kind: "closest_to_pin",
          hole: 6,
          playerId: "jason-baer",
          measuredDistance: 8.5,
          unit: "feet",
          isValid: true,
        },
        {
          id: "entry-2",
          kind: "closest_to_pin",
          hole: 6,
          playerId: "michael-levin",
          measuredDistance: 4.2,
          unit: "feet",
          isValid: true,
        },
      ],
    };

    expect(getProxyWinners(event)).toContainEqual({
      kind: "closest_to_pin",
      hole: 6,
      playerId: "michael-levin",
      playerName: "Michael Levin",
      measuredDistance: 4.2,
      unit: "feet",
    });
  });

  it("selects long-drive winners by largest measured distance", () => {
    const event: ScrambleEvent = {
      ...chevyChaseSeed,
      proxyEntries: [
        {
          id: "entry-1",
          kind: "long_drive",
          hole: 2,
          playerId: "jason-baer",
          measuredDistance: 284,
          unit: "yards",
          isValid: true,
        },
        {
          id: "entry-2",
          kind: "long_drive",
          hole: 2,
          playerId: "ryan-rabin",
          measuredDistance: 301,
          unit: "yards",
          isValid: true,
        },
      ],
    };

    expect(getProxyWinners(event)).toContainEqual({
      kind: "long_drive",
      hole: 2,
      playerId: "ryan-rabin",
      playerName: "Ryan Rabin",
      measuredDistance: 301,
      unit: "yards",
    });
  });

  it("calculates buy-ins and winner payouts per player", () => {
    const event = withCompleteScores(chevyChaseSeed);
    const balances = getPlayerBalances(event);
    const jason = balances.find((balance) => balance.playerId === "jason-baer");

    expect(getProxyPot(event, "closest_to_pin")).toBe(90);
    expect(getProxyPot(event, "long_drive")).toBe(60);
    expect(jason).toMatchObject({
      buyInTotal: 65,
      payoutTotal: 150,
      net: 85,
    });
  });
});
