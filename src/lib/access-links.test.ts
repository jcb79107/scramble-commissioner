import { describe, expect, it } from "vitest";
import {
  buildAccessUrl,
  buildPrivateAccessLinks,
  canAccessView,
  normalizeAccessToken,
  resolveAccessToken,
} from "./access-links";
import { chevyChaseSeed } from "./chevy-chase-seed";

describe("access links", () => {
  it("defaults root visitors to the public leaderboard role", () => {
    const access = resolveAccessToken(chevyChaseSeed, null);

    expect(access).toMatchObject({
      role: "public_viewer",
      teamId: null,
      isValid: true,
      source: "default_public",
    });
  });

  it("resolves commissioner, proxy, public, and team scoring tokens", () => {
    expect(resolveAccessToken(chevyChaseSeed, chevyChaseSeed.commissionerToken)).toMatchObject({
      role: "commissioner",
      isValid: true,
    });
    expect(resolveAccessToken(chevyChaseSeed, chevyChaseSeed.proxyToken)).toMatchObject({
      role: "proxy_marker",
      isValid: true,
    });
    expect(resolveAccessToken(chevyChaseSeed, chevyChaseSeed.publicToken)).toMatchObject({
      role: "public_viewer",
      isValid: true,
    });
    expect(resolveAccessToken(chevyChaseSeed, "team-950-preview-token")).toMatchObject({
      role: "team_scorer",
      teamId: "team-950",
      isValid: true,
    });
  });

  it("falls invalid tokens back to public-only mode", () => {
    const access = resolveAccessToken(chevyChaseSeed, "bad-token");

    expect(access).toMatchObject({
      role: "public_viewer",
      teamId: null,
      isValid: false,
      invalidToken: "bad-token",
    });
    expect(canAccessView(access, "leaderboard")).toBe(true);
    expect(canAccessView(access, "commissioner")).toBe(false);
    expect(canAccessView(access, "scorecard")).toBe(false);
  });

  it("limits team and proxy links to their event-day views", () => {
    const teamAccess = resolveAccessToken(chevyChaseSeed, "team-930-preview-token");
    const proxyAccess = resolveAccessToken(chevyChaseSeed, chevyChaseSeed.proxyToken);

    expect(canAccessView(teamAccess, "scorecard")).toBe(true);
    expect(canAccessView(teamAccess, "leaderboard")).toBe(true);
    expect(canAccessView(teamAccess, "money")).toBe(false);
    expect(canAccessView(proxyAccess, "proxy")).toBe(true);
    expect(canAccessView(proxyAccess, "leaderboard")).toBe(true);
    expect(canAccessView(proxyAccess, "scorecard")).toBe(false);
  });

  it("normalizes query token inputs", () => {
    expect(normalizeAccessToken([" team-930-preview-token ", "ignored"])).toBe(
      "team-930-preview-token",
    );
    expect(normalizeAccessToken("   ")).toBeNull();
  });

  it("builds access urls from local, preview, and production origins", () => {
    expect(buildAccessUrl("http://localhost:3000", "abc")).toBe(
      "http://localhost:3000/?access=abc",
    );
    expect(buildAccessUrl("https://preview.vercel.app/", "abc")).toBe(
      "https://preview.vercel.app/?access=abc",
    );
    expect(buildAccessUrl("https://scramble-commissioner.vercel.app", "abc")).toBe(
      "https://scramble-commissioner.vercel.app/?access=abc",
    );
  });

  it("creates commissioner panel links for every operating role and team", () => {
    const links = buildPrivateAccessLinks(chevyChaseSeed, "https://preview.vercel.app");

    expect(links).toHaveLength(chevyChaseSeed.teams.length + 3);
    expect(links.find((link) => link.id === "commissioner")?.href).toBe(
      "https://preview.vercel.app/?access=commissioner-preview-token",
    );
    expect(links.filter((link) => link.role === "team_scorer").map((link) => link.teamId)).toEqual(
      chevyChaseSeed.teams.map((team) => team.id),
    );
  });
});
