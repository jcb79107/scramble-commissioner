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

  it("builds public fun stats from event data", () => {
    const stats = getFunStats(chevyChaseSeed);

    expect(stats.map((stat) => stat.label)).toContain("Scorecards in");
    expect(stats.map((stat) => stat.label)).toContain("Proxy winners");
  });
});
