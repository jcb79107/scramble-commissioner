import { describe, expect, it } from "vitest";
import { chevyChaseSeed } from "./chevy-chase-seed";
import { getEventStatus, getFunStats, getTeamCaptain } from "./event-summary";

describe("event summary", () => {
  it("uses the configured captain for a team", () => {
    const team = chevyChaseSeed.teams.find((item) => item.id === "team-950");

    expect(team && getTeamCaptain(team).name).toBe("Ross Agins");
  });

  it("labels seed teams by captain last name", () => {
    expect(chevyChaseSeed.teams.map((team) => team.name)).toEqual([
      "Team Grant",
      "Team Weinberger",
      "Team Agins",
      "Team Abrahams",
      "Team Daitch",
      "Team Rabin",
    ]);
  });

  it("reports pre-round status before scores are entered", () => {
    expect(getEventStatus(chevyChaseSeed)).toBe("Pre-round");
  });

  it("seeds a complete par-72 scorecard", () => {
    expect(chevyChaseSeed.holes).toHaveLength(18);
    expect(chevyChaseSeed.holes.every((hole) => typeof hole.par === "number")).toBe(
      true,
    );
    expect(chevyChaseSeed.holes.reduce((sum, hole) => sum + (hole.par ?? 0), 0)).toBe(
      72,
    );
  });

  it("seeds Burnt Red tee yardages for every hole", () => {
    expect(chevyChaseSeed.venue).toBe("Traditions at Chevy Chase");
    expect(chevyChaseSeed.holes.map((hole) => hole.teeYardage)).toEqual([
      359,
      453,
      379,
      485,
      406,
      117,
      336,
      375,
      157,
      369,
      322,
      405,
      156,
      319,
      484,
      132,
      307,
      517,
    ]);
    expect(
      chevyChaseSeed.holes.reduce((sum, hole) => sum + (hole.teeYardage ?? 0), 0),
    ).toBe(6078);
  });

  it("keeps event contest holes aligned to the final sheet", () => {
    expect(
      chevyChaseSeed.holes
        .filter((hole) => hole.sideGame === "closest_to_pin")
        .map((hole) => [hole.number, hole.teeYardage]),
    ).toEqual([
      [6, 117],
      [9, 157],
      [13, 156],
      [16, 132],
    ]);
    expect(
      chevyChaseSeed.holes
        .filter((hole) => hole.sideGame === "long_drive")
        .map((hole) => hole.number),
    ).toEqual([2, 4, 15, 18]);
  });

  it("builds public fun stats from event data", () => {
    const stats = getFunStats(chevyChaseSeed);

    expect(stats.map((stat) => stat.label)).toContain("Scorecards in");
    expect(stats.map((stat) => stat.label)).toContain("Proxy winners");
  });
});
