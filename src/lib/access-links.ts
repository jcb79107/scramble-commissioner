import type { AccessRole, ScrambleEvent } from "./types";

export type WorkspaceView = "commissioner" | "scorecard" | "proxy" | "leaderboard" | "money";

export type AccessResolution = {
  role: AccessRole;
  teamId: string | null;
  token: string | null;
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
  href: string;
};

export const PRODUCTION_ORIGIN = "https://scramble-commissioner.vercel.app";

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
    return validAccess("commissioner", token);
  }

  if (token === event.proxyToken) {
    return validAccess("proxy_marker", token);
  }

  if (token === event.publicToken) {
    return validAccess("public_viewer", token);
  }

  const team = event.teams.find((item) => item.accessToken === token);

  if (team) {
    return validAccess("team_scorer", token, team.id);
  }

  return publicAccess(token, false, "token");
}

export function getDefaultViewForAccess(access: AccessResolution): WorkspaceView {
  switch (access.role) {
    case "commissioner":
      return "commissioner";
    case "team_scorer":
      return "scorecard";
    case "proxy_marker":
      return "proxy";
    case "public_viewer":
      return "leaderboard";
  }
}

export function canAccessView(access: AccessResolution, view: WorkspaceView) {
  if (access.role === "commissioner") {
    return true;
  }

  if (access.role === "team_scorer") {
    return view === "scorecard" || view === "leaderboard";
  }

  if (access.role === "proxy_marker") {
    return view === "proxy" || view === "leaderboard";
  }

  return view === "leaderboard";
}

export function getRoleLabel(access: AccessResolution) {
  switch (access.role) {
    case "commissioner":
      return "Commissioner";
    case "team_scorer":
      return "Team scorer";
    case "proxy_marker":
      return "Proxy marker";
    case "public_viewer":
      return access.source === "default_public" ? "Public leaderboard" : "Public viewer";
  }
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

export function buildAccessUrl(origin: string | null | undefined, token: string) {
  const url = new URL("/", normalizeOrigin(origin));
  url.searchParams.set("access", token);

  return url.toString();
}

export function buildPrivateAccessLinks(
  event: ScrambleEvent,
  origin: string | null | undefined,
): PrivateAccessLink[] {
  return [
    {
      id: "commissioner",
      label: "Commissioner controls",
      description: "Full event desk",
      role: "commissioner",
      teamId: null,
      href: buildAccessUrl(origin, event.commissionerToken),
    },
    {
      id: "proxy-marker",
      label: "Proxy marker",
      description: "Closest-to-pin and long-drive entry",
      role: "proxy_marker",
      teamId: null,
      href: buildAccessUrl(origin, event.proxyToken),
    },
    {
      id: "public-viewer",
      label: "Public leaderboard",
      description: "Leaderboard-only viewer",
      role: "public_viewer",
      teamId: null,
      href: buildAccessUrl(origin, event.publicToken),
    },
    ...event.teams.map((team) => ({
      id: team.id,
      label: team.name,
      description: `${team.teeTime} scorecard`,
      role: "team_scorer" as const,
      teamId: team.id,
      href: buildAccessUrl(origin, team.accessToken),
    })),
  ];
}

function validAccess(
  role: AccessRole,
  token: string,
  teamId: string | null = null,
): AccessResolution {
  return {
    role,
    teamId,
    token,
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
    teamId: null,
    token: isValid ? token : null,
    isValid,
    invalidToken: isValid ? null : token,
    source,
  };
}
