import { revalidatePath } from "next/cache";
import { nanoid } from "nanoid";
import { ADMIN_PATH, resolveAccessToken } from "./access-links";
import { chevyChaseSeed } from "./chevy-chase-seed";
import {
  getGitHubStoredEvent,
  mutateGitHubStoredEvent,
} from "./github-event-store";
import { createServerSupabaseClient } from "./supabase";
import type {
  HoleConfig,
  MoneyStatus,
  Player,
  ProxyEntry,
  ScrambleEvent,
  SideGameKind,
  Team,
  TeamScore,
} from "./types";

type StoreResult<T> = {
  ok: boolean;
  message: string;
  data?: T;
};

type EventRow = {
  id: string;
  name: string;
  event_date: string;
  venue: string;
  address: string | null;
  round_cost_estimate: number | string;
  scramble_buy_in: number | string;
  closest_to_pin_buy_in_per_hole: number | string;
  long_drive_buy_in_per_hole: number | string;
};

type AccessLinkRow = {
  role: string;
  token: string;
  team_id: string | null;
  hole_number?: number | null;
  side_game?: SideGameKind | null;
};

type TeamRow = {
  id: string;
  name: string;
  tee_time: string | null;
  captain_player_id?: string | null;
};

type PlayerRow = {
  id: string;
  team_id: string;
  name: string;
  money_status: MoneyStatus;
};

type PlayerSideGameRow = {
  player_id: string;
  kind: SideGameKind;
};

type HoleRow = {
  number: number;
  par: number | null;
  tee_yardage: number | null;
  side_game: SideGameKind | null;
  label: string | null;
};

type ScoreRow = {
  team_id: string;
  hole_number: number;
  strokes: number | null;
};

type ProxyEntryRow = {
  id: string;
  hole_number: number;
  kind: SideGameKind;
  player_id: string;
  measured_distance: number | string | null;
  unit: "feet" | "yards";
  is_valid: boolean;
  note: string | null;
};

export async function getActiveEvent(): Promise<ScrambleEvent> {
  const client = createServerSupabaseClient();

  if (!client) {
    return (await getGitHubStoredEvent()) ?? chevyChaseSeed;
  }

  try {
    const event = await fetchSupabaseEvent(client);
    return event ?? chevyChaseSeed;
  } catch {
    return chevyChaseSeed;
  }
}

export async function submitTeamScores(
  token: string,
  scoresByHole: Record<number, number | null>,
): Promise<StoreResult<null>> {
  const event = await getActiveEvent();
  const access = resolveAccessToken(event, token);

  if (!access.isValid || access.role !== "team_scorer" || !access.teamId) {
    return { ok: false, message: "Invalid team scoring link." };
  }

  const client = createServerSupabaseClient();

  if (!client) {
    const result = await mutateGitHubStoredEvent((draft) => {
      for (const [hole, strokes] of Object.entries(scoresByHole)) {
        upsertTeamScore(draft, access.teamId!, Number(hole), strokes);
      }
    });

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidateScorePaths(token);
    return { ok: true, message: "Scores saved.", data: null };
  }

  const rows = Object.entries(scoresByHole).map(([hole, strokes]) => ({
    event_id: event.id,
    team_id: access.teamId,
    hole_number: Number(hole),
    strokes,
  }));

  const { error } = await client
    .from("scores")
    .upsert(rows, { onConflict: "team_id,hole_number" });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateScorePaths(token);
  return { ok: true, message: "Scores saved.", data: null };
}

