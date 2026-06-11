import { describe, expect, it } from "vitest";
import { chevyChaseSeed } from "./chevy-chase-seed";
import { getEventStatus, getFunStats, getTeamCaptain } from "./event-summary";

describe("event summary", () => {
  it("uses the configured captain for a team", () => {
    const team = chevyChaseSeed.teams.find((item) => item.id === "team-950");

    expect(team && getTeamCaptain(team).name).toBe("AP");
  });

  it("reports pre-round status before scores are entered", () => {
    expect(getEventStatus(chevyChaseSeed)).toBe("Pre-round");
  });

  it("builds public fun stats from event data", () => {
    const stats = getFunStats(chevyChaseSeed);

    expect(stats.map((stat) => stat.label)).toContain("Scorecards in");
    expect(stats.map((stat) => stat.label)).toContain("Proxy winners");
  });
});
