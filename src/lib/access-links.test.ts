import { describe, expect, it } from "vitest";
import {
  buildContestUrl,
  buildPrivateAccessLinks,
  buildScoreUrl,
  getLegacyRedirectPath,
  normalizeAccessToken,
  resolveAccessToken,
} from "./access-links";
import { chevyChaseSeed } from "./chevy-chase-seed";

describe("access links", () => {
  it("defaults root visitors to public access", () => {
    expect(resolveAccessToken(chevyChaseSeed, null)).toMatchObject({
      role: "public_viewer",
      teamId: null,
      holeNumber: null,
      isValid: true,
      source: "default_public",
    });
  });

  it("resolves team scoring and contest marker tokens", () => {
    expect(resolveAccessToken(chevyChaseSeed, "team-950-preview-token")).toMatchObject({
      role: "team_scorer",
      teamId: "team-950",
      isValid: true,
    });

    expect(resolveAccessToken(chevyChaseSeed, "contest-hole-6-preview-token")).toMatchObject({
      role: "contest_marker",
      holeNumber: 6,
      sideGame: "closest_to_pin",
      isValid: true,
    });
  });

  it("falls invalid tokens back to public mode", () => {
    expect(resolveAccessToken(chevyChaseSeed, "bad-token")).toMatchObject({
      role: "public_viewer",
      isValid: false,
      invalidToken: "bad-token",
    });
  });

  it("normalizes query token inputs", () => {
    expect(normalizeAccessToken([" team-930-preview-token ", "ignored"])).toBe(
      "team-930-preview-token",
    );
    expect(normalizeAccessToken("   ")).toBeNull();
  });

  it("builds clean path urls", () => {
    expect(buildScoreUrl("http://localhost:3000", "abc")).toBe(
      "http://localhost:3000/score/abc",
    );
    expect(buildContestUrl("https://preview.vercel.app/", "hole-6")).toBe(
      "https://preview.vercel.app/contest/hole-6",
    );
  });

  it("creates admin, team, and contest private links", () => {
    const links = buildPrivateAccessLinks(chevyChaseSeed, "https://preview.vercel.app");

    expect(links.find((link) => link.id === "admin")?.href).toBe(
      "https://preview.vercel.app/admin",
    );
    expect(links.filter((link) => link.role === "team_scorer")).toHaveLength(
      chevyChaseSeed.teams.length,
    );
    expect(links.filter((link) => link.role === "contest_marker")).toHaveLength(8);
  });

  it("redirects legacy query tokens into clean routes", () => {
    expect(getLegacyRedirectPath(chevyChaseSeed, "team-950-preview-token")).toBe(
      "/score/team-950-preview-token",
    );
    expect(getLegacyRedirectPath(chevyChaseSeed, "contest-hole-6-preview-token")).toBe(
      "/contest/contest-hole-6-preview-token",
    );
    expect(getLegacyRedirectPath(chevyChaseSeed, chevyChaseSeed.commissionerToken)).toBe(
      "/admin",
    );
    expect(getLegacyRedirectPath(chevyChaseSeed, "bad-token")).toBe("/?invalid=1");
  });
});
