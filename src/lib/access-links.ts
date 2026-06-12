import type { AccessRole, ScrambleEvent, SideGameKind } from "./types";

export type AccessResolution = {
  role: AccessRole;
  token: string | null;
  teamId: string | null;
  holeNumber: number | null;
  sideGame: SideGameKind | null;
  isValid: boolean;
  invalidToken: string | null;
  source: "default_public" | "token";
};

export type PrivateAccessLink = {
  id: string;
  label: string;
  description: string;
  role: AccessRole;
  teamId: string | null;
  holeNumber: number | null;
  href: string;
};

export const PRODUCTION_ORIGIN = "https://scramble-commissioner.vercel.app";
export const ADMIN_PATH = "/admin";

export function normalizeAccessToken(
  value: string | string[] | null | undefined,
): string | null {
  const token = Array.isArray(value) ? value[0] : value;
  const normalized = token?.trim();

  return normalized ? normalized : null;
}

export function resolveAccessToken(
  event: ScrambleEvent,
  value: string | string[] | null | undefined,
): AccessResolution {
  const token = normalizeAccessToken(value);

  if (!token) {
    return publicAccess(null, true, "default_public");
  }

  if (token === event.commissionerToken) {
    return validAccess({ role: "commissioner", token });
  }

  if (token === event.proxyToken) {
    return validAccess({ role: "proxy_marker", token });
  }

  if (token === event.publicToken) {
    return validAccess({ role: "public_viewer", token });
  }

  const team = event.teams.find((item) => item.accessToken === token);

  if (team) {
    return validAccess({ role: "team_scorer", token, teamId: team.id });
  }

  const contestHole = event.holes.find((hole) => hole.contestAccessToken === token);

  if (contestHole?.sideGame) {
    return validAccess({
      role: "contest_marker",
      token,
      holeNumber: contestHole.number,
      sideGame: contestHole.sideGame,
    });
  }

  return publicAccess(token, false, "token");
}

export function getLegacyRedirectPath(event: ScrambleEvent, tokenValue: string | string[] | null | undefined) {
  const access = resolveAccessToken(event, tokenValue);

  if (!access.isValid) {
    return "/?invalid=1";
  }

  if (access.role === "team_scorer" && access.token) {
    return `/score/${encodeURIComponent(access.token)}`;
  }

  if (access.role === "contest_marker" && access.token) {
    return `/contest/${encodeURIComponent(access.token)}`;
  }

  if (access.role === "proxy_marker") {
    const firstContest = event.holes.find((hole) => hole.contestAccessToken);
    return firstContest?.contestAccessToken
      ? `/contest/${encodeURIComponent(firstContest.contestAccessToken)}`
      : "/";
  }

  if (access.role === "commissioner") {
    return ADMIN_PATH;
  }

  return "/";
}

export function normalizeOrigin(value: string | null | undefined) {
  const fallback = PRODUCTION_ORIGIN;
  const trimmed = value?.trim();

  if (!trimmed) {
    return fallback;
  }

  try {
    const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
    return new URL(candidate).origin;
  } catch {
    return fallback;
  }
}

export function buildPathUrl(origin: string | null | undefined, pathname: string) {
  return new URL(pathname, normalizeOrigin(origin)).toString();
}

export function buildScoreUrl(origin: string | null | undefined, token: string) {
  return buildPathUrl(origin, `/score/${encodeURIComponent(token)}`);
}

export function buildContestUrl(origin: string | null | undefined, token: string) {
  return buildPathUrl(origin, `/contest/${encodeURIComponent(token)}`);
}

export function buildAdminUrl(origin: string | null | undefined) {
  return buildPathUrl(origin, ADMIN_PATH);
}

export function buildPrivateAccessLinks(
  event: ScrambleEvent,
  origin: string | null | undefined,
): PrivateAccessLink[] {
  return [
    {
      id: "admin",
      label: "Admin HQ",
      description: "Password-protected event editing",
      role: "admin",
      teamId: null,
      holeNumber: null,
      href: buildAdminUrl(origin),
    },
    ...event.teams.map((team) => ({
      id: team.id,
      label: team.name,
      description: `${team.teeTime} scorecard`,
      role: "team_scorer" as const,
      teamId: team.id,
      holeNumber: null,
      href: buildScoreUrl(origin, team.accessToken),
    })),
    ...event.holes
      .filter((hole) => hole.sideGame && hole.contestAccessToken)
      .map((hole) => ({
        id: `contest-${hole.number}`,
        label: `Hole ${hole.number}`,
        description: hole.label ?? formatSideGame(hole.sideGame),
        role: "contest_marker" as const,
        teamId: null,
        holeNumber: hole.number,
        href: buildContestUrl(origin, hole.contestAccessToken ?? ""),
      })),
  ];
}

function validAccess({
  role,
  token,
  teamId = null,
  holeNumber = null,
  sideGame = null,
}: {
  role: AccessRole;
  token: string;
  teamId?: string | null;
  holeNumber?: number | null;
  sideGame?: SideGameKind | null;
}): AccessResolution {
  return {
    role,
    token,
    teamId,
    holeNumber,
    sideGame,
    isValid: true,
    invalidToken: null,
    source: "token",
  };
}

function publicAccess(
  token: string | null,
  isValid: boolean,
  source: AccessResolution["source"],
): AccessResolution {
  return {
    role: "public_viewer",
    token: isValid ? token : null,
    teamId: null,
    holeNumber: null,
    sideGame: null,
    isValid,
    invalidToken: isValid ? null : token,
    source,
  };
}

function formatSideGame(kind: SideGameKind | undefined) {
  return kind === "closest_to_pin" ? "Closest to the Pin" : "Long Drive";
}
