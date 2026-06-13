import { chevyChaseSeed } from "./chevy-chase-seed";
import type { ScrambleEvent } from "./types";

const DEFAULT_OWNER = "jcb79107";
const DEFAULT_REPO = "scramble-commissioner";
const DEFAULT_VARIABLE_NAME = "SCRAMBLE_LIVE_EVENT";
const GITHUB_API_VERSION = "2022-11-28";
const MAX_VARIABLE_BYTES = 48_000;

type GitHubVariable = {
  name: string;
  value: string;
};

type StoreResult<T> = {
  ok: boolean;
  message: string;
  data?: T;
};

export function isGitHubEventStoreConfigured() {
  return Boolean(getGitHubConfig().token);
}

export async function getGitHubStoredEvent() {
  if (!isGitHubEventStoreConfigured()) {
    return null;
  }

  try {
    const variable = await readGitHubVariable();

    if (!variable) {
      return chevyChaseSeed;
    }

    return normalizeStoredEvent(JSON.parse(variable.value));
  } catch {
    return chevyChaseSeed;
  }
}

export async function mutateGitHubStoredEvent(
  mutator: (event: ScrambleEvent) => ScrambleEvent | void,
): Promise<StoreResult<ScrambleEvent>> {
  if (!isGitHubEventStoreConfigured()) {
    return {
      ok: false,
      message: "Live storage is not configured. Nothing was saved.",
    };
  }

  try {
    const existingVariable = await readGitHubVariable();
    const current = existingVariable
      ? normalizeStoredEvent(JSON.parse(existingVariable.value))
      : chevyChaseSeed;
    const draft = cloneEvent(current);
    const nextEvent = mutator(draft) ?? draft;
    const normalizedEvent = normalizeStoredEvent(nextEvent);
    const value = JSON.stringify(normalizedEvent);
    const size = new TextEncoder().encode(value).length;

    if (size > MAX_VARIABLE_BYTES) {
      return {
        ok: false,
        message: "Live event data is too large for the GitHub fallback store.",
      };
    }

    await writeGitHubVariable(value, Boolean(existingVariable));

    return {
      ok: true,
      message: "Saved to live event store.",
      data: normalizedEvent,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Live event store failed.",
    };
  }
}

function normalizeStoredEvent(value: unknown): ScrambleEvent {
  const event = isObject(value) ? (value as Partial<ScrambleEvent>) : {};

  return {
    ...chevyChaseSeed,
    ...event,
    teams: event.teams?.length ? event.teams : chevyChaseSeed.teams,
    holes: chevyChaseSeed.holes,
    scores: event.scores?.length ? event.scores : chevyChaseSeed.scores,
    proxyEntries: event.proxyEntries ?? [],
    money: {
      ...chevyChaseSeed.money,
      ...event.money,
    },
    rules: event.rules?.length ? event.rules : chevyChaseSeed.rules,
  };
}

function cloneEvent(event: ScrambleEvent): ScrambleEvent {
  return JSON.parse(JSON.stringify(event)) as ScrambleEvent;
}

async function readGitHubVariable() {
  const config = getGitHubConfig();
  const response = await githubFetch(
    `/repos/${config.owner}/${config.repo}/actions/variables/${config.variableName}`,
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await formatGitHubError(response));
  }

  return (await response.json()) as GitHubVariable;
}

async function writeGitHubVariable(value: string, exists: boolean) {
  const config = getGitHubConfig();
  const response = await githubFetch(
    exists
      ? `/repos/${config.owner}/${config.repo}/actions/variables/${config.variableName}`
      : `/repos/${config.owner}/${config.repo}/actions/variables`,
    {
      method: exists ? "PATCH" : "POST",
      body: JSON.stringify({
        name: config.variableName,
        value,
      }),
    },
  );

  if (!response.ok) {
    throw new Error(await formatGitHubError(response));
  }
}

async function githubFetch(path: string, init: RequestInit = {}) {
  const config = getGitHubConfig();

  if (!config.token) {
    throw new Error("GitHub event store token is missing.");
  }

  return fetch(`https://api.github.com${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${config.token}`,
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": GITHUB_API_VERSION,
      ...init.headers,
    },
  });
}

async function formatGitHubError(response: Response) {
  const text = await response.text();
  return `GitHub live store error (${response.status}): ${text}`;
}

function getGitHubConfig() {
  return {
    token: process.env.SCRAMBLE_GITHUB_TOKEN,
    owner: process.env.SCRAMBLE_GITHUB_OWNER ?? DEFAULT_OWNER,
    repo: process.env.SCRAMBLE_GITHUB_REPO ?? DEFAULT_REPO,
    variableName: process.env.SCRAMBLE_GITHUB_STATE_VARIABLE ?? DEFAULT_VARIABLE_NAME,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