export async function submitContestEntry(
  token: string,
  playerId: string,
  measuredDistance: number,
  isValid: boolean,
): Promise<StoreResult<null>> {
  const event = await getActiveEvent();
  const access = resolveAccessToken(event, token);

  if (
    !access.isValid ||
    access.role !== "contest_marker" ||
    !access.holeNumber ||
    !access.sideGame
  ) {
    return { ok: false, message: "Invalid contest link." };
  }

  const eligiblePlayer = event.teams
    .flatMap((team) => team.players)
    .find((player) => player.id === playerId && player.sideGames.includes(access.sideGame!));

  if (!eligiblePlayer || !Number.isFinite(measuredDistance) || measuredDistance <= 0) {
    return { ok: false, message: "Contest entry is incomplete." };
  }

  const client = createServerSupabaseClient();

  if (!client) {
    const result = await mutateGitHubStoredEvent((draft) => {
      draft.proxyEntries.push({
        id: `entry-${Date.now()}-${nanoid(8)}`,
        playerId,
        hole: access.holeNumber!,
        kind: access.sideGame!,
        measuredDistance,
        unit: access.sideGame === "closest_to_pin" ? "feet" : "yards",
        isValid,
      });
    });

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidateContestPaths(token);
    return { ok: true, message: "Contest entry saved.", data: null };
  }

  const { error } = await client.from("proxy_entries").insert({
    event_id: event.id,
    player_id: playerId,
    hole_number: access.holeNumber,
    kind: access.sideGame,
    measured_distance: measuredDistance,
    unit: access.sideGame === "closest_to_pin" ? "feet" : "yards",
    is_valid: isValid,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateContestPaths(token);
  return { ok: true, message: "Contest entry saved.", data: null };
}

export async function updateEventDetails(formData: FormData) {
  const event = await getActiveEvent();
  const client = createServerSupabaseClient();

  if (!client) {
    const result = await mutateGitHubStoredEvent((draft) => {
      draft.name = String(formData.get("name") ?? event.name);
      draft.date = String(formData.get("date") ?? event.date);
      draft.venue = String(formData.get("venue") ?? event.venue);
      draft.address = String(formData.get("address") ?? event.address);
    });

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidateAllEventPaths();
    return { ok: true, message: "Event details saved.", data: null } satisfies StoreResult<null>;
  }

  const { error } = await client
      .from("events")
      .update({
        name: String(formData.get("name") ?? event.name),
        event_date: String(formData.get("date") ?? event.date),
        venue: String(formData.get("venue") ?? event.venue),
        address: String(formData.get("address") ?? event.address),
      })
      .eq("id", event.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAllEventPaths();
  return { ok: true, message: "Event details saved.", data: null };
}

export async function updateMoneySettings(formData: FormData) {
  const event = await getActiveEvent();
  const client = createServerSupabaseClient();

  if (!client) {
    const result = await mutateGitHubStoredEvent((draft) => {
      draft.money = {
        roundCostEstimate: Number(formData.get("roundCostEstimate") ?? event.money.roundCostEstimate),
        scrambleBuyIn: Number(formData.get("scrambleBuyIn") ?? event.money.scrambleBuyIn),
        closestToPinBuyInPerHole: Number(
          formData.get("closestToPinBuyInPerHole") ?? event.money.closestToPinBuyInPerHole,
        ),
        longDriveBuyInPerHole: Number(
          formData.get("longDriveBuyInPerHole") ?? event.money.longDriveBuyInPerHole,
        ),
      };
    });

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidateAllEventPaths();
    return { ok: true, message: "Money settings saved.", data: null } satisfies StoreResult<null>;
  }

  const { error } = await client
      .from("events")
      .update({
        round_cost_estimate: Number(formData.get("roundCostEstimate") ?? event.money.roundCostEstimate),
        scramble_buy_in: Number(formData.get("scrambleBuyIn") ?? event.money.scrambleBuyIn),
        closest_to_pin_buy_in_per_hole: Number(
          formData.get("closestToPinBuyInPerHole") ?? event.money.closestToPinBuyInPerHole,
        ),
        long_drive_buy_in_per_hole: Number(
          formData.get("longDriveBuyInPerHole") ?? event.money.longDriveBuyInPerHole,
        ),
      })
      .eq("id", event.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAllEventPaths();
  return { ok: true, message: "Money settings saved.", data: null };
}

export async function updateTeamDetails(formData: FormData) {
  const client = createServerSupabaseClient();
  const teamId = String(formData.get("teamId") ?? "");

  if (!teamId) {
    return { ok: false, message: "Team id is missing." };
  }

  if (!client) {
    const result = await mutateGitHubStoredEvent((draft) => {
      const team = draft.teams.find((item) => item.id === teamId);

      if (!team) {
        return;
      }

      team.name = String(formData.get("name") ?? team.name);
      team.teeTime = String(formData.get("teeTime") ?? team.teeTime);
      team.captainPlayerId = String(formData.get("captainPlayerId") ?? team.captainPlayerId);
    });

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidateAllEventPaths();
    return { ok: true, message: "Team details saved.", data: null } satisfies StoreResult<null>;
  }

  const { error } = await client
      .from("teams")
      .update({
        name: String(formData.get("name") ?? ""),
        tee_time: normalizeTime(String(formData.get("teeTime") ?? "")),
        captain_player_id: String(formData.get("captainPlayerId") ?? ""),
      })
      .eq("id", teamId);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAllEventPaths();
  return { ok: true, message: "Team details saved.", data: null };
}

export async function updateScoreOverride(formData: FormData) {
  const event = await getActiveEvent();
  const client = createServerSupabaseClient();
  const teamId = String(formData.get("teamId") ?? "");
  const hole = Number(formData.get("hole"));
  const strokesValue = String(formData.get("strokes") ?? "");
  const strokes = strokesValue ? Number(strokesValue) : null;

  if (!teamId || !Number.isInteger(hole)) {
    return { ok: false, message: "Team and hole are required." };
  }

  if (!client) {
    const result = await mutateGitHubStoredEvent((draft) => {
      upsertTeamScore(draft, teamId, hole, strokes);
    });

    if (!result.ok) {
      return { ok: false, message: result.message };
    }

    revalidateAllEventPaths();
    return { ok: true, message: "Score override saved.", data: null } satisfies StoreResult<null>;
  }

  const { error } = await client.from("scores").upsert(
      {
        event_id: event.id,
        team_id: teamId,
        hole_number: hole,
        strokes,
      },
      { onConflict: "team_id,hole_number" },
    );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidateAllEventPaths();
  return { ok: true, message: "Score override saved.", data: null };
}

function revalidateScorePaths(token: string) {
  revalidatePath("/");
  revalidatePath(`/score/${token}`);
}

function revalidateContestPaths(token: string) {
  revalidatePath("/");
  revalidatePath(`/contest/${token}`);
}

function revalidateAllEventPaths() {
  revalidatePath("/");
  revalidatePath(ADMIN_PATH);
}

function upsertTeamScore(
  event: ScrambleEvent,
  teamId: string,
  hole: number,
  strokes: number | null,
) {
  const existingScore = event.scores.find(
    (score) => score.teamId === teamId && score.hole === hole,
  );

  if (existingScore) {
    existingScore.strokes = strokes;
    return;
  }

  event.scores.push({
    teamId,
    hole,
    strokes,
  });
}

async function fetchSupabaseEvent(client: ReturnType<typeof createServerSupabaseClient>) {
  if (!client) {
    return null;
  }

  const { data: eventRows, error: eventError } = await client
    .from("events")
    .select("*")
    .order("event_date", { ascending: false })
    .limit(1);

  if (eventError) {
    throw eventError;
  }

  const eventRow = eventRows?.[0] as EventRow | undefined;

  if (!eventRow) {
    return null;
  }

  const [teamsResult, playersResult, sideGamesResult, holesResult, scoresResult, entriesResult, linksResult] =
    await Promise.all([
      client.from("teams").select("*").eq("event_id", eventRow.id).order("display_order"),
      client.from("players").select("*").order("display_order"),
      client.from("player_side_games").select("*"),
      client.from("holes").select("*").eq("event_id", eventRow.id).order("number"),
      client.from("scores").select("*").eq("event_id", eventRow.id),
      client.from("proxy_entries").select("*").eq("event_id", eventRow.id),
      client.from("access_links").select("*").eq("event_id", eventRow.id),
    ]);

  const teamRows = (teamsResult.data ?? []) as TeamRow[];
  const playerRows = (playersResult.data ?? []) as PlayerRow[];
  const sideGameRows = (sideGamesResult.data ?? []) as PlayerSideGameRow[];
  const holeRows = (holesResult.data ?? []) as HoleRow[];
  const scoreRows = (scoresResult.data ?? []) as ScoreRow[];
  const entryRows = (entriesResult.data ?? []) as ProxyEntryRow[];
  const linkRows = (linksResult.data ?? []) as AccessLinkRow[];

  const teams: Team[] = teamRows.map((team) => {
    const teamAccessToken =
      linkRows.find((link) => link.role === "team_scorer" && link.team_id === team.id)?.token ??
      team.id;
    const players: Player[] = playerRows
      .filter((player) => player.team_id === team.id)
      .map((player) => ({
        id: player.id,
        name: player.name,
        moneyStatus: player.money_status,
        sideGames: sideGameRows
          .filter((sideGame) => sideGame.player_id === player.id)
          .map((sideGame) => sideGame.kind),
      }));

    return {
      id: team.id,
      name: team.name,
      teeTime: formatDbTime(team.tee_time),
      accessToken: teamAccessToken,
      captainPlayerId: team.captain_player_id ?? players[0]?.id,
      players,
    };
  });

  const holes: HoleConfig[] = holeRows.map((hole) => {
    const contestToken =
      linkRows.find(
        (link) =>
          link.role === "contest_marker" &&
          link.hole_number === hole.number &&
          link.side_game === hole.side_game,
      )?.token ?? undefined;

    return {
      number: hole.number,
      par: hole.par ?? undefined,
      teeYardage: hole.tee_yardage ?? undefined,
      sideGame: hole.side_game ?? undefined,
      label: hole.label ?? undefined,
      contestAccessToken: contestToken,
    };
  });

  const scores: TeamScore[] = teams.flatMap((team) =>
    holes.map((hole) => {
      const score = scoreRows.find(
        (item) => item.team_id === team.id && item.hole_number === hole.number,
      );

      return {
        teamId: team.id,
        hole: hole.number,
        strokes: score?.strokes ?? null,
      };
    }),
  );

  const proxyEntries: ProxyEntry[] = entryRows.map((entry) => ({
    id: entry.id,
    hole: entry.hole_number,
    kind: entry.kind,
    playerId: entry.player_id,
    measuredDistance:
      entry.measured_distance === null ? null : Number(entry.measured_distance),
    unit: entry.unit,
    isValid: entry.is_valid,
    note: entry.note ?? undefined,
  }));

  return {
    id: eventRow.id,
    name: eventRow.name,
    date: eventRow.event_date,
    venue: eventRow.venue,
    address: eventRow.address ?? "",
    commissionerToken:
      linkRows.find((link) => link.role === "commissioner")?.token ??
      chevyChaseSeed.commissionerToken,
    publicToken:
      linkRows.find((link) => link.role === "public_viewer")?.token ??
      chevyChaseSeed.publicToken,
    proxyToken:
      linkRows.find((link) => link.role === "proxy_marker")?.token ??
      chevyChaseSeed.proxyToken,
    teams,
    holes,
    scores,
    proxyEntries,
    money: {
      roundCostEstimate: Number(eventRow.round_cost_estimate),
      scrambleBuyIn: Number(eventRow.scramble_buy_in),
      closestToPinBuyInPerHole: Number(eventRow.closest_to_pin_buy_in_per_hole),
      longDriveBuyInPerHole: Number(eventRow.long_drive_buy_in_per_hole),
    },
    rules: chevyChaseSeed.rules,
  } satisfies ScrambleEvent;
}

function formatDbTime(value: string | null) {
  if (!value) {
    return "";
  }

  const [hoursValue = "0", minutesValue = "00"] = value.split(":");
  const hours = Number(hoursValue);
  const minutes = minutesValue.padStart(2, "0").slice(0, 2);
  const suffix = hours >= 12 ? "PM" : "AM";
  const hour12 = hours % 12 || 12;

  return `${hour12}:${minutes} ${suffix}`;
}

function normalizeTime(value: string) {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i);

  if (!match) {
    return value;
  }

  let hours = Number(match[1]);
  const minutes = match[2];
  const suffix = match[3]?.toUpperCase();

  if (suffix === "PM" && hours < 12) {
    hours += 12;
  }

  if (suffix === "AM" && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, "0")}:${minutes}:00`;
}
